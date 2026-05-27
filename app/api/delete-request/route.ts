import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";

// ---------------------------------------------------------------------------
// Rate limiter — 3 requests per IP per hour (in-memory, resets on cold start)
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) return true;
  entry.count += 1;
  return false;
}

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------
const schema = z.object({
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein."),
  first_name: z.string().max(100).optional(),
});

// ---------------------------------------------------------------------------
// Env guards
// ---------------------------------------------------------------------------
const hasSupabase =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

const hasResend = Boolean(process.env.RESEND_API_KEY);

// ---------------------------------------------------------------------------
// Email helpers
// ---------------------------------------------------------------------------
function deletionConfirmationHtml(email: string, deletedCount: number): string {
  const hasLeads = deletedCount > 0;
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f3;font-family:system-ui,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e8e5de">
    <div style="background:#0a4d3c;padding:24px 28px">
      <p style="margin:0;color:#f4b400;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase">Autarkie Jetzt</p>
      <h1 style="margin:6px 0 0;color:#fff;font-size:20px;font-weight:700">Löschbestätigung gemäß Art. 17 DSGVO</h1>
    </div>
    <div style="padding:24px 28px">
      <p style="margin:0 0 16px;font-size:15px;color:#1a1a1a">
        ${hasLeads
          ? `Wir bestätigen, dass alle personenbezogenen Daten zur E-Mail-Adresse <strong>${email}</strong> aus unserer Datenbank gelöscht wurden.`
          : `Unter der E-Mail-Adresse <strong>${email}</strong> konnten wir keine gespeicherten Daten finden. Es sind daher keine Daten zu löschen.`
        }
      </p>
      ${hasLeads ? `
      <div style="background:#f0f9f5;border:1px solid #b2dece;border-radius:8px;padding:16px 20px;margin:0 0 20px">
        <p style="margin:0;font-size:14px;color:#0a4d3c;font-weight:600">Was wurde gelöscht?</p>
        <p style="margin:8px 0 0;font-size:14px;color:#3a3a3a;line-height:1.6">
          Alle mit Ihrer E-Mail-Adresse verknüpften Beratungsanfragen (${deletedCount} ${deletedCount === 1 ? "Datensatz" : "Datensätze"})
          wurden unwiderruflich gelöscht.
        </p>
      </div>` : ""}
      <p style="margin:0;font-size:14px;color:#5c5c5c;line-height:1.6">
        Falls Sie Fragen haben oder weitere Auskunft benötigen, erreichen Sie uns unter
        <a href="mailto:anfrage@autarkiejetzt.de" style="color:#0a4d3c">anfrage@autarkiejetzt.de</a>.
      </p>
    </div>
    <div style="padding:16px 28px;border-top:1px solid #e8e5de;background:#fafaf7">
      <p style="margin:0;font-size:12px;color:#5c5c5c">
        Diese Bestätigung wurde automatisch generiert. · Autarkie Jetzt — Schwietz Holding UG · autarkiejetzt.de
      </p>
    </div>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  // IP for rate limiting
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte versuche es später erneut." },
      { status: 429 }
    );
  }

  // Parse + validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." },
      { status: 400 }
    );
  }

  const { email, first_name } = parsed.data;
  const userAgent = req.headers.get("user-agent") ?? undefined;

  let deletedCount = 0;

  // ---------------------------------------------------------------------------
  // Supabase: find + delete leads
  // ---------------------------------------------------------------------------
  if (hasSupabase) {
    const { createServerClient } = await import("@/lib/supabase/server");
    const supabase = createServerClient();

    // Select matching leads (case-insensitive)
    const { data: matchingLeads, error: selectError } = await supabase
      .from("leads")
      .select("id")
      .ilike("email", email);

    if (selectError) {
      console.error("[delete-request] Supabase select error:", selectError);
      return NextResponse.json(
        { error: "Datenbankfehler. Bitte versuche es erneut." },
        { status: 500 }
      );
    }

    deletedCount = matchingLeads?.length ?? 0;

    if (deletedCount > 0) {
      const ids = matchingLeads!.map((l) => l.id);

      const { error: deleteError } = await supabase
        .from("leads")
        .delete()
        .in("id", ids);

      if (deleteError) {
        console.error("[delete-request] Supabase delete error:", deleteError);
        return NextResponse.json(
          { error: "Löschen fehlgeschlagen. Bitte versuche es erneut." },
          { status: 500 }
        );
      }
    }

    // Log the deletion request regardless of found/not-found
    const { error: logError } = await supabase.from("deletion_log").insert({
      email: email.toLowerCase(),
      leads_deleted_count: deletedCount,
      ip_address: ip === "unknown" ? null : ip,
      user_agent: userAgent ?? null,
    });

    if (logError) {
      // Non-fatal — log but continue
      console.error("[delete-request] Failed to write deletion_log:", logError);
    }
  } else {
    // Mock mode — no Supabase keys set
    console.warn(
      `[delete-request] Mock mode — would delete leads for: ${email}`
    );
  }

  // ---------------------------------------------------------------------------
  // Resend: send confirmation email
  // ---------------------------------------------------------------------------
  if (hasResend) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.LEAD_NOTIFY_FROM ?? "leads@autarkiejetzt.de",
        to: email,
        subject: "Ihre Datenlöschung – Autarkie Jetzt",
        html: deletionConfirmationHtml(email, deletedCount),
      });
    } catch (emailError) {
      // Non-fatal — confirmation email failure should not block the API response
      console.error("[delete-request] Failed to send confirmation email:", emailError);
    }
  } else {
    console.warn(
      `[delete-request] Mock mode — would send deletion confirmation to: ${email}`
    );
  }

  return NextResponse.json(
    {
      success: true,
      message:
        deletedCount > 0
          ? `${deletedCount} ${deletedCount === 1 ? "Datensatz" : "Datensätze"} gelöscht. Bestätigung wurde an ${email} gesendet.`
          : `Keine Daten zu ${email} gefunden. Bestätigung wurde gesendet.`,
      deleted: deletedCount,
      // Include name in response for personalised success message in form
      first_name: first_name ?? null,
    },
    { status: 200 }
  );
}
