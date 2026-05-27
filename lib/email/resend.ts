import { Resend } from "resend";
import type { LeadFormData } from "@/lib/validation/schemas";
import type { LeadScore } from "@/lib/scoring/leadScoring";

// ---------------------------------------------------------------------------
// Human-readable label maps
// ---------------------------------------------------------------------------
const LABELS = {
  housing_type: {
    owner_house: "Eigentümer (Haus)",
    owner_apartment: "Eigentümer (Eigentumswohnung)",
  },
  annual_consumption: {
    under_3000: "Unter 3.000 kWh",
    "3000_5000": "3.000 – 5.000 kWh",
    "5000_8000": "5.000 – 8.000 kWh",
    over_8000: "Über 8.000 kWh",
    unknown: "Nicht bekannt",
  },
  roof_orientation: {
    south: "Süd / Südost / Südwest",
    east_west: "Ost-West",
    north: "Nord",
    unknown: "Nicht bekannt",
  },
  timeframe: {
    immediate: "So schnell wie möglich",
    "1_3_months": "1–3 Monate",
    "3_6_months": "3–6 Monate",
    info_only: "Erst informieren",
  },
} as const;

function label<T extends Record<string, string>>(
  map: T,
  key: string
): string {
  return (map as Record<string, string>)[key] ?? key;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDateTime(): string {
  return new Date().toLocaleString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  });
}

/** A two-column label/value row inside a section table */
function row(labelText: string, valueHtml: string): string {
  return `
  <tr>
    <td style="padding:11px 16px;width:130px;vertical-align:top;color:#6b7280;font-size:13px;white-space:nowrap;border-bottom:1px solid #e8e8e2">${labelText}</td>
    <td style="padding:11px 16px 11px 0;vertical-align:top;color:#111827;font-size:14px;font-weight:500;border-bottom:1px solid #e8e8e2">${valueHtml}</td>
  </tr>`;
}

/** Inline score chip: "Label  22/25" */
function scoreChip(chipLabel: string, pts: number, max: number): string {
  return `<td style="padding-right:14px;white-space:nowrap;vertical-align:middle">
    <span style="font-size:12px;color:#6b7280">${chipLabel}</span>
    <strong style="font-size:12px;color:#111827;margin-left:3px">${pts}/${max}</strong>
  </td>`;
}

// ---------------------------------------------------------------------------
// Score banner (inserted right after the header)
// ---------------------------------------------------------------------------
type GradeCfg = { bg: string; border: string; titleColor: string; icon: string; label: string };

const GRADE_CONFIGS: Record<"A" | "B" | "C", GradeCfg> = {
  A: {
    bg: "#F0FDF4",
    border: "#16A34A",
    titleColor: "#15803D",
    icon: "⭐",
    label: "Sofort anrufen!",
  },
  B: {
    bg: "#FFFBEB",
    border: "#D97706",
    titleColor: "#92400E",
    icon: "🔥",
    label: "Heute kontaktieren",
  },
  C: {
    bg: "#F9FAFB",
    border: "#6B7280",
    titleColor: "#374151",
    icon: "📋",
    label: "24h Zeitfenster",
  },
};

