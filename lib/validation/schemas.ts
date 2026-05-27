import { z } from "zod";

export const step1Schema = z.object({
  housing_type: z.enum(["owner_house", "owner_apartment", "tenant"]),
});

export const step2Schema = z.object({
  annual_consumption: z.enum(["under_3000", "3000_5000", "5000_8000", "over_8000", "unknown"]),
});

export const step3Schema = z.object({
  roof_orientation: z.enum(["south", "east_west", "north", "unknown"]),
});

export const step4Schema = z.object({
  timeframe: z.enum(["immediate", "1_3_months", "3_6_months", "info_only"]),
});

export const step5Schema = z.object({
  postal_code: z
    .string()
    .regex(/^\d{5}$/, "Bitte eine gültige 5-stellige PLZ eingeben"),
  city: z.string().optional(),
});

export const step6Schema = z.object({
  first_name: z.string().min(1, "Vorname ist erforderlich"),
  last_name: z.string().min(1, "Nachname ist erforderlich"),
  phone: z
    .string()
    .min(6, "Telefonnummer ist erforderlich")
    .regex(
      /^[\+\d][\d\s\-\(\)]{5,25}$/,
      "Bitte eine gültige Telefonnummer eingeben"
    ),
  email: z.string().email("Bitte eine gültige E-Mail-Adresse eingeben"),
  consent_owner_adult: z.literal(true, { error: "Zustimmung erforderlich" }),
  consent_data_sharing: z.literal(true, { error: "Zustimmung erforderlich" }),
  consent_privacy: z.literal(true, { error: "Zustimmung erforderlich" }),
});

export const leadSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema)
  .merge(step6Schema);

// street is solar-check only — not in the base schema but added to the type
// so email/scoring helpers can reference it without breaking the standard funnel.
export type LeadFormData = z.infer<typeof leadSchema> & { street?: string };

// ─── Solar-Check extended schemas ───────────────────────────────────────────

export const scBuildingSchema = z.object({
  building_type: z.enum(["single_family", "semi_detached", "multi_family", "commercial"]),
  roof_type: z.enum(["gable", "flat", "pent", "hip", "unknown"]),
});

export const scHeatingSchema = z.object({
  heating_type: z.enum(["gas", "oil", "district", "heat_pump", "electric", "other"]),
});

export const scFinanceSchema = z.object({
  financing_type: z.enum(["cash", "financing", "leasing", "unknown"]),
  previous_consultation: z.enum(["none", "want_second", "had_offer"]),
});

export const scTimeframeMotivationSchema = z.object({
  timeframe: z.enum(["immediate", "1_3_months", "3_6_months", "info_only"]),
  motivations: z
    .array(z.enum(["cost", "independence", "environment", "property_value", "storage"]))
    .min(1, "Bitte wähle mindestens eine Motivation")
    .max(2, "Maximal 2 Motivationen"),
});

// Solar-check collects a full address (street required, city required)
export const scLocationSchema = z.object({
  street:      z.string().min(3, "Bitte Straße und Hausnummer eingeben"),
  postal_code: z.string().regex(/^\d{5}$/, "Bitte eine gültige 5-stellige PLZ eingeben"),
  city:        z.string().min(1, "Ort ist erforderlich"),
});

export const solarCheckLeadSchema = step1Schema
  .merge(scBuildingSchema)
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(scHeatingSchema)
  .merge(scFinanceSchema)
  .merge(scTimeframeMotivationSchema)
  .merge(scLocationSchema)   // full address instead of step5Schema
  .merge(step6Schema);

export type SolarCheckLeadData = z.infer<typeof solarCheckLeadSchema>;
