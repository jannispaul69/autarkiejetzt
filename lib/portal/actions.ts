"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase/server";
import type { LeadStatus } from "./types";

const db = () => createServerClient();

/** Admin client with service role — required for auth.admin.* calls */
const adminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

// ---------------------------------------------------------------------------
// Assignment mutations (buyer)
// ---------------------------------------------------------------------------

export async function updateAssignmentStatus(
  assignmentId: string,
  status: LeadStatus,
  reclaimReason?: string
) {
  const update: Record<string, unknown> = { status };
  if (status === "reclaimed") {
    update.reclaim_reason = reclaimReason ?? null;
    update.reclaimed_at = new Date().toISOString();
  }
  const { error } = await db()
    .from("lead_assignments")
    .update(update)
    .eq("id", assignmentId);
  if (error) throw new Error(error.message);
  revalidatePath("/portal/leads");
}

export async function updateAssignmentNotes(
  assignmentId: string,
  notes: string
) {
  const { error } = await db()
    .from("lead_assignments")
    .update({ notes })
    .eq("id", assignmentId);
  if (error) throw new Error(error.message);
}

export async function updateAssignmentFollowup(
  assignmentId: string,
  nextFollowup: string | null
) {
  const { error } = await db()
    .from("lead_assignments")
    .update({ next_followup: nextFollowup })
    .eq("id", assignmentId);
  if (error) throw new Error(error.message);
  revalidatePath("/portal/leads");
}

// ---------------------------------------------------------------------------
// Admin: lead assignment
// ---------------------------------------------------------------------------

export async function assignLeadToBuyer(leadId: string, buyerId: string) {
  const supabase = db();

  // Check if this lead+buyer combination already exists — no unique constraint
  // in the DB so we can't rely on ON CONFLICT
  const { data: existing } = await supabase
    .from("lead_assignments")
    .select("id")
    .eq("lead_id", leadId)
    .eq("buyer_id", buyerId)
    .maybeSingle();

  if (existing) {
    // Already assigned — nothing to do
    revalidatePath("/portal/admin/leads");
    return;
  }

  const { error } = await supabase
    .from("lead_assignments")
    .insert({ lead_id: leadId, buyer_id: buyerId, status: "new" });

  if (error) throw new Error(error.message);
  revalidatePath("/portal/admin/leads");
}

// ---------------------------------------------------------------------------
// Admin: buyer management
// ---------------------------------------------------------------------------

export async function createBuyer(formData: FormData) {
  const company_name = formData.get("company_name") as string;
  const contact_name = formData.get("contact_name") as string;
  const email = formData.get("email") as string;
  const phone = (formData.get("phone") as string) || null;
  const postal_codes_raw = (formData.get("postal_codes") as string) || "";
  const postal_codes = postal_codes_raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const lead_budget_per_week = parseInt(
    (formData.get("lead_budget_per_week") as string) || "10",
    10
  );
  const password = formData.get("password") as string;

  // Create auth user — requires service role key (auth.admin.* API)
  const { data: { user: newUser }, error: authError } =
    await adminClient().auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError || !newUser) {
    throw new Error(authError?.message ?? "Fehler beim Anlegen des Auth-Users");
  }

  const { error } = await db().from("buyers").insert({
    user_id: newUser.id,
    company_name,
    contact_name,
    email,
    phone,
    postal_codes: postal_codes.length ? postal_codes : null,
    lead_budget_per_week,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/portal/admin/buyers");
}

export async function updateBuyerBalance(buyerId: string, addCents: number) {
  // Fetch current balance
  const { data } = await db()
    .from("buyers")
    .select("prepaid_balance")
    .eq("id", buyerId)
    .single();
  const current = (data as { prepaid_balance: number } | null)?.prepaid_balance ?? 0;

  const { error } = await db()
    .from("buyers")
    .update({ prepaid_balance: current + addCents })
    .eq("id", buyerId);
  if (error) throw new Error(error.message);
  revalidatePath(`/portal/admin/buyers/${buyerId}`);
}

export async function toggleBuyerActive(buyerId: string, isActive: boolean) {
  const { error } = await db()
    .from("buyers")
    .update({ is_active: isActive })
    .eq("id", buyerId);
  if (error) throw new Error(error.message);
  revalidatePath("/portal/admin/buyers");
}

export async function updateCustomLeadPrice(buyerId: string, priceCents: number | null) {
  const { error } = await db()
    .from("buyers")
    .update({ custom_lead_price: priceCents })
    .eq("id", buyerId);
  if (error) throw new Error(error.message);
  revalidatePath(`/portal/admin/buyers/${buyerId}`);
}

export async function updateBuyerNotifications(
  buyerId: string,
  data: {
    notification_email?: string | null;
    notify_immediately?: boolean;
    notify_daily_summary?: boolean;
  }
) {
  const { error } = await db().from("buyers").update(data).eq("id", buyerId);
  if (error) throw new Error(error.message);
  revalidatePath(`/portal/admin/buyers/${buyerId}`);
  revalidatePath("/portal/einstellungen");
}

// ---------------------------------------------------------------------------
// Admin: portal settings
// ---------------------------------------------------------------------------

export async function updatePortalSetting(key: string, value: string) {
  const { error } = await db()
    .from("portal_settings")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("key", key);
  if (error) throw new Error(error.message);
  revalidatePath("/portal/admin/settings");
}

// ---------------------------------------------------------------------------
// Bulk assignment status update
// ---------------------------------------------------------------------------

export async function bulkUpdateAssignmentStatus(
  assignmentIds: string[],
  status: LeadStatus
) {
  if (assignmentIds.length === 0) return;
  const { error } = await db()
    .from("lead_assignments")
    .update({ status })
    .in("id", assignmentIds);
  if (error) throw new Error(error.message);
  revalidatePath("/portal/leads");
  revalidatePath("/portal/admin/leads");
}

// ---------------------------------------------------------------------------
// Team invite
// ---------------------------------------------------------------------------

export async function inviteTeamMember(buyerId: string, email: string) {
  const { data: { user }, error: authError } = await adminClient().auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (authError || !user) throw new Error(authError?.message ?? "Fehler beim Einladen");

  const { error } = await db().from("buyer_team").insert({
    buyer_id: buyerId,
    user_id: user.id,
    email,
    name: email,
    role: "member",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/portal/einstellungen");
  revalidatePath(`/portal/admin/buyers/${buyerId}`);
}
