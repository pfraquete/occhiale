import { createServiceRoleClient } from "@/lib/supabase/admin";
import type { Json, TablesInsert } from "@/lib/types/database";

export interface CreateOrderParams {
  storeId: string;
  customerId: string;
  orderNumber: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  paymentMethod: string;
  shippingAddress: Json | null;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    lensConfig?: Json | null;
  }[];
}

export interface CreateOrderResult {
  orderId: string;
  orderNumber: string;
}

/**
 * Create an order with items (service role, bypasses RLS).
 */
export async function createOrder(
  params: CreateOrderParams
): Promise<CreateOrderResult> {
  const supabase = createServiceRoleClient();

  // Insert order
  const orderInsert: TablesInsert<"orders"> = {
    store_id: params.storeId,
    customer_id: params.customerId,
    order_number: params.orderNumber,
    subtotal: params.subtotal,
    shipping_cost: params.shippingCost,
    discount: params.discount,
    total: params.total,
    payment_method: params.paymentMethod,
    shipping_address: params.shippingAddress,
    status: "pending",
    payment_status: "pending",
  };

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert(orderInsert)
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    throw new Error(`Failed to create order: ${orderError?.message}`);
  }

  // Insert order items
  const itemsInsert: TablesInsert<"order_items">[] = params.items.map(
    (item) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      lens_config: item.lensConfig ?? null,
    })
  );

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemsInsert);

  if (itemsError) {
    throw new Error(`Failed to create order items: ${itemsError.message}`);
  }

  return {
    orderId: order.id,
    orderNumber: order.order_number,
  };
}

/**
 * Get order by order_number.
 */
export async function getOrderByNumber(orderNumber: string) {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_number", orderNumber)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Update order payment status (called from webhook).
 */
export async function updateOrderPayment(
  paymentId: string,
  updates: {
    paymentStatus: string;
    status?: string;
  }
) {
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: updates.paymentStatus,
      ...(updates.status ? { status: updates.status } : {}),
    })
    .eq("payment_id", paymentId);

  if (error) {
    throw new Error(`Failed to update order payment: ${error.message}`);
  }
}

/**
 * Set payment_id on order after Pagar.me charge creation.
 */
export async function setOrderPaymentId(orderId: string, paymentId: string) {
  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("orders")
    .update({ payment_id: paymentId })
    .eq("id", orderId);

  if (error) {
    throw new Error(`Failed to set payment_id: ${error.message}`);
  }
}

/**
 * Decrement stock for products in an order.
 * Reads current stock, then decrements (never below 0).
 */
export async function decrementStock(
  items: { productId: string; quantity: number }[]
) {
  const supabase = createServiceRoleClient();

  for (const item of items) {
    const { data: product } = await supabase
      .from("products")
      .select("stock_qty")
      .eq("id", item.productId)
      .single();

    if (product) {
      await supabase
        .from("products")
        .update({
          stock_qty: Math.max(0, product.stock_qty - item.quantity),
        })
        .eq("id", item.productId);
    }
  }
}
