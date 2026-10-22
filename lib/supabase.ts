import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** True when the app is wired to a real Supabase database. */
export function hasSupabase(): boolean {
  return Boolean(url && serviceKey);
}

let client: SupabaseClient | null = null;

/**
 * Server-side Supabase client (service role). The whole app sits behind a
 * password gate, so we use the service key for simple, RLS-free reads/writes.
 * Returns null when env vars are absent (dev/sample mode).
 */
export function getServerClient(): SupabaseClient | null {
  if (!hasSupabase()) return null;
  if (!client) {
    client = createClient(url as string, serviceKey as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
