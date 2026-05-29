import { NextRequest, NextResponse } from "next/server";
import { createPortalServerClient } from "@/lib/supabase/portal-server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate via portal session
    const portalClient = await createPortalServerClient();
    const {
      data: { user },
    } = await portalClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
    }

    const db = createServerClient();

    // 2. Load buyer
    const { data: buyer } = await db
      .from("buyers")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!buyer || !buyer.is_active) {
      return NextResponse.json({ error: "Käufer nicht gefunden" }, { status: 404 });
    }

    const body = await req.json();
    const { lead_id } = body as { lead_id: string };
    if (!lead_id) {
      return NextResponse.json({ error: "lead_id fehlt" }, { status: 400 });
    }

    // 3. Load lead
    const { data: lead } = await db
      .from("leads")
      .select("*")
      .eq("id", lead_id)
      .single();

    if (!lead) {
      return NextResponse.json({ error: "Lead nicht gefunden" }, { status: 404 });
    }
    if (!lead.marketplace_available) {
      return NextResponse.json(
        { error: "Lead nicht mehr verfügbar" },
        { status: 409 }
      );
    }

    // 4. Check already purchased
    const { data: existing } = await db
      .from("lead_assignments")
      .select("id")
      .eq("lead_id", lead_id)
      .eq("buyer_id", buyer.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Lead bereits gekauft" }, { status: 409 });
    }

    // 5. Determine price (lead-specific → buyer-specific → grade-based default)
    const { data: settingsRows } = await db
      .from("portal_settings")
      .select("key, value");

    const settings = Object.fromEntries(
      (settingsRows ?? []).map((r: { key: string; value: string }) => [r.key, r.value])
    );

    let price: number;
    if (lead.marketplace_price) {
      price = lead.marketplace_price;
    } else if (buyer.custom_lead_price) {
      price = buyer.custom_lead_price;
    } else {
      const grade = lead.quality_grade;
      if (grade === "A") price = parseInt(settings.lead_price_grade_a ?? "7500");
      else if (grade === "B") price = parseInt(settings.lead_price_grade_b ?? "5000");
      else price = parseInt(settings.lead_price_grade_c ?? "2500");
    }

    // 6. Check balance
    if (buyer.prepaid_balance < price) {
      return NextResponse.json(
        {
          error: "insufficient_balance",
          balance: buyer.prepaid_balance,
          price,
        },
        { status: 402 }
      );
    }

    // 7. Execute the three writes (best-effort "transaction")
    const [assignResult, balanceResult, leadResult] = await Promise.all([
      db.from("lead_assignments").insert({
        lead_id,
        buyer_id: buyer.id,
        status: "new",
        price_paid: price,
      }),
      db
        .from("buyers")
        .update({ prepaid_balance: buyer.prepaid_balance - price })
        .eq("id", buyer.id),
      db
        .from("leads")
        .update({ marketplace_available: false })
        .eq("id", lead_id),
    ]);

    if (assignResult.error || balanceResult.error || leadResult.error) {
      console.error(
        "[purchase-lead] write error:",
        assignResult.error,
        balanceResult.error,
        leadResult.error
      );
      return NextResponse.json(
        { error: "Kaufvorgang fehlgeschlagen" },
        { status: 500 }
      );
    }

    // 8. Return full lead + updated balance
    return NextResponse.json({
      success: true,
      lead,
      new_balance: buyer.prepaid_balance - price,
    });
  } catch (err) {
    console.error("[purchase-lead] unhandled:", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
