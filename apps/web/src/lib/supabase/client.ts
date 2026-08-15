import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client (anon key only).
 * Never place the service role key anywhere near the browser.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
