"use server";

import { createServerClient as createServiceClient } from "@/lib/supabase/server";
import { createPortalServerClient } from "@/lib/supabase/portal-server";
import type { Buyer, AssignedLead } from "./types";

/** Get the authenticated Supabase user (portal session). */
export async function getPortalUser() {
  const supabase = await createPortalServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

/** Get the buyer profile for the currently logged-in user. */
export async function getCurrentBuyer(): Promise<Buyer | null> {
  const user = await getPortalUser();
  if (!user) return null;

  const db = createServiceClient();
  const { data } = await db
    .from("buyers")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (data as Buyer) ?? null;
}

/** Get buyer's assigned leads, joined with lead data. */
export async function getBuyerLeads(buyerId: string): Promise<AssignedLead[]> {
  const db = createServiceClient();
  const { data } = await db
    .from("lead_assignments")
    .select("*, leads(*)")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });

  return (data as AssignedLead[]) ?? [];
}

/** Get a single assignment + lead for the detail view. */
export async function getAssignmentByLeadId(
  leadId: string,
  buyerId: string
): Promise<AssignedLead | null> {
  const db = createServiceClient();
  const { data } = await db
    .from("lead_assignments")
    .select("*, leads(*)")
    .eq("lead_id", leadId)
    .eq("buyer_id", buyerId)
    .single();

  return (data as AssignedLead) ?? null;
}

/** Admin: get ALL assignments joined with leads + buyer info. */
export async function getAllAssignments(): Promise<AssignedLead[]> {
  const db = createServiceClient();
  const { data } = await db
    .from("lead_assignments")
    .select("*, leads(*), buyers(id, company_name, contact_name)")
    .order("created_at", { ascending: false });

  return (data as AssignedLead[]) ?? [];
}

/** Admin: get all leads (returns assigned + unassigned separately). */
export async function getAllLeadsWithAssignment() {
  const db = createServiceClient();

  const [{ data: leads }, { data: assignments }] = await Promise.all([
    db.from("leads").select("*").order("created_at", { ascending: false }),
    db
      .from("lead_assignments")
      .select("lead_id, buyer_id, status, buyers(id, company_name)"),
  ]);

  const assignmentMap = new Map(
    (assignments ?? []).map((a) => [a.lead_id, a])
  );

  return (leads ?? []).map((lead) => ({
    lead,
    assignment: assignmentMap.get(lead.id) ?? null,
  }));
}

/** Admin: get all buyers. */
export async function getAllBuyers(): Promise<Buyer[]> {
  const db = createServiceClient();
  const { data } = await db
    .from("buyers")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Buyer[]) ?? [];
}

/** Admin: get one buyer with their team. */
export async function getBuyerById(id: string) {
  const db = createServiceClient();
  const [{ data: buyer }, { data: team }, { data: assignments }] =
    await Promise.all([
      db.from("buyers").select("*").eq("id", id).single(),
      db.from("buyer_team").select("*").eq("buyer_id", id),
      db
        .from("lead_assignments")
        .select("*, leads(*)")
        .eq("buyer_id", id)
        .order("created_at", { ascending: false }),
    ]);
  return {
    buyer: buyer as Buyer | null,
    team: team ?? [],
    assignments: (assignments as AssignedLead[]) ?? [],
  };
}

/** Dashboard stats for a buyer. */
export async function getBuyerStats(buyerId: string) {
  const db = createServiceClient();

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const { data: all } = await db
    .from("lead_assignments")
    .select("status, created_at")
    .eq("buyer_id", buyerId);

  const rows = all ?? [];
  return {
    thisWeek: rows.filter((r) => new Date(r.created_at) >= weekStart).length,
    open: rows.filter((r) => r.status === "new" || r.status === "contacted")
      .length,
    closedWon: rows.filter((r) => r.status === "closed_won").length,
    total: rows.length,
  };
}
