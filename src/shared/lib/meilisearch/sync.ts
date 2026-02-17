// ============================================
// OCCHIALE - Meilisearch Sync
// Syncs products from Supabase to Meilisearch
// ============================================

import { createServiceRoleClient } from "@/shared/lib/supabase/admin";
import { getProductsIndex, type MeiliProduct } from "./client";
import { sanitizeMeiliFilter } from "@/shared/lib/utils/sanitize";

// ------------------------------------------
// Types
// ------------------------------------------

export interface SyncResult {
  success: boolean;
  indexed: number;
  deleted: number;
  error?: string;
  durationMs: number;
}

// ------------------------------------------
// Constants
// ------------------------------------------

/** Supabase default limit is 1000 rows. We paginate to avoid silent truncation. */
const SUPABASE_PAGE_SIZE = 1000;

const PRODUCT_SELECT_COLUMNS =
  "id, store_id, name, brand, category, description_seo, price, compare_price, stock_qty, is_active, images, specs, created_at, updated_at";

// ------------------------------------------
// Helpers
// ------------------------------------------

function toMeiliProduct(p: Record<string, unknown>): MeiliProduct {
  return {
    id: p.id as string,
    store_id: p.store_id as string,
    name: p.name as string,
    brand: p.brand as string | null,
    category: p.category as string,
    description_seo: p.description_seo as string | null,
    price: p.price as number,
    compare_price: p.compare_price as number | null,
    stock_qty: p.stock_qty as number,
    is_active: p.is_active as boolean,
    images: (p.images as string[]) ?? [],
    specs: (p.specs as Record<string, unknown>) ?? {},
    created_at: p.created_at as string,
    updated_at: p.updated_at as string,
  };
}

/**
 * Fetch all rows from a Supabase query with pagination to avoid the 1000-row default limit.
 */
async function fetchAllProducts(storeId?: string): Promise<MeiliProduct[]> {
  const supabase = createServiceRoleClient();
  const allProducts: MeiliProduct[] = [];
  let offset = 0;

  while (true) {
    let query = supabase
      .from("products")
      .select(PRODUCT_SELECT_COLUMNS)
      .range(offset, offset + SUPABASE_PAGE_SIZE - 1);

    if (storeId) {
      query = query.eq("store_id", storeId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    if (!data || data.length === 0) break;

    allProducts.push(
      ...data.map((p) => toMeiliProduct(p as Record<string, unknown>))
    );

    // If we got fewer rows than page size, we've reached the end
    if (data.length < SUPABASE_PAGE_SIZE) break;
    offset += SUPABASE_PAGE_SIZE;
  }

  return allProducts;
}

// ------------------------------------------
// Sync Functions
// ------------------------------------------

/**
 * Sync all products for a specific store to Meilisearch.
 * Fetches all products from Supabase (with pagination) and bulk upserts them.
 */
export async function syncStoreProducts(storeId: string): Promise<SyncResult> {
  const start = Date.now();

  try {
    const index = getProductsIndex();
    const documents = await fetchAllProducts(storeId);

    if (documents.length === 0) {
      return {
        success: true,
        indexed: 0,
        deleted: 0,
        durationMs: Date.now() - start,
      };
    }

    // Bulk upsert (addDocuments with existing IDs updates them)
    // Meilisearch processes asynchronously — returns task info immediately
    await index.addDocuments(documents, {
      primaryKey: "id",
    });

    return {
      success: true,
      indexed: documents.length,
      deleted: 0,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      success: false,
      indexed: 0,
      deleted: 0,
      error: err instanceof Error ? err.message : "Unknown error",
      durationMs: Date.now() - start,
    };
  }
}

/**
 * Sync all products across all stores.
 * Useful for initial setup or full re-index.
 */
export async function syncAllProducts(): Promise<SyncResult> {
  const start = Date.now();

  try {
    const index = getProductsIndex();
    const documents = await fetchAllProducts();

    if (documents.length === 0) {
      return {
        success: true,
        indexed: 0,
        deleted: 0,
        durationMs: Date.now() - start,
      };
    }

    // Bulk upsert all products
    await index.addDocuments(documents, {
      primaryKey: "id",
    });

    return {
      success: true,
      indexed: documents.length,
      deleted: 0,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      success: false,
      indexed: 0,
      deleted: 0,
      error: err instanceof Error ? err.message : "Unknown error",
      durationMs: Date.now() - start,
    };
  }
}

/**
 * Remove a product from Meilisearch by ID.
 */
export async function removeProduct(productId: string): Promise<void> {
  const index = getProductsIndex();
  await index.deleteDocument(productId);
}

/**
 * Remove all products for a store from Meilisearch.
 * FIX: Sanitize storeId to prevent Meilisearch filter injection.
 */
export async function removeStoreProducts(storeId: string): Promise<void> {
  const index = getProductsIndex();
  const safeStoreId = sanitizeMeiliFilter(storeId);
  await index.deleteDocuments({
    filter: `store_id = "${safeStoreId}"`,
  });
}
