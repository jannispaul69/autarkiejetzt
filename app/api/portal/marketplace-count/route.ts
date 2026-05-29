import { NextResponse } from "next/server";
import { createPortalServerClient } from "@/lib/supabase/portal-server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const portalClient = await createPortalServerClient();
    const {
      data: { user },
    } = await portalClient.auth.getUser();
    if (!user) return NextResponse.json({ count: 0 });

    const db = createServerClient();
    const { data: buyer } = await db
      .from("buyers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!buyer) return NextResponse.json({ count: 0 });

    // Lead IDs already purchased by this buyer
    const { data: purchased } = await db
      .from("lead_assignments")
      .select("lead_id")
      .eq("buyer_id", buyer.id);

    const purchasedIds = (purchased ?? []).map(
      (p: { lead_id: string }) => p.lead_id
    );

    // Count all marketplace-available leads
    const { data: all } = await db
      .from("leads")
      .select("id")
      .eq("marketplace_available", true);

    const purchasedSet = new Set(purchasedIds);
    const count = (all ?? []).filter((l: { id: string }) => !purchasedSet.has(l.id)).length;

    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
