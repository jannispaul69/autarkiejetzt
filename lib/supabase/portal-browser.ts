import { createBrowserClient } from "@supabase/ssr";

/**
 * Cookie-based Supabase client for the portal.
 * Uses @supabase/ssr so the session is stored in cookies,
 * making it readable by the middleware.
 */
export function createPortalBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
