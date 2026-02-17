import { describe, it, expect } from "vitest";
import {
  sanitizePostgrestFilter,
  sanitizeMeiliFilter,
  isValidUUID,
  isValidHttpUrl,
} from "@/shared/lib/utils/sanitize";

// ============================================
// sanitizePostgrestFilter
// ============================================
describe("sanitizePostgrestFilter", () => {
  it("should pass through normal text", () => {
    expect(sanitizePostgrestFilter("óculos de sol")).toBe("óculos de sol");
  });

  it("should remove commas (PostgREST OR separator)", () => {
    expect(sanitizePostgrestFilter("a,b")).toBe("ab");
  });

  it("should remove dots (PostgREST operator separator)", () => {
    expect(sanitizePostgrestFilter("id.eq.123")).toBe("ideq123");
  });

  it("should remove parentheses", () => {
    expect(sanitizePostgrestFilter("test(injection)")).toBe("testinjection");
  });

  it("should remove percent signs", () => {
    expect(sanitizePostgrestFilter("%attack%")).toBe("attack");
  });

  it("should remove backslashes", () => {
    expect(sanitizePostgrestFilter("test\\escape")).toBe("testescape");
  });

  it("should trim whitespace", () => {
    expect(sanitizePostgrestFilter("  hello  ")).toBe("hello");
  });

  it("should handle empty string", () => {
    expect(sanitizePostgrestFilter("")).toBe("");
  });

  it("should block PostgREST filter injection attempt", () => {
    // Attack: inject extra filter clause via comma
    const attack = "%,id.eq.any_id%";
    const result = sanitizePostgrestFilter(attack);
    expect(result).not.toContain(",");
    expect(result).not.toContain(".");
    expect(result).not.toContain("%");
  });

  it("should preserve hyphens (common in slugs)", () => {
    expect(sanitizePostgrestFilter("minha-otica")).toBe("minha-otica");
  });

  it("should preserve accented characters", () => {
    expect(sanitizePostgrestFilter("óculos café")).toBe("óculos café");
  });
});

// ============================================
// sanitizeMeiliFilter
// ============================================
describe("sanitizeMeiliFilter", () => {
  it("should pass through normal UUIDs", () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000";
    expect(sanitizeMeiliFilter(uuid)).toBe(uuid);
  });

  it("should escape double quotes", () => {
    expect(sanitizeMeiliFilter('test"injection')).toBe('test\\"injection');
  });

  it("should escape backslashes before quotes", () => {
    expect(sanitizeMeiliFilter('test\\"escape')).toBe('test\\\\\\"escape');
  });

  it("should block Meilisearch filter injection attempt", () => {
    // Attack: break out of store_id filter
    const attack = '" OR store_id = "other-store';
    const result = sanitizeMeiliFilter(attack);
    // The escaped result should not break the filter expression
    expect(result).toBe('\\" OR store_id = \\"other-store');
    // When used in `store_id = "${result}"`, the quotes are escaped
    // so it becomes a literal string, not a filter operator
  });

  it("should handle empty string", () => {
    expect(sanitizeMeiliFilter("")).toBe("");
  });
});

// ============================================
// isValidUUID
// ============================================
describe("isValidUUID", () => {
  it("should accept valid UUID v4", () => {
    expect(isValidUUID("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });

  it("should accept lowercase UUID", () => {
    expect(isValidUUID("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });

  it("should accept uppercase UUID", () => {
    expect(isValidUUID("550E8400-E29B-41D4-A716-446655440000")).toBe(true);
  });

  it("should reject empty string", () => {
    expect(isValidUUID("")).toBe(false);
  });

  it("should reject random string", () => {
    expect(isValidUUID("not-a-uuid")).toBe(false);
  });

  it("should reject UUID without hyphens", () => {
    expect(isValidUUID("550e8400e29b41d4a716446655440000")).toBe(false);
  });

  it("should reject UUID with extra characters", () => {
    expect(isValidUUID("550e8400-e29b-41d4-a716-446655440000-extra")).toBe(
      false
    );
  });

  it("should reject SQL injection in UUID field", () => {
    expect(isValidUUID("'; DROP TABLE stores; --")).toBe(false);
  });
});

// ============================================
// isValidHttpUrl
// ============================================
describe("isValidHttpUrl", () => {
  it("should accept https URL", () => {
    expect(isValidHttpUrl("https://example.com/image.jpg")).toBe(true);
  });

  it("should accept http URL", () => {
    expect(isValidHttpUrl("http://localhost:3000")).toBe(true);
  });

  it("should reject file:// protocol (SSRF)", () => {
    expect(isValidHttpUrl("file:///etc/passwd")).toBe(false);
  });

  it("should reject javascript: protocol (XSS)", () => {
    expect(isValidHttpUrl("javascript:alert(1)")).toBe(false);
  });

  it("should reject ftp:// protocol", () => {
    expect(isValidHttpUrl("ftp://files.example.com/data")).toBe(false);
  });

  it("should reject data: URI", () => {
    expect(isValidHttpUrl("data:text/html,<script>alert(1)</script>")).toBe(
      false
    );
  });

  it("should reject empty string", () => {
    expect(isValidHttpUrl("")).toBe(false);
  });

  it("should reject malformed URL", () => {
    expect(isValidHttpUrl("not a url")).toBe(false);
  });

  it("should accept URL with path and query", () => {
    expect(
      isValidHttpUrl("https://api.example.com/v1/image?id=123&size=large")
    ).toBe(true);
  });
});
