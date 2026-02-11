import { createClient } from "@/lib/supabase/server";

// ------------------------------------------
// Types
// ------------------------------------------

export interface DailySales {
  date: string; // YYYY-MM-DD
  revenue: number; // cents
  orders: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number; // cents
}

export interface PaymentMethodBreakdown {
  method: string;
  count: number;
  total: number; // cents
}

export interface OrderStatusBreakdown {
  status: string;
  count: number;
}

export interface CustomerGrowth {
  date: string; // YYYY-MM-DD
  newCustomers: number;
}

export interface AnalyticsData {
  dailySales: DailySales[];
  topProducts: TopProduct[];
  paymentMethods: PaymentMethodBreakdown[];
  orderStatuses: OrderStatusBreakdown[];
  customerGrowth: CustomerGrowth[];
  conversionRate: number;
  totalCustomers: number;
  returningCustomers: number;
}

// ------------------------------------------
// Queries
// ------------------------------------------

/**
 * Get daily sales for the last N days.
 */
export async function getDailySales(
  storeId: string,
  days: number = 30
): Promise<DailySales[]> {
  const supabase = await createClient();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: orders } = await supabase
    .from("orders")
    .select("total, created_at")
    .eq("store_id", storeId)
    .eq("payment_status", "paid")
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: true });

  if (!orders || orders.length === 0) {
    return generateEmptyDays(days);
  }

  // Group by date
  const byDate = new Map<string, { revenue: number; orders: number }>();

  // Pre-fill all days
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0]!;
    byDate.set(key, { revenue: 0, orders: 0 });
  }

  for (const order of orders) {
    const key = new Date(order.created_at).toISOString().split("T")[0]!;
    const existing = byDate.get(key) ?? { revenue: 0, orders: 0 };
    existing.revenue += order.total;
    existing.orders += 1;
    byDate.set(key, existing);
  }

  return Array.from(byDate.entries()).map(([date, data]) => ({
    date,
    revenue: data.revenue,
    orders: data.orders,
  }));
}

/**
 * Get top selling products.
 */
export async function getTopProducts(
  storeId: string,
  limit: number = 5
): Promise<TopProduct[]> {
  const supabase = await createClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get paid orders from last 30 days
  const { data: orders } = await supabase
    .from("orders")
    .select("id")
    .eq("store_id", storeId)
    .eq("payment_status", "paid")
    .gte("created_at", thirtyDaysAgo.toISOString());

  if (!orders || orders.length === 0) return [];

  const orderIds = orders.map((o) => o.id);

  // Get order items for those orders
  const { data: items } = await supabase
    .from("order_items")
    .select("product_id, quantity, unit_price, products(name)")
    .in("order_id", orderIds);

  if (!items || items.length === 0) return [];

  // Aggregate by product
  const byProduct = new Map<
    string,
    { name: string; totalQuantity: number; totalRevenue: number }
  >();

  for (const item of items) {
    const existing = byProduct.get(item.product_id) ?? {
      name:
        (item.products as unknown as { name: string })?.name ?? "Desconhecido",
      totalQuantity: 0,
      totalRevenue: 0,
    };
    existing.totalQuantity += item.quantity;
    existing.totalRevenue += item.unit_price * item.quantity;
    byProduct.set(item.product_id, existing);
  }

  return Array.from(byProduct.entries())
    .map(([productId, data]) => ({
      productId,
      ...data,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit);
}

/**
 * Get payment method breakdown.
 */
export async function getPaymentMethodBreakdown(
  storeId: string
): Promise<PaymentMethodBreakdown[]> {
  const supabase = await createClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: orders } = await supabase
    .from("orders")
    .select("payment_method, total")
    .eq("store_id", storeId)
    .eq("payment_status", "paid")
    .gte("created_at", thirtyDaysAgo.toISOString());

  if (!orders || orders.length === 0) return [];

  const byMethod = new Map<string, { count: number; total: number }>();

  for (const order of orders) {
    const method = order.payment_method ?? "outro";
    const existing = byMethod.get(method) ?? { count: 0, total: 0 };
    existing.count += 1;
    existing.total += order.total;
    byMethod.set(method, existing);
  }

  return Array.from(byMethod.entries()).map(([method, data]) => ({
    method,
    ...data,
  }));
}

/**
 * Get order status breakdown.
 */
export async function getOrderStatusBreakdown(
  storeId: string
): Promise<OrderStatusBreakdown[]> {
  const supabase = await createClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: orders } = await supabase
    .from("orders")
    .select("status")
    .eq("store_id", storeId)
    .gte("created_at", thirtyDaysAgo.toISOString());

  if (!orders || orders.length === 0) return [];

  const byStatus = new Map<string, number>();

  for (const order of orders) {
    byStatus.set(order.status, (byStatus.get(order.status) ?? 0) + 1);
  }

  return Array.from(byStatus.entries()).map(([status, count]) => ({
    status,
    count,
  }));
}

/**
 * Get customer growth over time.
 */
export async function getCustomerGrowth(
  storeId: string,
  days: number = 30
): Promise<CustomerGrowth[]> {
  const supabase = await createClient();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: customers } = await supabase
    .from("customers")
    .select("created_at")
    .eq("store_id", storeId)
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: true });

  // Pre-fill all days
  const byDate = new Map<string, number>();
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    byDate.set(d.toISOString().split("T")[0]!, 0);
  }

  if (customers) {
    for (const c of customers) {
      const key = new Date(c.created_at).toISOString().split("T")[0]!;
      byDate.set(key, (byDate.get(key) ?? 0) + 1);
    }
  }

  return Array.from(byDate.entries()).map(([date, newCustomers]) => ({
    date,
    newCustomers,
  }));
}

/**
 * Get conversion and retention metrics.
 */
export async function getConversionMetrics(storeId: string) {
  const supabase = await createClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Total customers
  const { count: totalCustomers } = await supabase
    .from("customers")
    .select("id", { count: "exact", head: true })
    .eq("store_id", storeId);

  // Customers who made at least one purchase
  const { count: purchasingCustomers } = await supabase
    .from("customers")
    .select("id", { count: "exact", head: true })
    .eq("store_id", storeId)
    .not("last_purchase_at", "is", null);

  // Returning customers (more than 1 order)
  const { data: orderCounts } = await supabase
    .from("orders")
    .select("customer_id")
    .eq("store_id", storeId)
    .eq("payment_status", "paid");

  const customerOrderMap = new Map<string, number>();
  if (orderCounts) {
    for (const o of orderCounts) {
      customerOrderMap.set(
        o.customer_id,
        (customerOrderMap.get(o.customer_id) ?? 0) + 1
      );
    }
  }

  const returningCustomers = Array.from(customerOrderMap.values()).filter(
    (c) => c > 1
  ).length;

  const total = totalCustomers ?? 0;
  const purchasing = purchasingCustomers ?? 0;
  const conversionRate = total > 0 ? (purchasing / total) * 100 : 0;

  return {
    totalCustomers: total,
    purchasingCustomers: purchasing,
    returningCustomers,
    conversionRate: Math.round(conversionRate * 10) / 10,
  };
}

// ------------------------------------------
// Helpers
// ------------------------------------------

function generateEmptyDays(days: number): DailySales[] {
  const result: DailySales[] = [];
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result.push({
      date: d.toISOString().split("T")[0]!,
      revenue: 0,
      orders: 0,
    });
  }
  return result;
}
