import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { normalizePhone, sendSms } from "@/lib/twilio/client";
import { createServerClient } from "@/lib/supabase/server";

const schema = z.object({
  lead_id: z.string().uuid("Ungültige Lead-ID"),
  phone:   z.string().min(6, "Ungültige Telefonnummer"),
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

    const { lead_id, phone } = parsed.data;
    const normalizedPhone = normalizePhone(phone);

    const supabase = createServerClient();

    // 1. Check lead exists
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("id, phone_verified")
      .eq("id", lead_id)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: "Lead nicht gefunden" }, { status: 404 });
    }

    // 2. Already verified?
    if (lead.phone_verified) {
      return NextResponse.json({ already_verified: true });
    }

    // 3. Rate limit: max 3 SMS per lead per hour
    const { count } = await supabase
      .from("phone_verifications")
      .select("*", { count: "exact", head: true })
      .eq("lead_id", lead_id)
      .gte("created_at", new Date(Date.now() - 3_600_000).toISOString());

    if ((count ?? 0) >= 3) {
      return NextResponse.json({ error: "rate_limit" }, { status: 429 });
    }

    // 4. Generate 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // 5. Save to DB BEFORE sending SMS (so we can clean up on SMS failure)
    const { data: verification, error: insertError } = await supabase
      .from("phone_verifications")
      .insert({
        lead_id,
        phone: normalizedPhone,
        code,
        expires_at: expiresAt,
      })
      .select("id")
      .single();

    if (insertError || !verification) {
      console.error("[verify/send] DB insert error:", insertError);
      return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
    }

    // 6. Send SMS via Twilio
    try {
      await sendSms(
        normalizedPhone,
        `Dein Autarkie Jetzt Code: ${code}. Gültig 10 Min.`,
      );
    } catch (smsErr) {
      console.error("[verify/send] Twilio error:", smsErr);
      // Roll back DB entry since SMS failed
      await supabase.from("phone_verifications").delete().eq("id", verification.id);
      return NextResponse.json(
        { error: "SMS konnte nicht gesendet werden" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, expires_in: 600 });
  } catch (err) {
    console.error("[verify/send] unhandled error:", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
