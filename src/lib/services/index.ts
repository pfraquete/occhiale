// ============================================================================
// Service Layer - Barrel Export
// ============================================================================
//
// /lib/services centralizes all external integrations and service clients.
// Import from here instead of reaching into deep paths.
//
// Usage:
//   import { createSupabaseServer, searchProducts } from '@/lib/services';
// ============================================================================

// Supabase
export { createClient as createSupabaseServer } from "@/shared/lib/supabase/server";
export { createClient as createSupabaseBrowser } from "@/shared/lib/supabase/client";
export { createServiceRoleClient as createSupabaseAdmin } from "@/shared/lib/supabase/admin";

// Meilisearch
export {
  getProductsIndex,
  searchProducts,
  isMeiliHealthy,
} from "@/shared/lib/meilisearch/client";

// Email
export { sendEmail } from "@/shared/lib/email/client";

// Monitoring
export { createLogger, logger } from "@/shared/lib/monitoring/logger";

// Push Notifications
export { sendPushToStore, sendPushToUser } from "@/shared/lib/push/sender";
