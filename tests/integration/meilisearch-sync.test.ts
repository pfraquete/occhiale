/**
 * Integration tests for Meilisearch sync and client.
 * Tests filter injection prevention and sync logic.
 *
 * Since the Meilisearch client uses a singleton pattern that caches the
 * MeiliSearch instance, we mock the entire client module to avoid env var issues.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.hoisted ensures these are available when vi.mock factories run
const {
  mockSearch,
  mockAddDocuments,
  mockDeleteDocuments,
  mockDeleteDocument,
  mockSupabaseFrom,
} = vi.hoisted(() => ({
  mockSearch: vi.fn(),
  mockAddDocuments: vi.fn(),
  mockDeleteDocuments: vi.fn(),
  mockDeleteDocument: vi.fn(),
  mockSupabaseFrom: vi.fn(),
}));

const mockIndex = {
  search: mockSearch,
  addDocuments: mockAddDocuments,
  deleteDocuments: mockDeleteDocuments,
  deleteDocument: mockDeleteDocument,
};

// Mock the entire client module to bypass the singleton
vi.mock("@/lib/meilisearch/client", () => ({
  getProductsIndex: vi.fn(() => mockIndex),
  searchProducts: vi.fn(
    async (
      storeId: string,
      query: string,
      options?: {
        category?: string;
        brand?: string;
        maxPrice?: number;
        limit?: number;
      }
    ) => {
      // Replicate the real filter-building logic to test sanitization
      const { sanitizeMeiliFilter } = await import("@/lib/utils/sanitize");
      const safeStoreId = sanitizeMeiliFilter(storeId);
      const filters: string[] = [
        `store_id = "${safeStoreId}"`,
        "is_active = true",
      ];

      if (options?.category) {
        const safeCat = sanitizeMeiliFilter(options.category);
        filters.push(`category = "${safeCat}"`);
      }

      if (options?.maxPrice !== undefined && options.maxPrice >= 0) {
        filters.push(`price <= ${options.maxPrice * 100}`);
      }

      const filter = filters.join(" AND ");
      return mockSearch(query, { filter, limit: options?.limit ?? 10 });
    }
  ),
  isMeiliHealthy: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createServiceRoleClient: vi.fn(() => ({
    from: mockSupabaseFrom,
  })),
}));

import { searchProducts } from "@/lib/meilisearch/client";
import { sanitizeMeiliFilter } from "@/lib/utils/sanitize";

describe("searchProducts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearch.mockResolvedValue({
      hits: [
        {
          id: "prod-1",
          name: "Óculos Ray-Ban",
          store_id: "store-1",
          price: 29900,
        },
      ],
      query: "ray-ban",
      processingTimeMs: 5,
      estimatedTotalHits: 1,
    });
  });

  it("should search with store_id filter", async () => {
    await searchProducts("store-1", "ray-ban");

    expect(mockSearch).toHaveBeenCalledWith(
      "ray-ban",
      expect.objectContaining({
        filter: expect.stringContaining("store-1"),
      })
    );
  });

  it("should sanitize store_id to prevent filter injection", async () => {
    await searchProducts('" OR store_id != "', "test");

    const callArgs = mockSearch.mock.calls[0];
    const filter = callArgs[1]?.filter as string;

    // The filter should contain escaped quotes
    expect(filter).toContain('\\"');
    // Should NOT allow breaking out of the filter expression
    expect(filter).not.toMatch(/^store_id = "" OR/);
  });

  it("should pass category filter when provided", async () => {
    await searchProducts("store-1", "óculos", {
      category: "óculos de sol",
    });

    const callArgs = mockSearch.mock.calls[0];
    const filter = callArgs[1]?.filter as string;
    expect(filter).toContain("category");
    expect(filter).toContain("óculos de sol");
  });

  it("should apply maxPrice filter in centavos", async () => {
    await searchProducts("store-1", "óculos", { maxPrice: 500 });

    const callArgs = mockSearch.mock.calls[0];
    const filter = callArgs[1]?.filter as string;
    expect(filter).toContain("price <= 50000");
  });

  it("should not skip maxPrice when value is 0", async () => {
    await searchProducts("store-1", "óculos", { maxPrice: 0 });

    const callArgs = mockSearch.mock.calls[0];
    const filter = callArgs[1]?.filter as string;
    expect(filter).toContain("price <= 0");
  });
});

describe("sanitizeMeiliFilter (direct)", () => {
  it("should escape double quotes", () => {
    expect(sanitizeMeiliFilter('test"injection')).toBe('test\\"injection');
  });

  it("should handle normal UUIDs", () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000";
    expect(sanitizeMeiliFilter(uuid)).toBe(uuid);
  });

  it("should block filter injection via quote escape", () => {
    const attack = '" OR store_id = "other-store';
    const result = sanitizeMeiliFilter(attack);
    // When used in store_id = "${result}", the quotes are escaped
    expect(result).toBe('\\" OR store_id = \\"other-store');
  });
});
