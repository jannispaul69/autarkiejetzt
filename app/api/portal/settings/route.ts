import { NextRequest, NextResponse } from "next/server";
import { createPortalServerClient } from "@/lib/supabase/portal-server";
import { createServerClient } from "@/lib/supabase/server";

async function assertAdmin() {
  const auth = await createPortalServerClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return null;
  const db = createServerClient();
  const { data } = await db.from("buyers").select("role").eq("user_id", user.id).single();
  return data?.role === "admin" ? user : null;
}

/** GET /api/portal/settings — returns key→value map */
export async function GET() {
  const user = await assertAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createServerClient();
  const { data } = await db.from("portal_settings").select("key, value");
  const map = Object.fromEntries((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));
  return NextResponse.json(map);
}

/** PATCH /api/portal/settings — update one setting */
export async function PATCH(req: NextRequest) {
  const user = await assertAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { key, value } = body as { key?: string; value?: string };
  if (!key || typeof value !== "string") {
    return NextResponse.json({ error: "key and value required" }, { status: 400 });
  }

  const db = createServerClient();
  const { error } = await db
    .from("portal_settings")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("key", key);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
