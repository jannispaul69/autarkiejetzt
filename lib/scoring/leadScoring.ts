import type { LeadFormData } from "@/lib/validation/schemas";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface LeadScore {
  total: number; // 0–100
  grade: "A" | "B" | "C";
  breakdown: {
    roof: number;              // max 25
    consumption: number;       // max 25
    timeframe: number;         // max 30
    location: number;          // max 10
    completeness: number;      // max 10
    financing_bonus?: number;  // max 10 (solar-check only)
    heating_bonus?: number;    // max 5  (solar-check only)
    address_bonus?: number;    // max 5  (solar-check only — full street address)
  };
  summary: string;
}

// Optional extra fields collected by the solar-check funnel
export interface ScoringExtras {
  financing_type?: string;
  heating_type?: string;
  street?: string;  // +5 when a full street address is provided
}

// ---------------------------------------------------------------------------
// Score tables
// ---------------------------------------------------------------------------

const FINANCING_BONUS: Record<string, number> = {
  cash: 10,
  financing: 6,
  leasing: 4,
  unknown: 2,
};

const ROOF_SCORES: Record<string, number> = {
  south: 25,
  east_west: 18,
  north: 8,
  unknown: 12,
};

const CONSUMPTION_SCORES: Record<string, number> = {
  over_8000: 25,
  "5000_8000": 22,
  "3000_5000": 16,
  under_3000: 8,
  unknown: 10,
};

const TIMEFRAME_SCORES: Record<string, number> = {
  immediate: 30,
  "1_3_months": 22,
  "3_6_months": 12,
  info_only: 4,
};

// ---------------------------------------------------------------------------
// Grade + summary
// ---------------------------------------------------------------------------
export function gradeFromTotal(total: number): "A" | "B" | "C" {
  if (total >= 80) return "A";
  if (total >= 55) return "B";
  return "C";
}

export const GRADE_SUMMARIES: Record<"A" | "B" | "C", string> = {
  A: "Hohe Abschlusswahrscheinlichkeit – sofort anrufen!",
  B: "Solider Lead mit gutem Potenzial.",
  C: "Eher informationssuchend, geringes Zeitfenster.",
};

// ---------------------------------------------------------------------------
// Main scoring function
// ---------------------------------------------------------------------------
export function scoreLeadData(data: LeadFormData, extras?: ScoringExtras): LeadScore {
  // Roof orientation (max 25)
  const roof = ROOF_SCORES[data.roof_orientation] ?? 12;

  // Annual consumption (max 25)
  const consumption = CONSUMPTION_SCORES[data.annual_consumption] ?? 10;

  // Timeframe / urgency (max 30)
  const timeframe = TIMEFRAME_SCORES[data.timeframe] ?? 4;

  // Completeness (max 10) — all five contact+location fields present
  const requiredFields: string[] = [
    data.first_name,
    data.last_name,
    data.phone,
    data.email,
    data.postal_code,
  ];
  const completeness = requiredFields.every((f) => f?.trim()) ? 10 : 5;

  // Region (max 10) — Bremen / Umland prefix 27xx or 28xx
  const prefix = (data.postal_code ?? "").slice(0, 2);
  const location = prefix === "27" || prefix === "28" ? 10 : 6;

  // Solar-check bonus: financing type (max 10)
  const financing_bonus = extras?.financing_type != null
    ? (FINANCING_BONUS[extras.financing_type] ?? 0)
    : 0;

  // Solar-check bonus: heating type — gas/oil cross-sell potential (max 5)
  const heating_bonus = extras?.heating_type != null
    ? (extras.heating_type === "gas" || extras.heating_type === "oil" ? 5 : 2)
    : 0;

  // Solar-check bonus: full street address provided — installer can pre-check via satellite (max 5)
  const address_bonus = extras?.street?.trim() ? 5 : 0;

  const total = Math.min(
    100,
    roof + consumption + timeframe + location + completeness + financing_bonus + heating_bonus + address_bonus,
  );
  const grade = gradeFromTotal(total);

  return {
    total,
    grade,
    breakdown: { roof, consumption, timeframe, location, completeness, financing_bonus, heating_bonus, address_bonus },
    summary: GRADE_SUMMARIES[grade],
  };
}
