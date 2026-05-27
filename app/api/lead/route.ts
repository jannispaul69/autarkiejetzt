import { NextRequest, NextResponse } from "next/server";
import { leadSchema } from "@/lib/validation/schemas";
import { sendSmsCodePendingEmail } from "@/lib/email/resend";
import { sendConversionEvent } from "@/lib/meta/conversion-api";
import { scoreLeadData } from "@/lib/scoring/leadScoring";
import { normalizePhone, maskPhone, sendSms } from "@/lib/twilio/client";
import { randomUUID } from "crypto";

const hasSupabase = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Honeypot: reject silently if filled
    if (body.website) {
      return NextResponse.json({ success: true });
    }

    const parsed = leadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungültige Eingabe", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const leadId = randomUUID();
    const eventId = randomUUID();

    // Score the lead (pure function, no I/O)
    const score = scoreLeadData(data, {
      financing_type: body.financing_type,
      heating_type: body.heating_type,
    });

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const userAgent = req.headers.get("user-agent") ?? null;

    // Supabase insert (skipped in mock mode)
    if (hasSupabase) {
      const { createServerClient } = await import("@/lib/supabase/server");
      const supabase = createServerClient();
      const { error } = await supabase.from("leads").insert({
        id: leadId,
        ...data,
        utm_source: body.utm_source ?? null,
        utm_medium: body.utm_medium ?? null,
        utm_campaign: body.utm_campaign ?? null,
        utm_content: body.utm_content ?? null,
        utm_term: body.utm_term ?? null,
        fbclid: body.fbclid ?? null,
        fbp: body.fbp ?? null,
        fbc: body.fbc ?? null,
        referrer: body.referrer ?? null,
        landing_page: body.landing_page ?? null,
        ip_address: ipAddress,
        user_agent: userAgent,
        quality_score: score.total,
        quality_grade: score.grade,
        // Solar-check extended fields (null on standard funnel)
        building_type: body.building_type ?? null,
        roof_type: body.roof_type ?? null,
        heating_type: body.heating_type ?? null,
        financing_type: body.financing_type ?? null,
        previous_consultation: body.previous_consultation ?? null,
        motivations: body.motivations ?? null,
      });
      if (error) {
        console.error("[supabase] insert error:", error);
        return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
      }
    } else {
      console.warn("[mock mode] Supabase not configured – lead not persisted. ID:", leadId);
    }

    // ── Send SMS verification code ──────────────────────────────────────────
    // The buyer notification email is withheld until phone is verified.
    // On SMS failure: log and continue — user can resend from verify page.
    if (hasSupabase) {
      const normalizedPhone = normalizePhone(data.phone);
      const verifyCode = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      const { createServerClient: getClient } = await import("@/lib/supabase/server");
      const sbClient = getClient();

      await sbClient.from("phone_verifications").insert({
        lead_id:    leadId,
        phone:      normalizedPhone,
        code:       verifyCode,
        expires_at: expiresAt,
      });

      try {
        await sendSms(normalizedPhone, `Dein Autarkie Jetzt Code: ${verifyCode}. Gültig 10 Min.`);
      } catch (smsErr) {
        console.error("[lead] SMS send failed (non-fatal):", smsErr);
      }
    }

    // ── Post-submit emails + Meta conversion event ───────────────────────────
    // Notification to buyer is sent AFTER phone verification (in /api/verify/check).
    // Here we only send: (1) "code is on its way" confirmation + (2) conversion event.
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://autarkiejetzt.de";
    await Promise.allSettled([
      sendSmsCodePendingEmail(
        { first_name: data.first_name, email: data.email },
        maskPhone(data.phone),
      ),
      sendConversionEvent({
        eventName: "Lead",
        eventId,
        email: data.email,
        phone: data.phone,
        firstName: data.first_name,
        lastName: data.last_name,
        postalCode: data.postal_code,
        clientIpAddress: ipAddress ?? undefined,
        clientUserAgent: userAgent ?? undefined,
        fbp: body.fbp,
        fbc: body.fbc,
        sourceUrl: `${siteUrl}/danke`,
      }),
    ]).then((results) => {
      results.forEach((r, i) => {
        if (r.status === "rejected") {
          console.error(`[lead] async task ${i} failed:`, r.reason);
        }
      });
    });

    return NextResponse.json({ success: true, leadId, requires_verification: true });
  } catch (err) {
    console.error("[lead] unhandled error:", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
