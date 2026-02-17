import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/shared/types/database";

/**
 * Create a Supabase client with the SERVICE ROLE key.
 * This bypasses ALL RLS policies — use ONLY in:
 * - API Routes (checkout, webhooks)
 * - Server Actions that need admin access
 *
 * NEVER expose this client to the browser.
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