function scoreBannerHtml(score: LeadScore): string {
  const cfg = GRADE_CONFIGS[score.grade];
  const bd = score.breakdown;

  return `
          <!-- ── SCORE BANNER ───────────────────────────────────────────── -->
          <tr>
            <td style="padding:20px 32px 0">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="background:${cfg.bg};border-left:4px solid ${cfg.border};
                             padding:16px 20px;border-radius:0 8px 8px 0">

                    <!-- Grade headline -->
                    <p style="margin:0 0 11px;font-size:16px;font-weight:700;
                              color:${cfg.titleColor};line-height:1.2">
                      ${cfg.icon}&nbsp; ${score.grade}-Lead
                      &nbsp;·&nbsp; Score: <strong>${score.total}/100</strong>
                      &nbsp;·&nbsp; ${cfg.label}
                    </p>

                    <!-- Score breakdown chips -->
                    <table cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        ${scoreChip("Dach", bd.roof, 25)}
                        ${scoreChip("Verbrauch", bd.consumption, 25)}
                        ${scoreChip("Zeitraum", bd.timeframe, 30)}
                        ${scoreChip("Region", bd.location, 10)}
                        ${scoreChip("Vollständigkeit", bd.completeness, 10)}
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
}

// ---------------------------------------------------------------------------
// Notification email (→ Jannis / internal team)
// ---------------------------------------------------------------------------
function notificationHtml(lead: LeadFormData & { id: string }, score: LeadScore): string {
  const fullName = `${lead.first_name} ${lead.last_name}`;
  const addressLine = [
    lead.street,
    `${lead.postal_code}${lead.city ? ` ${lead.city}` : ""}`,
  ].filter(Boolean).join(" · ");
  const phoneClean = lead.phone.replace(/\s+/g, "");

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Neuer PV-Lead – Autarkie Jetzt</title>
</head>
<body style="margin:0;padding:0;background:#EAEAE5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,Arial,sans-serif">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
         style="background:#EAEAE5;min-height:100vh">
    <tr>
      <td align="center" style="padding:32px 16px">

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
               style="max-width:600px;background:#ffffff;border-radius:12px;
                      overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.10)">

          <!-- ── HEADER ─────────────────────────────────────────────────── -->
          <tr>
            <td style="background:#0A4D3C;padding:28px 32px">
              <p style="margin:0;font-size:23px;font-weight:700;color:#ffffff;
                        line-height:1.2;letter-spacing:-0.01em">
                ☀️ Neuer PV-Lead eingegangen
              </p>
              <p style="margin:8px 0 0;font-size:13px;
                        color:rgba(255,255,255,0.55);letter-spacing:0.01em">
                ${formatDateTime()} Uhr
              </p>
            </td>
          </tr>

          ${scoreBannerHtml(score)}

          <!-- ── SECTION 1: KONTAKT ─────────────────────────────────────── -->
          <tr>
            <td style="padding:20px 32px 0">
              <p style="margin:0 0 10px;font-size:10.5px;font-weight:700;
                        letter-spacing:0.14em;text-transform:uppercase;
                        color:#0A4D3C">
                Kontakt
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                     style="background:#F6F6F1;border-radius:8px;overflow:hidden;
                            border:1px solid #E8E8E2">
                <tbody>
                  ${row("Name", fullName)}
                  ${row(
                    "Telefon",
                    `<a href="tel:${phoneClean}"
                        style="color:#0A4D3C;text-decoration:none;font-weight:700;
                               font-size:15px">${lead.phone}</a>
                     <span style="margin-left:8px;font-size:11px;color:#9ca3af;
                                  font-weight:400">← anrufen</span>`
                  )}
                  ${row(
                    "E-Mail",
                    `<a href="mailto:${lead.email}"
                        style="color:#0A4D3C;text-decoration:none">${lead.email}</a>`
                  )}
                  ${row("Adresse", addressLine)}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- ── SECTION 2: OBJEKT & INTERESSE ─────────────────────────── -->
          <tr>
            <td style="padding:20px 32px 0">
              <p style="margin:0 0 10px;font-size:10.5px;font-weight:700;
                        letter-spacing:0.14em;text-transform:uppercase;
                        color:#0A4D3C">
                Objekt &amp; Interesse
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                     style="background:#F6F6F1;border-radius:8px;overflow:hidden;
                            border:1px solid #E8E8E2">
                <tbody>
                  ${row("Eigentümer", label(LABELS.housing_type, lead.housing_type))}
                  ${row("Verbrauch", label(LABELS.annual_consumption, lead.annual_consumption))}
                  ${row("Dach", label(LABELS.roof_orientation, lead.roof_orientation))}
                  ${row("Zeitraum", label(LABELS.timeframe, lead.timeframe))}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- ── CALL-TO-ACTION BANNER ──────────────────────────────────── -->
          <tr>
            <td style="padding:20px 32px">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="background:#FFF8E1;border-left:4px solid #F4B400;
                             padding:14px 18px;border-radius:0 8px 8px 0">
                    <p style="margin:0;font-size:14px;color:#111827;line-height:1.65">
                      ⚡ <strong>Jetzt anrufen</strong> –
                      schnelle Reaktion erhöht die Abschlusswahrscheinlichkeit
                      erheblich.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── FOOTER ─────────────────────────────────────────────────── -->
          <tr>
            <td style="padding:14px 32px 22px;border-top:1px solid #EAEAE5">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.7">
                Lead-ID: <span style="font-family:monospace;color:#6b7280">${lead.id}</span>
                &nbsp;·&nbsp; autarkiejetzt.de
                &nbsp;·&nbsp; Auf diese Mail antworten für Reklamationen
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Confirmation email (→ end customer)
// ---------------------------------------------------------------------------
function confirmationHtml(lead: LeadFormData): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Deine Anfrage ist eingegangen – Autarkie Jetzt</title>
</head>
<body style="margin:0;padding:0;background:#F0F0EB;
             font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,Arial,sans-serif">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
         style="background:#F0F0EB;min-height:100vh">
    <tr>
      <td align="center" style="padding:32px 16px">

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
               style="max-width:600px;background:#ffffff;border-radius:12px;
                      overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.10)">

          <!-- ── HEADER ─────────────────────────────────────────────────── -->
          <tr>
            <td style="background:#0A4D3C;padding:28px 32px">
              <p style="margin:0 0 16px;font-size:13px;font-weight:700;
                        letter-spacing:0.08em;color:rgba(255,255,255,0.55)">
                ☀️ AUTARKIE JETZT
              </p>
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="width:40px;vertical-align:middle">
                    <div style="width:36px;height:36px;border-radius:50%;
                                background:rgba(255,255,255,0.15);
                                font-size:20px;line-height:36px;text-align:center">
                      ✓
                    </div>
                  </td>
                  <td style="padding-left:14px;vertical-align:middle">
                    <p style="margin:0;font-size:20px;font-weight:700;
                              color:#ffffff;line-height:1.25">
                      Deine Anfrage ist eingegangen
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── BODY ───────────────────────────────────────────────────── -->
          <tr>
            <td style="padding:28px 32px 8px">
              <p style="margin:0 0 6px;font-size:17px;font-weight:600;color:#111827">
                Hallo ${lead.first_name},
              </p>
              <p style="margin:0;font-size:15px;color:#4b5563;line-height:1.7">
                vielen Dank für deine Anfrage! Wir haben sie erfolgreich erhalten
                und leiten sie an einen geprüften Solar-Fachbetrieb aus deiner
                Region weiter.
              </p>
            </td>
          </tr>

          <!-- ── NEXT STEPS ─────────────────────────────────────────────── -->
          <tr>
            <td style="padding:16px 32px">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                     style="background:#F0FAF4;border:1px solid #B2DCCE;
                            border-radius:8px;overflow:hidden">
                <tr>
                  <td style="padding:18px 20px">
                    <p style="margin:0 0 10px;font-size:13px;font-weight:700;
                              color:#0A4D3C;text-transform:uppercase;
                              letter-spacing:0.1em">
                      Was passiert als Nächstes?
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="width:28px;vertical-align:top;padding-top:2px">
                          <div style="width:22px;height:22px;border-radius:50%;
                                      background:#0A4D3C;color:#ffffff;
                                      font-size:12px;font-weight:700;
                                      text-align:center;line-height:22px">1</div>
                        </td>
                        <td style="padding-left:10px;font-size:14px;color:#374151;
                                   line-height:1.6;padding-bottom:10px">
                          Wir leiten deine Anfrage an einen regionalen
                          Fachbetrieb weiter.
                        </td>
                      </tr>
                      <tr>
                        <td style="width:28px;vertical-align:top;padding-top:2px">
                          <div style="width:22px;height:22px;border-radius:50%;
                                      background:#0A4D3C;color:#ffffff;
                                      font-size:12px;font-weight:700;
                                      text-align:center;line-height:22px">2</div>
                        </td>
                        <td style="padding-left:10px;font-size:14px;color:#374151;
                                   line-height:1.6;padding-bottom:10px">
                          Ein Berater meldet sich innerhalb von
                          <strong>24 Stunden</strong> telefonisch bei dir.
                        </td>
                      </tr>
                      <tr>
                        <td style="width:28px;vertical-align:top;padding-top:2px">
                          <div style="width:22px;height:22px;border-radius:50%;
                                      background:#0A4D3C;color:#ffffff;
                                      font-size:12px;font-weight:700;
                                      text-align:center;line-height:22px">3</div>
                        </td>
                        <td style="padding-left:10px;font-size:14px;color:#374151;
                                   line-height:1.6">
                          Du erhältst ein kostenloses, unverbindliches Angebot –
                          ganz ohne Druck.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── TIP ────────────────────────────────────────────────────── -->
          <tr>
            <td style="padding:4px 32px 24px">
              <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6">
                💡 Tipp: Halte dein Telefon bereit –
                das Beratungsgespräch dauert ca. 10–15 Minuten.
              </p>
            </td>
          </tr>

          <!-- ── FOOTER ─────────────────────────────────────────────────── -->
          <tr>
            <td style="padding:16px 32px 22px;border-top:1px solid #EAEAE5;
                       background:#FAFAF7">
              <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6">
                Mit sonnigen Grüßen,<br>
                <strong style="color:#374151">Dein Autarkie-Jetzt-Team</strong>
              </p>
              <p style="margin:10px 0 0;font-size:11px;color:#9ca3af">
                Autarkie Jetzt · Schwietz Holding UG · anfrage@autarkiejetzt.de
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Exported send functions
// ---------------------------------------------------------------------------
export async function sendLeadNotification(
  lead: LeadFormData & { id: string },
  score: LeadScore
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[resend] RESEND_API_KEY not set – skipping notification email");
    return;
  }
  const to = process.env.LEAD_NOTIFY_TO;
  if (!to) {
    console.warn("[resend] LEAD_NOTIFY_TO not set – skipping notification email");
    return;
  }
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: process.env.LEAD_NOTIFY_FROM ?? "leads@autarkiejetzt.de",
    to,
    subject: `☀️ [${score.grade}-Lead · ${score.total}/100] ${lead.first_name} ${lead.last_name} – ${lead.postal_code}${lead.city ? ` ${lead.city}` : ""}`,
    html: notificationHtml(lead, score),
  });
}

