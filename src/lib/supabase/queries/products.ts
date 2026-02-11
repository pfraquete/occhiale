import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/types/database";

export type ProductRow = Tables<"products">;

export interface ProductFilters {
  storeId: string;
  category?: string;
  brand?: string;
  q?: string; // search query
  frameShape?: string;
  frameMaterial?: string;
  priceMin?: number; // cents
  priceMax?: number; // cents
  sort?: "preco_asc" | "preco_desc" | "recentes" | "nome";
  page?: number;
  perPage?: number;
}

export interface ProductsResult {
  products: ProductRow[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Fetch filtered products for catalog page.
 */
export async function getFilteredProducts(
  filters: ProductFilters
): Promise<ProductsResult> {
  const supabase = await createClient();
  const perPage = filters.perPage ?? 24;
  const page = filters.page ?? 1;
  const offset = (page - 1) * perPage;

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("store_id", filters.storeId)
    .eq("is_active", true);

  // Category filter
  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  // Brand filter
  if (filters.brand) {
    query = query.ilike("brand", filters.brand);
  }

  // Search query
  if (filters.q) {
    query = query.or(
      `name.ilike.%${filters.q}%,brand.ilike.%${filters.q}%,description.ilike.%${filters.q}%`
    );
  }

  // Specs filters (JSONB)
  if (filters.frameShape) {
    query = query.filter("specs->frameShape", "eq", `"${filters.frameShape}"`);
  }
  if (filters.frameMaterial) {
    query = query.filter(
      "specs->frameMaterial",
      "eq",
      `"${filters.frameMaterial}"`
    );
  }

  // Price range
  if (filters.priceMin) {
    query = query.gte("price", filters.priceMin);
  }
  if (filters.priceMax) {
    query = query.lte("price", filters.priceMax);
  }

  // Sorting
  switch (filters.sort) {
    case "preco_asc":
      query = query.order("price", { ascending: true });
      break;
    case "preco_desc":
      query = query.order("price", { ascending: false });
      break;
    case "nome":
      query = query.order("name", { ascending: true });
      break;
    case "recentes":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  // Pagination
  query = query.range(offset, offset + perPage - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("getFilteredProducts error:", error);
    return { products: [], total: 0, page, totalPages: 0 };
  }

  const total = count ?? 0;

  return {
    products: data ?? [],
    total,
    page,
    totalPages: Math.ceil(total / perPage),
  };
}

/**
 * Fetch a single product by ID.
 */
export async function getProductById(
  productId: string
): Promise<ProductRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Fetch related products (same category, exclude current).
 */
export async function getRelatedProducts(
  storeId: string,
  category: string,
  excludeId: string,
  limit = 4
): Promise<ProductRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", storeId)
    .eq("category", category)
    .eq("is_active", true)
    .neq("id", excludeId)
    .gt("stock_qty", 0)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data ?? [];
}

/**
 * Get distinct brands for a store (for filter sidebar).
 */
export async function getBrandsForStore(storeId: string): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("brand")
    .eq("store_id", storeId)
    .eq("is_active", true)
    .not("brand", "is", null);

  if (error || !data) return [];

  const brands = [
    ...new Set(data.map((p) => p.brand).filter(Boolean)),
  ] as string[];
  return brands.sort();
}
