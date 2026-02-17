import { createServiceRoleClient } from "@/shared/lib/supabase/admin";
import type { Tables, TablesInsert } from "@/shared/types/database";

export type CustomerRow = Tables<"customers">;

interface FindOrCreateParams {
  storeId: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  userId?: string; // auth.uid() if authenticated
}

/**
 * Find or create a customer by email+store_id.
 * If authenticated, also links user_id.
 * Uses service role client (called from API routes).
 */
export async function findOrCreateCustomer(
  params: FindOrCreateParams
): Promise<CustomerRow> {
  const supabase = createServiceRoleClient();

  // Try to find by email + store
  const { data: existing } = await supabase
    .from("customers")
    .select("*")
    .eq("store_id", params.storeId)
    .eq("email", params.email)
    .single();

  if (existing) {
    // Link user_id if not set and now authenticated
    if (!existing.user_id && params.userId) {
      await supabase
        .from("customers")
        .update({ user_id: params.userId })
        .eq("id", existing.id);
    }
    return existing;
  }

  // Create new customer
  const newCustomer: TablesInsert<"customers"> = {
    store_id: params.storeId,
    name: params.name,
    email: params.email,
    phone: params.phone ?? null,
    cpf: params.cpf ?? null,
    user_id: params.userId ?? null,
    preferences: {},
  };

  const { data, error } = await supabase
    .from("customers")
    .insert(newCustomer)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create customer: ${error.message}`);
  }

  return data;
}

/**
 * Get customer by auth user_id.
 */
export async function getCustomerByUserId(
  userId: string,
  storeId: string
): Promise<CustomerRow | null> {
  const supabase = createServiceRoleClient();

  const { data } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", userId)
    .eq("store_id", storeId)
    .single();

  return data ?? null;
}
