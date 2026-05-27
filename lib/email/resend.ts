import { Resend } from "resend";
import type { LeadFormData } from "@/lib/validation/schemas";

const LABELS = {
  housing_type: {
    owner_house: "Eigentümer eines Hauses",
    owner_apartment: "Eigentümer einer Eigentumswohnung",
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
    "1_3_months": "In 1–3 Monaten",
    "3_6_months": "In 3–6 Monaten",
    info_only: "Erstmal nur informieren",
  },
} as const;

function row(label: string, value: string) {
  return `
    <tr>
      <td style="padding:8px 12px;background:#f5f5f3;color:#5c5c5c;font-size:13px;white-space:nowrap;border-bottom:1px solid #e8e5de">${label}</td>
      <td style="padding:8px 12px;color:#1a1a1a;font-size:14px;border-bottom:1px solid #e8e5de">${value}</td>
    </tr>`;
}

function notificationHtml(lead: LeadFormData & { id: string }) {
  const address = `${lead.postal_code}${lead.city ? ` ${lead.city}` : ""}`;
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f3;font-family:system-ui,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e8e5de">
    <div style="background:#0a4d3c;padding:24px 28px">
      <p style="margin:0;color:#f4b400;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase">Autarkie Jetzt</p>
      <h1 style="margin:6px 0 0;color:#fff;font-size:20px;font-weight:700">Neuer Solar-Lead eingegangen</h1>
    </div>
    <div style="padding:24px 28px">
      <table style="width:100%;border-collapse:collapse;border:1px solid #e8e5de;border-radius:8px;overflow:hidden">
        <tbody>
          ${row("Name", `${lead.first_name} ${lead.last_name}`)}
          ${row("Telefon", lead.phone)}
          ${row("E-Mail", lead.email)}
          ${row("Adresse", address)}
          ${row("Wohnsituation", LABELS.housing_type[lead.housing_type as keyof typeof LABELS.housing_type] ?? lead.housing_type)}
          ${row("Jahresverbrauch", LABELS.annual_consumption[lead.annual_consumption as keyof typeof LABELS.annual_consumption] ?? lead.annual_consumption)}
          ${row("Dachausrichtung", LABELS.roof_orientation[lead.roof_orientation as keyof typeof LABELS.roof_orientation] ?? lead.roof_orientation)}
          ${row("Zeithorizont", LABELS.timeframe[lead.timeframe as keyof typeof LABELS.timeframe] ?? lead.timeframe)}
          ${row("Lead-ID", lead.id)}
        </tbody>
      </table>
      <p style="margin:20px 0 0;font-size:13px;color:#5c5c5c">
        Bitte nimm innerhalb von 24 Stunden Kontakt auf.
      </p>
    </div>
  </div>
</body>
</html>`;
}

function confirmationHtml(lead: LeadFormData) {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f3;font-family:system-ui,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e8e5de">
    <div style="background:#0a4d3c;padding:24px 28px">
      <p style="margin:0;color:#f4b400;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase">Autarkie Jetzt</p>
      <h1 style="margin:6px 0 0;color:#fff;font-size:20px;font-weight:700">Deine Anfrage ist eingegangen</h1>
    </div>
    <div style="padding:24px 28px">
      <p style="margin:0 0 16px;font-size:15px;color:#1a1a1a">Hallo ${lead.first_name},</p>
      <p style="margin:0 0 16px;font-size:15px;color:#3a3a3a;line-height:1.6">
        vielen Dank für deine Anfrage! Wir haben sie erfolgreich erhalten und leiten sie
        an einen geprüften Solar-Fachbetrieb aus deiner Region weiter.
      </p>
      <div style="background:#f0f9f5;border:1px solid #b2dece;border-radius:8px;padding:16px 20px;margin:0 0 20px">
        <p style="margin:0;font-size:14px;font-weight:600;color:#0a4d3c">Was passiert als Nächstes?</p>
        <p style="margin:8px 0 0;font-size:14px;color:#3a3a3a;line-height:1.6">
          Ein Fachberater meldet sich innerhalb von <strong>24 Stunden</strong> telefonisch bei dir,
          um deine Situation zu besprechen und ein kostenloses, unverbindliches Angebot zu erstellen.
        </p>
      </div>
      <p style="margin:0 0 4px;font-size:14px;color:#5c5c5c">
        Tipp: Halte dein Telefon bereit – das Beratungsgespräch dauert ca. 10–15 Minuten.
      </p>
    </div>
    <div style="padding:16px 28px;border-top:1px solid #e8e5de;background:#fafaf7">
      <p style="margin:0;font-size:13px;color:#5c5c5c">Mit sonnigen Grüßen,<br>Dein Autarkie Jetzt Team</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendLeadNotification(lead: LeadFormData & { id: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[resend] RESEND_API_KEY not set – skipping notification email");
    return;
  }
  const resend = new Resend(apiKey);
  const to = process.env.LEAD_NOTIFY_TO;
  if (!to) {
    console.warn("[resend] LEAD_NOTIFY_TO not set – skipping notification email");
    return;
  }
  await resend.emails.send({
    from: process.env.LEAD_NOTIFY_FROM ?? "leads@autarkiejetzt.de",
    to,
    subject: `Neuer Lead: ${lead.first_name} ${lead.last_name} – PLZ ${lead.postal_code}`,
    html: notificationHtml(lead),
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
    subject: "Deine Solar-Anfrage ist eingegangen – Autarkie Jetzt",
    html: confirmationHtml(lead),
  });
}
