import { NextResponse } from "next/server";
import { createPortalServerClient } from "@/lib/supabase/portal-server";
import { createServerClient } from "@/lib/supabase/server";

/** GET /api/portal/me — returns the current buyer's profile */
export async function GET() {
  const auth = await createPortalServerClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createServerClient();
  const { data } = await db.from("buyers").select("*").eq("user_id", user.id).single();
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

/** PATCH /api/portal/me — update own buyer profile */
export async function PATCH(req: Request) {
  const auth = await createPortalServerClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  // Only allow safe fields
  const allowed = ["notification_email", "notify_immediately", "notify_daily_summary"];
  const update = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  );
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const db = createServerClient();
  const { error } = await db.from("buyers").update(update).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
