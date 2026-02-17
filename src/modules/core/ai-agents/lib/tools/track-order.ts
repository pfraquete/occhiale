// ============================================
// OCCHIALE - AI Tool: Track Order
// Looks up order status by order number
// ============================================

import { createServiceRoleClient } from "@/shared/lib/supabase/admin";
import { formatCentsToBRL } from "@/shared/lib/utils/format";
import { sanitizePostgrestFilter } from "@/shared/lib/utils/sanitize";
import type { ToolContext } from "./index";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  processing: "Em processamento",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Aguardando pagamento",
  paid: "Pago",
  failed: "Falhou",
  canceled: "Cancelado",
  refunded: "Reembolsado",
};

export async function executeTrackOrder(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  const rawOrderNumber = input.orderNumber as string | undefined;

  if (!rawOrderNumber) {
    return JSON.stringify({ error: "Número do pedido não fornecido." });
  }

  // FIX: Sanitize order number to prevent PostgREST filter injection
  const safeOrderNumber = sanitizePostgrestFilter(rawOrderNumber);
  if (!safeOrderNumber) {
    return JSON.stringify({ error: "Número do pedido inválido." });
  }

  const supabase = createServiceRoleClient();

  // FIX: Use .maybeSingle() instead of .single() to avoid PGRST116
  // when multiple partial matches exist with .ilike() + .limit(1)
  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, payment_status, total, subtotal, shipping_cost, discount, payment_method, shipping_tracking, created_at, updated_at"
    )
    .eq("store_id", context.storeId)
    .ilike("order_number", `%${safeOrderNumber}%`)
    .limit(1)
    .maybeSingle();

  if (!order) {
    return JSON.stringify({
      found: false,
      message: `Pedido "${safeOrderNumber}" não encontrado. Verifique o número e tente novamente.`,
    });
  }

  // Get order items
  const { data: items } = await supabase
    .from("order_items")
    .select("id, quantity, unit_price, products(name, brand)")
    .eq("order_id", order.id);

  return JSON.stringify({
    found: true,
    order: {
      number: order.order_number,
      status: STATUS_LABELS[order.status] ?? order.status,
      statusCode: order.status,
      paymentStatus:
        PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status,
      paymentMethod: order.payment_method,
      total: formatCentsToBRL(order.total),
      subtotal: formatCentsToBRL(order.subtotal),
      shipping: formatCentsToBRL(order.shipping_cost),
      discount: order.discount > 0 ? formatCentsToBRL(order.discount) : null,
      trackingCode: order.shipping_tracking,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    },
    items:
      items?.map((i) => ({
        name:
          (i.products as { name: string; brand: string } | null)?.name ??
          "Produto",
        brand: (i.products as { name: string; brand: string } | null)?.brand,
        quantity: i.quantity,
        unitPrice: formatCentsToBRL(i.unit_price),
      })) ?? [],
  });
}
