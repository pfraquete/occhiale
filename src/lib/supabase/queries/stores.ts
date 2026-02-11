import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/types/database";

export type StoreRow = Tables<"stores">;

/**
 * Fetch a store by its slug (public, no auth required).
 * Returns null if not found or inactive.
 */
export async function getStoreBySlug(slug: string): Promise<StoreRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Fetch featured/recent products for a store's home page.
 */
export async function getFeaturedProducts(
  storeId: string,
  limit = 8
): Promise<Tables<"products">[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", storeId)
    .eq("is_active", true)
    .gt("stock_qty", 0)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getFeaturedProducts error:", error);
    return [];
  }

  return data ?? [];
}
