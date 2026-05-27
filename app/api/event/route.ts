import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const eventSchema = z.object({
  session_id: z.string().min(1),
  event_type: z.enum([
    "form_view",
    "step_start",
    "step_complete",
    "form_abandon",
    "form_submit",
  ]),
  step_number: z.number().int().min(1).max(6).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  utm_source: z.string().optional(),
  utm_campaign: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Ungültige Eingabe" }, { status: 400 });
    }

    const supabase = createServerClient();
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const userAgent = req.headers.get("user-agent") ?? null;

    await supabase.from("form_events").insert({
      ...parsed.data,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
