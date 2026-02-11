// ============================================
// OCCHIALE - Meilisearch Client
// Typo-tolerant search engine for products
// ============================================

import { MeiliSearch, type Index } from "meilisearch";

// ------------------------------------------
// Types
// ------------------------------------------

export interface MeiliProduct {
  id: string;
  store_id: string;
  name: string;
  brand: string | null;
  category: string;
  description_seo: string | null;
  price: number; // cents
  compare_price: number | null;
  stock_qty: number;
  is_active: boolean;
  images: string[];
  specs: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ProductSearchResult {
  hits: MeiliProduct[];
  query: string;
  processingTimeMs: number;
  totalHits: number;
}

// ------------------------------------------
// Client Singleton
// ------------------------------------------

let _client: MeiliSearch | null = null;

function getMeiliClient(): MeiliSearch {
  if (_client) return _client;

  const host = process.env.MEILISEARCH_URL;
  const apiKey = process.env.MEILISEARCH_API_KEY;

  if (!host) {
    throw new Error("Missing MEILISEARCH_URL environment variable");
  }

  _client = new MeiliSearch({
    host,
    apiKey: apiKey ?? undefined,
  });

  return _client;
}

// ------------------------------------------
// Index Accessors
// ------------------------------------------

/**
 * Get the products index.
 * This is the main index used by AI tools for product search.
 */
export function getProductsIndex(): Index<MeiliProduct> {
  return getMeiliClient().index<MeiliProduct>("products");
}

// ------------------------------------------
// Search
// ------------------------------------------

/**
 * Search products with Meilisearch.
 * Supports typo tolerance, faceted filters, and sorting.
 */
export async function searchProducts(
  storeId: string,
  query: string,
  options?: {
    category?: string;
    brand?: string;
    maxPrice?: number; // in reais (will be converted to centavos)
    limit?: number;
    sort?: string[];
  }
): Promise<ProductSearchResult> {
  const index = getProductsIndex();
  const limit = Math.min(options?.limit ?? 10, 50);

  // Build filter array
  const filters: string[] = [`store_id = "${storeId}"`, "is_active = true"];

  if (options?.category) {
    filters.push(`category = "${options.category}"`);
  }

  if (options?.brand) {
    filters.push(`brand = "${options.brand}"`);
  }

  if (options?.maxPrice) {
    filters.push(`price <= ${options.maxPrice * 100}`);
  }

  const result = await index.search(query, {
    filter: filters.join(" AND "),
    limit,
    sort: options?.sort ?? ["price:asc"],
    attributesToHighlight: ["name", "brand"],
  });

  return {
    hits: result.hits as MeiliProduct[],
    query: result.query,
    processingTimeMs: result.processingTimeMs,
    totalHits: result.estimatedTotalHits ?? result.hits.length,
  };
}

/**
 * Health check — returns true if Meilisearch is reachable.
 */
export async function isMeiliHealthy(): Promise<boolean> {
  try {
    const client = getMeiliClient();
    const health = await client.health();
    return health.status === "available";
  } catch {
    return false;
  }
}
