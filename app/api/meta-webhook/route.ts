import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { sendLeadNotification } from "@/lib/email/resend";
import { GRADE_SUMMARIES, type LeadScore } from "@/lib/scoring/leadScoring";

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN ?? "";
const PAGE_ACCESS_TOKEN = process.env.META_PAGE_ACCESS_TOKEN ?? "";

const hasSupabase = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─────────────────────────────────────────────────────────────────────────────
// GET — Meta webhook verification handshake
// ─────────────────────────────────────────────────────────────────────────────
export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode      = searchParams.get("hub.mode");
  const token     = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN && challenge) {
    console.log("[meta-webhook] verification OK");
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn("[meta-webhook] verification failed", { mode, token });
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// ─────────────────────────────────────────────────────────────────────────────
// POST — Incoming lead from Meta Lead Ads
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Always ACK immediately — Meta retries on non-200
  try {
    const body = await req.json();
    // Process asynchronously; response is already committed
    processWebhook(body).catch((e) =>
      console.error("[meta-webhook] async processing failed:", e),
    );
  } catch (e) {
    console.error("[meta-webhook] failed to parse body:", e);
  }
  return NextResponse.json({ received: true }, { status: 200 });
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

interface MetaFieldData {
  name: string;
  values: string[];
}

interface MetaLeadEntry {
  id: string;       // leadgen_id
  changes?: Array<{
    field: string;
    value: { leadgen_id: string; page_id?: string; form_id?: string };
  }>;
}

async function processWebhook(payload: Record<string, unknown>) {
  // Payload shape: { object: "page", entry: [{ id, changes: [{ field: "leadgen", value: { leadgen_id } }] }] }
  const entries = payload.entry as MetaLeadEntry[] | undefined;
  if (!Array.isArray(entries)) return;

  for (const entry of entries) {
    const changes = entry.changes ?? [];
    for (const change of changes) {
      if (change.field !== "leadgen") continue;
      const leadgenId = change.value?.leadgen_id;
      if (!leadgenId) continue;
      await processMetaLead(leadgenId);
    }
  }
}

async function processMetaLead(leadgenId: string) {
  // 1. Fetch lead data from Graph API
  const graphUrl = `https://graph.facebook.com/v18.0/${leadgenId}?fields=field_data&access_token=${PAGE_ACCESS_TOKEN}`;
  const graphRes = await fetch(graphUrl);
  if (!graphRes.ok) {
    console.error("[meta-webhook] graph API error", graphRes.status, await graphRes.text());
    return;
  }
  const graphData = (await graphRes.json()) as { field_data?: MetaFieldData[] };

  // 2. Normalize field_data → flat map
  const fields: Record<string, string> = {};
  for (const f of graphData.field_data ?? []) {
    fields[f.name.toLowerCase()] = f.values[0] ?? "";
  }

  // Common Meta Lead Ads field names
  const firstName   = fields["first_name"]    ?? fields["vorname"]           ?? "";
  const lastName    = fields["last_name"]     ?? fields["nachname"]          ?? "";
  const phone       = fields["phone_number"]  ?? fields["phone"]             ?? fields["telefon"]      ?? "";
  const email       = fields["email"]                                         ?? "";
  const postalCode  = fields["zip_code"]      ?? fields["postal_code"]       ?? fields["postleitzahl"] ?? "";
  const city        = fields["city"]          ?? fields["ort"]               ?? "";

  // Minimal sanity check
  if (!phone && !email) {
    console.warn("[meta-webhook] lead has no phone or email — skipping", leadgenId);
    return;
  }

  const leadId = randomUUID();

  // Fixed score for Meta Lead Ad (less qualifying data than funnel)
  const metaScore: LeadScore = {
    total:     50,
    grade:     "B",
    breakdown: { roof: 0, consumption: 0, timeframe: 30, location: 6, completeness: 14 },
    summary:   GRADE_SUMMARIES["B"],
  };

  if (hasSupabase) {
    const { createServerClient } = await import("@/lib/supabase/server");
    const supabase = createServerClient();

    // 3. Duplicate check — select before insert
    const { data: existing } = await supabase
      .from("leads")
      .select("id")
      .eq("external_id", leadgenId)
      .maybeSingle();

    if (existing) {
      console.log("[meta-webhook] duplicate leadgen_id, skipping:", leadgenId);
      return;
    }

    // 4. Insert lead
    const { error } = await supabase.from("leads").insert({
      id:                leadId,
      first_name:        firstName,
      last_name:         lastName,
      phone:             phone || "unbekannt",
      email:             email,
      postal_code:       postalCode || "00000",
      city:              city || null,
      housing_type:      "owner_house",      // assumed from Meta lead form
      annual_consumption:"unknown",
      roof_orientation:  "unknown",
      timeframe:         "immediate",
      landing_page:      "meta-lead-ad",
      utm_source:        "meta",
      utm_medium:        "lead-ad",
      quality_score:     metaScore.total,
      quality_grade:     metaScore.grade,
      consent_owner_adult:  true,
      consent_data_sharing: true,
      consent_privacy:      true,
      external_id:       leadgenId,
    });

    if (error) {
      // Catch race-condition duplicate (Postgres unique violation = 23505)
      if ((error as { code?: string }).code === "23505") {
        console.log("[meta-webhook] race-condition duplicate, skipping:", leadgenId);
        return;
      }
      console.error("[meta-webhook] supabase insert error:", error);
      return;
    }

    // 5. Notify buyer immediately
    const leadForEmail = {
      id:                leadId,
      first_name:        firstName,
      last_name:         lastName,
      phone:             phone || "unbekannt",
      email:             email,
      postal_code:       postalCode || "00000",
      city:              city || undefined,
      housing_type:      "owner_house" as const,
      annual_consumption:"unknown" as const,
      roof_orientation:  "unknown" as const,
      timeframe:         "immediate" as const,
      consent_owner_adult:  true as const,
      consent_data_sharing: true as const,
      consent_privacy:      true as const,
    };

    await sendLeadNotification(leadForEmail, metaScore).catch((e) =>
      console.error("[meta-webhook] notification email failed:", e),
    );

    console.log("[meta-webhook] lead processed:", leadId, "from leadgen_id:", leadgenId);
  } else {
    console.warn("[meta-webhook mock] Supabase not configured – lead not persisted. leadgen_id:", leadgenId);
  }
}
