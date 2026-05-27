"use server";

import { createServerClient as createServiceClient } from "@/lib/supabase/server";
import { createPortalServerClient } from "@/lib/supabase/portal-server";
import type { Buyer, AssignedLead, PortalSetting, DailyCount } from "./types";

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

/** Portal settings as key→value map. */
export async function getPortalSettings(): Promise<Record<string, string>> {
  const db = createServiceClient();
  const { data } = await db.from("portal_settings").select("key, value");
  return Object.fromEntries(
    (data ?? []).map((r: { key: string; value: string }) => [r.key, r.value])
  );
}

/** All portal settings rows with metadata. */
export async function getPortalSettingsRows(): Promise<PortalSetting[]> {
  const db = createServiceClient();
  const { data } = await db
    .from("portal_settings")
    .select("*")
    .order("key");
  return (data as PortalSetting[]) ?? [];
}

/** Admin-wide stats: today, this week, total, monthly revenue. */
export async function getAdminStats() {
  const db = createServiceClient();
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [{ data: leads }, { data: assignments }, { data: buyers }] = await Promise.all([
    db.from("leads").select("id, created_at"),
    db.from("lead_assignments").select("id, status, price_paid, created_at"),
    db.from("buyers").select("id, is_active"),
  ]);

  const leadsAll = leads ?? [];
  const asgAll = assignments ?? [];
  const buyersAll = buyers ?? [];

  return {
    leadsToday:    leadsAll.filter((l) => new Date(l.created_at) >= todayStart).length,
    leadsThisWeek: leadsAll.filter((l) => new Date(l.created_at) >= weekStart).length,
    leadsTotal:    leadsAll.length,
    activeBuyers:  buyersAll.filter((b) => b.is_active).length,
    monthlyRevenue: asgAll
      .filter((a) => new Date(a.created_at) >= monthStart)
      .reduce((sum, a) => sum + (a.price_paid ?? 0), 0),
    unassignedCount: leadsAll.length - asgAll.filter((a, i, arr) =>
      arr.findIndex((b) => b.id === a.id) === i
    ).length,
  };
}

/** Daily lead counts for the last N days (for charts). */
export async function getDailyLeadsForBuyer(buyerId: string, days = 14): Promise<DailyCount[]> {
  const db = createServiceClient();
  const since = new Date();
  since.setDate(since.getDate() - days + 1);
  since.setHours(0, 0, 0, 0);

  const { data } = await db
    .from("lead_assignments")
    .select("created_at, status")
    .eq("buyer_id", buyerId)
    .gte("created_at", since.toISOString());

  const result: DailyCount[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayRows = (data ?? []).filter((r) => r.created_at.slice(0, 10) === dateStr);
    result.push({
      date: dateStr,
      received: dayRows.length,
      closed: dayRows.filter((r) => r.status === "closed_won").length,
    });
  }
  return result;
}

/** Daily lead counts for admin (all leads, last N days). */
export async function getDailyLeadsAdmin(days = 30): Promise<DailyCount[]> {
  const db = createServiceClient();
  const since = new Date();
  since.setDate(since.getDate() - days + 1);
  since.setHours(0, 0, 0, 0);

  const { data } = await db
    .from("leads")
    .select("created_at")
    .gte("created_at", since.toISOString());

  const result: DailyCount[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const count = (data ?? []).filter((r) => r.created_at.slice(0, 10) === dateStr).length;
    result.push({ date: dateStr, received: count, closed: 0 });
  }
  return result;
}

/** Last 10 assignment activities (for admin). */
export async function getRecentAssignments(limit = 10): Promise<AssignedLead[]> {
  const db = createServiceClient();
  const { data } = await db
    .from("lead_assignments")
    .select("*, leads(*), buyers(id, company_name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as AssignedLead[]) ?? [];
}

/** Unassigned leads (no entry in lead_assignments). */
export async function getUnassignedLeads() {
  const db = createServiceClient();
  const [{ data: leads }, { data: assigned }] = await Promise.all([
    db.from("leads").select("*").order("created_at", { ascending: false }),
    db.from("lead_assignments").select("lead_id"),
  ]);
  const assignedIds = new Set((assigned ?? []).map((a) => a.lead_id));
  return (leads ?? []).filter((l) => !assignedIds.has(l.id));
}

/** Extended buyer stats for detail page. */
export async function getBuyerDetailStats(buyerId: string) {
  const db = createServiceClient();
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const { data } = await db
    .from("lead_assignments")
    .select("status, created_at, leads(quality_score), price_paid")
    .eq("buyer_id", buyerId);

  const rows = data ?? [];
  const scores = rows
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((r) => ((r as any).leads as { quality_score: number | null } | null)?.quality_score ?? null)
    .filter((s): s is number => s !== null);

  return {
    total:       rows.length,
    thisWeek:    rows.filter((r) => new Date(r.created_at) >= weekStart).length,
    thisMonth:   rows.filter((r) => new Date(r.created_at) >= monthStart).length,
    closedWon:   rows.filter((r) => r.status === "closed_won").length,
    closeRate:   rows.length > 0
      ? Math.round((rows.filter((r) => r.status === "closed_won").length / rows.length) * 100)
      : 0,
    avgScore:    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null,
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
