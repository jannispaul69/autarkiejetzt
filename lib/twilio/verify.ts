/**
 * Twilio Verify utilities — SERVER ONLY
 * Uses the Twilio Verify service (SMS + voice call).
 * Never import this file in client components.
 */

/**
 * Detect if a phone number is a German mobile number.
 * Mobile prefixes: 015x, 016x, 017x (domestic) or 4915x, 4916x, 4917x (E.164).
 * Landline numbers fall through to false.
 */
export function isMobileNumber(phone: string): boolean {
  const clean = phone.replace(/[\s\-\+\(\)\/]/g, "");
  return (
    /^(49)?(015|016|017)\d/.test(clean) ||
    /^(0)(15|16|17)\d/.test(clean)
  );
}

const hasVerify = !!(
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_VERIFY_SERVICE_SID
);

/**
 * Send a verification code via Twilio Verify (SMS or voice call).
 * No-op with console warning when Twilio Verify env vars are not set.
 */
export async function sendVerificationCode(
  phone: string,
  channel: "sms" | "call",
): Promise<void> {
  if (!hasVerify) {
    console.warn("[twilio/verify] Not configured – verification not sent.", { phone, channel });
    return;
  }

  const { default: twilio } = await import("twilio");
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!,
  );

  await client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
    .verifications.create({ to: phone, channel });
}

/**
 * Check a verification code via Twilio Verify.
 * Returns true if the code is approved, false otherwise.
 * In dev/mock mode (no Twilio configured), any 6-digit input is accepted.
 */
export async function checkVerificationCode(
  phone: string,
  code: string,
): Promise<boolean> {
  if (!hasVerify) {
    console.warn("[twilio/verify] Not configured – treating code as valid in dev.", { phone });
    return true;
  }

  const { default: twilio } = await import("twilio");
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!,
  );

  try {
    const result = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verificationChecks.create({ to: phone, code });

    return result.status === "approved";
  } catch {
    // Twilio throws when the code is wrong/expired or max attempts exceeded
    return false;
  }
}
