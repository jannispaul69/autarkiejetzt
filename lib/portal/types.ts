export type LeadStatus =
  | "new"
  | "contacted"
  | "appointment"
  | "closed_won"
  | "closed_lost"
  | "reclaimed";

export type BuyerRole = "buyer" | "admin";

export interface Buyer {
  id: string;
  created_at: string;
  user_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  postal_codes: string[] | null;
  lead_budget_per_week: number;
  prepaid_balance: number; // in Cent
  is_active: boolean;
  role: BuyerRole;
  // Extended fields
  custom_lead_price: number | null;
  notification_email: string | null;
  notify_immediately: boolean;
  notify_daily_summary: boolean;
}

export interface PortalSetting {
  key: string;
  value: string;
  label: string | null;
  description: string | null;
  updated_at: string;
}

export interface DailyCount {
  date: string; // "2025-01-15"
  received: number;
  closed: number;
}

export interface Lead {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  postal_code: string;
  city: string | null;
  street: string | null;
  landing_page: string | null;
  housing_type: string;
  annual_consumption: string;
  roof_orientation: string;
  timeframe: string;
  quality_score: number | null;
  quality_grade: string | null;
  status: string;
}

export interface LeadAssignment {
  id: string;
  created_at: string;
  lead_id: string;
  buyer_id: string;
  status: LeadStatus;
  notes: string | null;
  next_followup: string | null;
  reclaim_reason: string | null;
  reclaimed_at: string | null;
  price_paid: number | null;
}

/** Combined row returned when joining lead_assignments with leads */
export interface AssignedLead extends LeadAssignment {
  leads: Lead;
  buyers?: Pick<Buyer, "id" | "company_name" | "contact_name">;
}

export interface BuyerTeamMember {
  id: string;
  buyer_id: string;
  user_id: string;
  name: string;
  email: string;
  role: "owner" | "member";
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Neu",
  contacted: "Kontaktiert",
  appointment: "Termin",
  closed_won: "Abschluss",
  closed_lost: "Kein Abschluss",
  reclaimed: "Reklamiert",
};

export const RECLAIM_REASONS = [
  "Fake-Daten",
  "Nicht erreichbar (3x)",
  "Kein Eigentümer",
  "Minderjährig",
  "Sonstiges",
] as const;
