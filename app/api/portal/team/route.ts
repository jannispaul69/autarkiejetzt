import { NextResponse } from "next/server";
import { createPortalServerClient } from "@/lib/supabase/portal-server";
import { createServerClient } from "@/lib/supabase/server";

/** GET /api/portal/team — returns team members for the current buyer */
export async function GET() {
  const auth = await createPortalServerClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createServerClient();
  const { data: buyer } = await db.from("buyers").select("id").eq("user_id", user.id).single();
  if (!buyer) return NextResponse.json([], { status: 200 });

  const { data: team } = await db
    .from("buyer_team")
    .select("*")
    .eq("buyer_id", buyer.id)
    .order("created_at", { ascending: true });

  return NextResponse.json(team ?? []);
}
