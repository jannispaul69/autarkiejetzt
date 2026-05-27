import crypto from "crypto";

function hashValue(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

interface ConversionPayload {
  eventName: string;
  eventId: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  postalCode?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbp?: string;
  fbc?: string;
  sourceUrl: string;
}

export async function sendConversionEvent(payload: ConversionPayload) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CONVERSION_API_TOKEN;

  if (!pixelId || !token) return;

  const userData: Record<string, string> = {};
  if (payload.email) userData.em = hashValue(payload.email);
  if (payload.phone) userData.ph = hashValue(payload.phone.replace(/\D/g, ""));
  if (payload.firstName) userData.fn = hashValue(payload.firstName);
  if (payload.lastName) userData.ln = hashValue(payload.lastName);
  if (payload.postalCode) userData.zp = hashValue(payload.postalCode);
  if (payload.clientIpAddress) userData.client_ip_address = payload.clientIpAddress;
  if (payload.clientUserAgent) userData.client_user_agent = payload.clientUserAgent;
  if (payload.fbp) userData.fbp = payload.fbp;
  if (payload.fbc) userData.fbc = payload.fbc;

  const body = {
    data: [
      {
        event_name: payload.eventName,
        event_id: payload.eventId,
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: payload.sourceUrl,
        action_source: "website",
        user_data: userData,
      },
    ],
    ...(process.env.META_TEST_EVENT_CODE
      ? { test_event_code: process.env.META_TEST_EVENT_CODE }
      : {}),
  };

  await fetch(
    `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
}
