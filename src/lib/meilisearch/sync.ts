// ============================================
// OCCHIALE - Meilisearch Sync
// Syncs products from Supabase to Meilisearch
// ============================================

import { createServiceRoleClient } from "@/lib/supabase/admin";
import { getProductsIndex, type MeiliProduct } from "./client";

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
// Sync Functions
// ------------------------------------------

/**
 * Sync all products for a specific store to Meilisearch.
 * Fetches all products from Supabase and bulk upserts them.
 */
export async function syncStoreProducts(storeId: string): Promise<SyncResult> {
  const start = Date.now();

  try {
    const supabase = createServiceRoleClient();
    const index = getProductsIndex();

    // Fetch all products for this store
    const { data: products, error } = await supabase
      .from("products")
      .select(
        "id, store_id, name, brand, category, description_seo, price, compare_price, stock_qty, is_active, images, specs, created_at, updated_at"
      )
      .eq("store_id", storeId);

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    if (!products || products.length === 0) {
      return {
        success: true,
        indexed: 0,
        deleted: 0,
        durationMs: Date.now() - start,
      };
    }

    // Transform to MeiliProduct format
    const documents: MeiliProduct[] = products.map((p) => ({
      id: p.id,
      store_id: p.store_id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      description_seo: p.description_seo,
      price: p.price,
      compare_price: p.compare_price,
      stock_qty: p.stock_qty,
      is_active: p.is_active,
      images: (p.images as string[]) ?? [],
      specs: (p.specs as Record<string, unknown>) ?? {},
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));

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
    const supabase = createServiceRoleClient();
    const index = getProductsIndex();

    // Fetch all products
    const { data: products, error } = await supabase
      .from("products")
      .select(
        "id, store_id, name, brand, category, description_seo, price, compare_price, stock_qty, is_active, images, specs, created_at, updated_at"
      );

    if (error) {
      throw new Error(`Failed to fetch all products: ${error.message}`);
    }

    if (!products || products.length === 0) {
      return {
        success: true,
        indexed: 0,
        deleted: 0,
        durationMs: Date.now() - start,
      };
    }

    const documents: MeiliProduct[] = products.map((p) => ({
      id: p.id,
      store_id: p.store_id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      description_seo: p.description_seo,
      price: p.price,
      compare_price: p.compare_price,
      stock_qty: p.stock_qty,
      is_active: p.is_active,
      images: (p.images as string[]) ?? [],
      specs: (p.specs as Record<string, unknown>) ?? {},
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));

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
 */
export async function removeStoreProducts(storeId: string): Promise<void> {
  const index = getProductsIndex();
  await index.deleteDocuments({
    filter: `store_id = "${storeId}"`,
  });
}
