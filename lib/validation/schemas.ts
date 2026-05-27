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

export type LeadFormData = z.infer<typeof leadSchema>;
