import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/types/database";

export interface ProductsFilters {
  category?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  perPage?: number;
}

/**
 * Get paginated products with filters.
 */
export async function getProducts(
  storeId: string,
  filters: ProductsFilters = {}
) {
  const supabase = await createClient();
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? 20;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("products")
    .select(
      "id, name, brand, category, price, compare_price, stock_qty, is_active, images, created_at, sku",
      { count: "exact" }
    )
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.isActive !== undefined) {
    query = query.eq("is_active", filters.isActive);
  }

  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`
    );
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("Failed to fetch products:", error.message);
    return { products: [], total: 0 };
  }

  return {
    products: data ?? [],
    total: count ?? 0,
  };
}

/**
 * Get single product by ID (for edit form).
 */
export async function getProductById(productId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Create a new product.
 */
export async function createProduct(
  storeId: string,
  input: {
    name: string;
    description_seo: string;
    price: number;
    compare_price?: number;
    category: string;
    brand: string;
    model?: string;
    sku?: string;
    images: string[];
    specs: Json;
    stock_qty: number;
    is_active: boolean;
  }
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .insert({
      store_id: storeId,
      name: input.name,
      description_seo: input.description_seo,
      price: input.price,
      compare_price: input.compare_price ?? null,
      category: input.category,
      brand: input.brand,
      model: input.model ?? null,
      sku: input.sku ?? null,
      images: input.images,
      specs: input.specs,
      stock_qty: input.stock_qty,
      is_active: input.is_active,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create product: ${error.message}`);
  }

  return data;
}

/**
 * Update an existing product.
 */
export async function updateProduct(
  productId: string,
  input: Partial<{
    name: string;
    description_seo: string;
    price: number;
    compare_price: number | null;
    category: string;
    brand: string;
    model: string | null;
    sku: string | null;
    images: string[];
    specs: Json;
    stock_qty: number;
    is_active: boolean;
  }>
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update(input)
    .eq("id", productId);

  if (error) {
    throw new Error(`Failed to update product: ${error.message}`);
  }
}

/**
 * Delete a product (hard delete).
 */
export async function deleteProduct(productId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    throw new Error(`Failed to delete product: ${error.message}`);
  }
}

/**
 * Toggle product active status.
 */
export async function toggleProductActive(
  productId: string,
  isActive: boolean
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", productId);

  if (error) {
    throw new Error(`Failed to toggle product: ${error.message}`);
  }
}
