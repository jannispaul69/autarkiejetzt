import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { normalizePhone } from "@/lib/twilio/client";
import { sendVerificationCode } from "@/lib/twilio/verify";
import { createServerClient } from "@/lib/supabase/server";

const schema = z.object({
  lead_id: z.string().uuid("Ungültige Lead-ID"),
  phone:   z.string().min(6, "Ungültige Telefonnummer"),
  channel: z.enum(["sms", "call"]).default("sms"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe" },
        { status: 400 },
      );
    }

    const { lead_id, phone, channel } = parsed.data;
    const normalizedPhone = normalizePhone(phone);

    const supabase = createServerClient();

    // 1. Check lead exists
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("id, phone_verified")
      .eq("id", lead_id)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: "Lead nicht gefunden" }, { status: 404 });
    }

    // 2. Already verified?
    if (lead.phone_verified) {
      return NextResponse.json({ already_verified: true });
    }

    // 3. Rate limit: max 3 sends per lead per hour
    const { count } = await supabase
      .from("phone_verifications")
      .select("*", { count: "exact", head: true })
      .eq("lead_id", lead_id)
      .gte("created_at", new Date(Date.now() - 3_600_000).toISOString());

    if ((count ?? 0) >= 3) {
      return NextResponse.json({ error: "rate_limit" }, { status: 429 });
    }

    // 4. Dispatch via Twilio Verify — code generated and sent internally
    await sendVerificationCode(normalizedPhone, channel);

    // 5. Record for rate limiting and audit (no code stored — Twilio manages it)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await supabase.from("phone_verifications").insert({
      lead_id,
      phone:      normalizedPhone,
      channel,
      expires_at: expiresAt,
    });

    return NextResponse.json({ success: true, channel, expires_in: 600 });
  } catch (err) {
    console.error("[verify/send] unhandled error:", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
