"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import type { LeadStatus } from "./types";

const db = () => createServerClient();

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
  // Upsert: if assignment already exists for this lead+buyer, skip
  const { error } = await db()
    .from("lead_assignments")
    .upsert(
      { lead_id: leadId, buyer_id: buyerId, status: "new" },
      { onConflict: "lead_id,buyer_id" }
    );
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

  // Create auth user with service role (admin API)
  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const authRes = await fetch(
    `${serviceUrl}/auth/v1/admin/users`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
      }),
    }
  );

  if (!authRes.ok) {
    const err = await authRes.json();
    throw new Error(err.message ?? "Fehler beim Anlegen des Auth-Users");
  }

  const { user: newUser } = await authRes.json();

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