/**
 * Pre-verification email: informs the lead that an SMS code is on its way.
 * Sent immediately after form submission, before phone is verified.
 */
export async function sendSmsCodePendingEmail(lead: Pick<LeadFormData, "first_name" | "email">, maskedPhone: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[resend] RESEND_API_KEY not set – skipping SMS pending email");
    return;
  }
  const resend = new Resend(apiKey);
  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Bestätigungscode unterwegs – Autarkie Jetzt</title>
</head>
<body style="margin:0;padding:0;background:#F0F0EB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#F0F0EB;min-height:100vh">
    <tr>
      <td align="center" style="padding:32px 16px">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
               style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.10)">
          <tr>
            <td style="background:#0A4D3C;padding:28px 32px">
              <p style="margin:0 0 12px;font-size:13px;font-weight:700;letter-spacing:0.08em;color:rgba(255,255,255,0.55)">☀️ AUTARKIE JETZT</p>
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="width:40px;vertical-align:middle">
                    <div style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.15);font-size:20px;line-height:36px;text-align:center">📱</div>
                  </td>
                  <td style="padding-left:14px;vertical-align:middle">
                    <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;line-height:1.25">Bestätigungscode unterwegs</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 8px">
              <p style="margin:0 0 6px;font-size:17px;font-weight:600;color:#111827">Hallo ${lead.first_name},</p>
              <p style="margin:0;font-size:15px;color:#4b5563;line-height:1.7">
                fast geschafft! Wir haben dir soeben einen <strong>6-stelligen Bestätigungscode</strong>
                per SMS an <strong>${maskedPhone}</strong> gesendet.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                     style="background:#F0FAF4;border:1px solid #B2DCCE;border-radius:8px">
                <tr>
                  <td style="padding:18px 20px">
                    <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#0A4D3C;text-transform:uppercase;letter-spacing:0.1em">Nächster Schritt</p>
                    <p style="margin:0;font-size:14px;color:#374151;line-height:1.6">
                      Gib den Code auf der Bestätigungsseite ein. Er ist <strong>10 Minuten</strong> gültig.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:4px 32px 24px">
              <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6">
                Falls du keine SMS erhalten hast, kannst du auf der Bestätigungsseite einen neuen Code anfordern.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 22px;border-top:1px solid #EAEAE5;background:#FAFAF7">
              <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6">
                Mit sonnigen Grüßen,<br>
                <strong style="color:#374151">Dein Autarkie-Jetzt-Team</strong>
              </p>
              <p style="margin:10px 0 0;font-size:11px;color:#9ca3af">Autarkie Jetzt · anfrage@autarkiejetzt.de</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await resend.emails.send({
    from: process.env.LEAD_NOTIFY_FROM ?? "leads@autarkiejetzt.de",
    to: lead.email,
    subject: "Dein Bestätigungscode ist unterwegs – Autarkie Jetzt",
    html,
  });
}

export async function sendLeadConfirmation(lead: LeadFormData) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[resend] RESEND_API_KEY not set – skipping confirmation email");
    return;
  }
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: process.env.LEAD_NOTIFY_FROM ?? "leads@autarkiejetzt.de",
    to: lead.email,
    subject: "Deine Solar-Anfrage ist eingegangen ✓ – Autarkie Jetzt",
    html: confirmationHtml(lead),
  });
}
