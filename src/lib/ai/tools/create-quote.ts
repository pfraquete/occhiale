// ============================================
// OCCHIALE - AI Tool: Create Quote
// Builds a price quote from selected products
// ============================================

import { createServiceRoleClient } from "@/lib/supabase/admin";
import { formatCentsToBRL } from "@/lib/utils/format";
import type { ToolContext } from "./index";

interface QuoteItem {
  productId: string;
  quantity: number;
}

export async function executeCreateQuote(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  const items = input.items as QuoteItem[] | undefined;

  if (!items || items.length === 0) {
    return JSON.stringify({
      error: "Nenhum item fornecido para o orçamento.",
    });
  }

  // FIX: Validate quantities — reject negative, zero, fractional, or excessively large values
  for (const item of items) {
    if (
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0 ||
      item.quantity > 100
    ) {
      return JSON.stringify({
        error: `Quantidade inválida para o produto ${item.productId}: ${item.quantity}. A quantidade deve ser um número inteiro entre 1 e 100.`,
      });
    }
  }

  const supabase = createServiceRoleClient();

  // Fetch products
  const productIds = items.map((i) => i.productId);
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, brand, price, compare_price, stock_qty, is_active")
    .eq("store_id", context.storeId)
    .in("id", productIds);

  if (error) {
    return JSON.stringify({
      error: `Erro ao buscar produtos: ${error.message}`,
    });
  }

  if (!products || products.length === 0) {
    return JSON.stringify({
      error: "Nenhum dos produtos informados foi encontrado.",
    });
  }

  // Fetch store shipping settings
  const { data: store } = await supabase
    .from("stores")
    .select("settings")
    .eq("id", context.storeId)
    .single();

  const settings = store?.settings as Record<string, unknown> | null;
  const shipping = settings?.shipping as
    | { defaultCost?: number; freeAbove?: number }
    | undefined;
  const defaultShippingCost = shipping?.defaultCost ?? 0;
  const freeAboveThreshold = shipping?.freeAbove ?? 0;

  // Build quote lines
  const quoteLines = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;

      if (!product.is_active) {
        return {
          productId: item.productId,
          name: product.name,
          error: "Produto indisponível",
        };
      }

      if (product.stock_qty < item.quantity) {
        return {
          productId: item.productId,
          name: product.name,
          error: `Estoque insuficiente (disponível: ${product.stock_qty})`,
        };
      }

      const lineTotal = product.price * item.quantity;

      return {
        productId: item.productId,
        name: product.name,
        brand: product.brand,
        unitPrice: formatCentsToBRL(product.price),
        unitPriceOriginal: product.compare_price
          ? formatCentsToBRL(product.compare_price)
          : null,
        quantity: item.quantity,
        lineTotal: formatCentsToBRL(lineTotal),
        lineTotalCents: lineTotal,
      };
    })
    .filter(Boolean);

  // Calculate totals
  const subtotalCents = quoteLines.reduce(
    (sum, line) =>
      sum + ((line as { lineTotalCents?: number }).lineTotalCents ?? 0),
    0
  );

  const shippingCents =
    freeAboveThreshold > 0 && subtotalCents >= freeAboveThreshold
      ? 0
      : defaultShippingCost;

  const totalCents = subtotalCents + shippingCents;

  return JSON.stringify({
    items: quoteLines,
    subtotal: formatCentsToBRL(subtotalCents),
    shipping:
      shippingCents === 0 ? "Frete grátis" : formatCentsToBRL(shippingCents),
    total: formatCentsToBRL(totalCents),
    freeShippingNote:
      freeAboveThreshold > 0 && shippingCents > 0
        ? `Frete grátis para compras acima de ${formatCentsToBRL(freeAboveThreshold)}`
        : null,
  });
}
