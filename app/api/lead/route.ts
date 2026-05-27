import { NextRequest, NextResponse } from "next/server";
import { leadSchema } from "@/lib/validation/schemas";
import { sendLeadNotification, sendLeadConfirmation } from "@/lib/email/resend";
import { sendConversionEvent } from "@/lib/meta/conversion-api";
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
      });
      if (error) {
        console.error("[supabase] insert error:", error);
        return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
      }
    } else {
      console.warn("[mock mode] Supabase not configured – lead not persisted. ID:", leadId);
    }

    // Emails + conversion event – errors only logged, never 500
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://autarkiejetzt.de";
    await Promise.allSettled([
      sendLeadNotification({ ...data, id: leadId }),
      sendLeadConfirmation(data),
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

    return NextResponse.json({ success: true, leadId });
  } catch (err) {
    console.error("[lead] unhandled error:", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
