import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { sendLeadNotification, sendLeadConfirmation } from "@/lib/email/resend";
import { scoreLeadData, gradeFromTotal, GRADE_SUMMARIES } from "@/lib/scoring/leadScoring";
import type { LeadScore } from "@/lib/scoring/leadScoring";
import type { LeadFormData } from "@/lib/validation/schemas";

const schema = z.object({
  lead_id: z.string().uuid("Ungültige Lead-ID"),
  code:    z.string().length(4, "Code muss 4 Zeichen haben"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe" },
        { status: 400 },
      );
    }

    const { lead_id, code } = parsed.data;
    const supabase = createServerClient();

    // 1. Load latest unverified entry
    const { data: verification } = await supabase
      .from("phone_verifications")
      .select("*")
      .eq("lead_id", lead_id)
      .is("verified_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!verification) {
      return NextResponse.json({ error: "expired" }, { status: 400 });
    }

    // 2. Check expiry
    if (new Date(verification.expires_at) < new Date()) {
      return NextResponse.json({ error: "expired" }, { status: 400 });
    }

    // 3. Check max attempts
    if (verification.attempts >= 5) {
      return NextResponse.json({ error: "max_attempts" }, { status: 400 });
    }

    // 4. Validate code
    if (verification.code !== code) {
      await supabase
        .from("phone_verifications")
        .update({ attempts: verification.attempts + 1 })
        .eq("id", verification.id);

      const attemptsLeft = Math.max(0, 4 - verification.attempts);
      return NextResponse.json(
        { error: "invalid_code", attempts_left: attemptsLeft },
        { status: 400 },
      );
    }

    // ✅ Code correct ─────────────────────────────────────────────────────────

    // 5. Mark verification as complete
    await supabase
      .from("phone_verifications")
      .update({ verified_at: new Date().toISOString() })
      .eq("id", verification.id);

    // 6. Load full lead for score update + emails
    const { data: lead } = await supabase
      .from("leads")
      .select("*")
      .eq("id", lead_id)
      .single();

    if (!lead) {
      // Verification recorded but lead missing — shouldn't happen
      return NextResponse.json({ success: true });
    }

    // 7. Update score: +15 verification bonus (capped at 100)
    const newTotal = Math.min(100, (lead.quality_score ?? 50) + 15);
    const newGrade = gradeFromTotal(newTotal);

    await supabase
      .from("leads")
      .update({
        phone_verified:    true,
        phone_verified_at: new Date().toISOString(),
        quality_score:     newTotal,
        quality_grade:     newGrade,
      })
      .eq("id", lead_id);

    // 8. Reconstruct score for notification email
    const formDataForScore: LeadFormData = {
      housing_type:      (lead.housing_type      ?? "owner_house") as LeadFormData["housing_type"],
      annual_consumption:(lead.annual_consumption ?? "unknown")     as LeadFormData["annual_consumption"],
      roof_orientation:  (lead.roof_orientation  ?? "unknown")     as LeadFormData["roof_orientation"],
      timeframe:         (lead.timeframe         ?? "info_only")   as LeadFormData["timeframe"],
      postal_code:       lead.postal_code  ?? "",
      city:              lead.city         ?? undefined,
      first_name:        lead.first_name   ?? "",
      last_name:         lead.last_name    ?? "",
      phone:             lead.phone        ?? "",
      email:             lead.email        ?? "",
      consent_owner_adult:  true,
      consent_data_sharing: true,
      consent_privacy:      true,
    };

    const baseScore = scoreLeadData(formDataForScore, {
      financing_type: lead.financing_type ?? undefined,
      heating_type:   lead.heating_type   ?? undefined,
    });

    const score: LeadScore = {
      total:     newTotal,
      grade:     newGrade,
      breakdown: { ...baseScore.breakdown },
      summary:   GRADE_SUMMARIES[newGrade],
    };

    // 9. Send buyer notification + customer confirmation (non-blocking)
    await Promise.allSettled([
      sendLeadNotification({ ...formDataForScore, id: lead_id }, score),
      sendLeadConfirmation(formDataForScore),
    ]).then((results) => {
      results.forEach((r, i) => {
        if (r.status === "rejected") {
          console.error(`[verify/check] email ${i} failed:`, r.reason);
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[verify/check] unhandled error:", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
