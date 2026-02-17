import { createClient } from "@/shared/lib/supabase/server";

export interface CustomersFilters {
  search?: string;
  page?: number;
  perPage?: number;
}

/**
 * Get paginated customers with filters.
 */
export async function getCustomers(
  storeId: string,
  filters: CustomersFilters = {}
) {
  const supabase = await createClient();
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? 20;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("customers")
    .select("id, name, email, phone, ltv, last_purchase_at, created_at", {
      count: "exact",
    })
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
    );
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("Failed to fetch customers:", error.message);
    return { customers: [], total: 0 };
  }

  return {
    customers: data ?? [],
    total: count ?? 0,
  };
}

/**
 * Get single customer by ID with details.
 */
export async function getCustomerById(customerId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Get orders for a specific customer.
 */
export async function getCustomerOrders(customerId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, total, status, payment_status, payment_method, created_at"
    )
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Failed to fetch customer orders:", error.message);
    return [];
  }

  return data ?? [];
}

/**
 * Get prescriptions for a specific customer.
 */
export async function getCustomerPrescriptions(customerId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("prescriptions")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch customer prescriptions:", error.message);
    return [];
  }

  return data ?? [];
}
