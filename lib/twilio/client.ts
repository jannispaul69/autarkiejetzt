/**
 * Twilio utilities – SERVER ONLY
 * Never import this file in client components.
 */

/**
 * Normalise any German phone number to E.164 (+49...).
 * Handles: 0151 234…, 00491512…, +49151…, 0049151…
 */
export function normalizePhone(raw: string): string {
  // Strip whitespace, dashes, parentheses, slashes
  const cleaned = raw.replace(/[\s\-\(\)\/]/g, "");

  // Replace leading 0049 or 00 international prefix
  if (cleaned.startsWith("0049")) return "+" + cleaned.slice(2);
  if (cleaned.startsWith("00"))   return "+" + cleaned.slice(2);

  // German domestic number (leading 0)
  if (cleaned.startsWith("0")) return "+49" + cleaned.slice(1);

  // Already has country code without +
  if (cleaned.startsWith("49") && !cleaned.startsWith("+")) return "+" + cleaned;

  // Already in E.164 or unknown format – return as-is
  return cleaned;
}

/** Mask a phone number for display: show only last 2 digits */
export function maskPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 4) return "der angegebenen Nummer";
  const last2 = digits.slice(-2);
  return `+49 *** *** **${last2}`;
}

const hasTwilio = !!(
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_PHONE_NUMBER
);

/**
 * Send an SMS via Twilio.
 * No-op (with console warning) when Twilio env vars are not configured.
 */
export async function sendSms(to: string, body: string): Promise<void> {
  if (!hasTwilio) {
    console.warn("[twilio] Not configured – SMS not sent.", { to, body });
    return;
  }

  // Dynamic import so the twilio package is not bundled in edge runtimes
  const { default: twilio } = await import("twilio");
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!,
  );

  await client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to,
  });
}
