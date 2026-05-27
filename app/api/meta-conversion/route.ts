import { NextRequest, NextResponse } from "next/server";
import { sendConversionEvent } from "@/lib/meta/conversion-api";
import { z } from "zod";

const schema = z.object({
  eventName: z.string().min(1),
  eventId: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  postalCode: z.string().optional(),
  fbp: z.string().optional(),
  fbc: z.string().optional(),
  sourceUrl: z.string().url(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Ungültige Eingabe" }, { status: 400 });
    }

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;
    const userAgent = req.headers.get("user-agent") ?? undefined;

    await sendConversionEvent({
      ...parsed.data,
      clientIpAddress: ipAddress,
      clientUserAgent: userAgent,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
