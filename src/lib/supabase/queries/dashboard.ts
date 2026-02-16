import { createClient } from "@/lib/supabase/server";

export interface DashboardStats {
  totalSales: number; // cents
  totalOrders: number;
  avgTicket: number; // cents
  activeProducts: number;
  clv: number; // cents
  totalRevenueAllTime: number; // cents
  repeatPurchaseRate: number; // percentage
}

/**
 * Get dashboard KPI stats for last 30 days.
 * Uses authenticated client (RLS enforced).
 */
export async function getDashboardStats(
  storeId: string
): Promise<DashboardStats> {
  const supabase = await createClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 1. Core KPIs (last 30 days)
  const { data: ordersData } = await supabase
    .from("orders")
    .select("total")
    .eq("store_id", storeId)
    .eq("payment_status", "paid")
    .gte("created_at", thirtyDaysAgo.toISOString());

  const totalSales = ordersData?.reduce((sum, o) => sum + o.total, 0) ?? 0;
  const totalOrders = ordersData?.length ?? 0;
  const avgTicket = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

  // 2. Active products count
  const { count: activeProducts } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("store_id", storeId)
    .eq("is_active", true);

  // 3. Advanced Metrics (importing from analytics queries)
  const { getLifetimeValue, getRepeatPurchaseRate } = await import("./analytics");

  const [ltvData, repeatRate] = await Promise.all([
    getLifetimeValue(storeId),
    getRepeatPurchaseRate(storeId),
  ]);

  return {
    totalSales,
    totalOrders,
    avgTicket,
    activeProducts: activeProducts ?? 0,
    clv: ltvData.ltv,
    totalRevenueAllTime: ltvData.totalRevenue,
    repeatPurchaseRate: repeatRate,
  };
}

/**
 * Get recent orders (last 10) for dashboard overview.
 */
export async function getRecentOrders(storeId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, total, status, payment_status, payment_method, created_at, customer_id, customers(name, email)"
    )
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Failed to fetch recent orders:", error.message);
    return [];
  }

  return data ?? [];
}

/**
 * Get the user's store and role from store_members.
 * Returns the first store the user belongs to.
 */
export async function getUserStoreWithRole(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("store_members")
    .select(
      "store_id, role, stores(id, name, slug, logo_url, whatsapp_number, plan, settings, is_active)"
    )
    .eq("user_id", userId)
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    storeId: data.store_id,
    role: data.role as "owner" | "admin" | "member",
    store: data.stores as unknown as {
      id: string;
      name: string;
      slug: string;
      logo_url: string | null;
      whatsapp_number: string | null;
      plan: string;
      settings: Record<string, unknown>;
      is_active: boolean;
    },
  };
}
