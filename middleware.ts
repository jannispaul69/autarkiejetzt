import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page through without auth check
  if (pathname === "/portal/login") {
    return NextResponse.next();
  }

  // Build a response we can attach refreshed cookies to
  const response = NextResponse.next({ request });

  // SSR Supabase client — reads + refreshes session via cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // getUser() validates JWT with Supabase Auth server (more secure than getSession)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/portal/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin-only routes — check buyer role via DB
  if (pathname.startsWith("/portal/admin")) {
    const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (serviceUrl && serviceKey) {
      const { createClient } = await import("@supabase/supabase-js");
      const adminDb = createClient(serviceUrl, serviceKey);
      const { data: buyer } = await adminDb
        .from("buyers")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (!buyer || buyer.role !== "admin") {
        return NextResponse.redirect(new URL("/portal/dashboard", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/portal/:path*"],
};
