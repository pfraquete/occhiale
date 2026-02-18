// ============================================================================
// Utils - Barrel Export
// ============================================================================
//
// /lib/utils centralizes all utility functions.
// ============================================================================

export { cn } from "@/shared/lib/utils/cn";

export {
  formatCentsToBRL,
  formatCPF,
  formatPhone,
  generateOrderNumber,
  formatCEP,
  maskCardNumber,
  formatInstallment,
} from "@/shared/lib/utils/format";

export {
  sanitizePostgrestFilter,
  sanitizeMeiliFilter,
  isValidUUID,
  isValidHttpUrl,
} from "@/shared/lib/utils/sanitize";

export { rateLimit, rateLimiters } from "@/shared/lib/utils/rate-limit";

export {
  CATEGORIES,
  getCategoryByDb,
  getCategoryBySlug,
  getCategoryLabel,
} from "@/shared/lib/utils/categories";
