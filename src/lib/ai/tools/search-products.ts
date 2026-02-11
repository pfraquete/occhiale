// ============================================
// OCCHIALE - AI Tool: Search Products
// Searches the product catalog for the store
// ============================================

import { createServiceRoleClient } from "@/lib/supabase/admin";
import { formatCentsToBRL } from "@/lib/utils/format";
import type { ToolContext } from "./index";

export async function executeSearchProducts(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  const supabase = createServiceRoleClient();

  const query = (input.query as string) ?? "";
  const category = input.category as string | undefined;
  const brand = input.brand as string | undefined;
  const maxPrice = input.maxPrice as number | undefined;
  const limit = Math.min((input.limit as number) ?? 5, 10);

  let dbQuery = supabase
    .from("products")
    .select(
      "id, name, brand, category, price, compare_price, stock_qty, specs, images, is_active"
    )
    .eq("store_id", context.storeId)
    .eq("is_active", true)
    .gt("stock_qty", 0);

  // Category filter
  if (category) {
    dbQuery = dbQuery.eq("category", category);
  }

  // Brand filter (case-insensitive)
  if (brand) {
    dbQuery = dbQuery.ilike("brand", `%${brand}%`);
  }

  // Max price filter (convert reais to centavos)
  if (maxPrice) {
    dbQuery = dbQuery.lte("price", maxPrice * 100);
  }

  // Text search on name and brand
  if (query) {
    dbQuery = dbQuery.or(
      `name.ilike.%${query}%,brand.ilike.%${query}%,description_seo.ilike.%${query}%`
    );
  }

  const { data: products, error } = await dbQuery
    .order("price", { ascending: true })
    .limit(limit);

  if (error) {
    return JSON.stringify({
      error: `Erro ao buscar produtos: ${error.message}`,
    });
  }

  if (!products || products.length === 0) {
    return JSON.stringify({
      message: "Nenhum produto encontrado com esses critérios.",
      suggestion: "Tente buscar com termos mais amplos ou outra categoria.",
    });
  }

  const results = products.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    price: formatCentsToBRL(p.price),
    priceOriginal: p.compare_price ? formatCentsToBRL(p.compare_price) : null,
    inStock: p.stock_qty > 0,
    stockQty: p.stock_qty,
    specs: p.specs,
    imageUrl: (p.images as string[])?.[0] ?? null,
  }));

  return JSON.stringify({
    count: results.length,
    products: results,
  });
}
