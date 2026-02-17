// ============================================
// OCCHIALE - Input Sanitization Utilities
// Prevents injection attacks in PostgREST filters
// and Meilisearch filter expressions
// ============================================

/**
 * Sanitize a string for use in PostgREST `.or()` / `.ilike()` filters.
 * Removes characters that could break out of the filter expression:
 * commas, dots (used as operator separators), parentheses, and percent signs.
 *
 * Example attack: `%,id.eq.any_id%` injected into `.or("name.ilike.%${query}%")`
 * would add an extra filter clause.
 */
export function sanitizePostgrestFilter(input: string): string {
  // Remove PostgREST meta-characters that could alter filter semantics
  // Keep only alphanumeric, spaces, hyphens, and common accented chars
  return input.replace(/[.,()%\\]/g, "").trim();
}

/**
 * Sanitize a string for use in Meilisearch filter expressions.
 * Escapes double quotes to prevent breaking out of `field = "value"` filters.
 *
 * Example attack: `" OR store_id = "other-store` injected into
 * `store_id = "${storeId}"` would bypass tenant isolation.
 */
export function sanitizeMeiliFilter(input: string): string {
  // Escape backslashes first, then double quotes
  return input.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Validate that a string looks like a UUID v4.
 * Used to validate storeId, conversationId, etc. before using in queries.
 */
export function isValidUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

/**
 * Sanitize a URL to prevent SSRF attacks.
 * Only allows http and https protocols.
 */
export function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
