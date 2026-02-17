import { createClient } from "@/shared/lib/supabase/server";

export interface OrdersFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  perPage?: number;
}

/**
 * Get paginated orders with filters.
 * Uses authenticated client (RLS enforced).
 */
export async function getOrders(storeId: string, filters: OrdersFilters = {}) {
  const supabase = await createClient();
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? 20;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("orders")
    .select(
      "id, order_number, total, status, payment_status, payment_method, created_at, customer_id, customers(name, email)",
      { count: "exact" }
    )
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.dateFrom) {
    query = query.gte("created_at", filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte("created_at", filters.dateTo);
  }

  if (filters.search) {
    query = query.or(`order_number.ilike.%${filters.search}%`);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("Failed to fetch orders:", error.message);
    return { orders: [], total: 0 };
  }

  return {
    orders: data ?? [],
    total: count ?? 0,
  };
}

/**
 * Get single order by ID with items and customer.
 */
export async function getOrderById(orderId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      customers(id, name, email, phone),
      order_items(
        id, product_id, quantity, unit_price, lens_config,
        products(id, name, images, brand)
      )
    `
    )
    .eq("id", orderId)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Update order status.
 */
export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) {
    throw new Error(`Failed to update order status: ${error.message}`);
  }
}
