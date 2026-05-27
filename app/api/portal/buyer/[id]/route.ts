import { NextRequest, NextResponse } from "next/server";
import { getBuyerById } from "@/lib/portal/data";
import { createPortalServerClient } from "@/lib/supabase/portal-server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Verify caller is an admin
  const auth = await createPortalServerClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createServerClient();
  const { data: callerBuyer } = await db
    .from("buyers")
    .select("role")
    .eq("user_id", user.id)
    .single();
  if (!callerBuyer || callerBuyer.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await getBuyerById(id);
  return NextResponse.json(result);
}
