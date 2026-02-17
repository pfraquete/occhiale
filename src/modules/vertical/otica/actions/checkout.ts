"use server";

import { createClient } from "@/shared/lib/supabase/server";
import type { CustomerRow } from "@/shared/lib/supabase/queries/customers";

/**
 * Get customer data for pre-filling checkout if authenticated.
 */
export async function getCheckoutCustomerData(
  storeId: string
): Promise<CustomerRow | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("customers")
    .select("*")
    .eq("store_id", storeId)
    .eq("user_id", user.id)
    .single();

  return data ?? null;
}

/**
 * Fetch address from ViaCEP API.
 */
export async function fetchAddressByCep(cep: string) {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    const data = await response.json();

    if (data.erro) return null;

    return {
      street: data.logradouro || "",
      neighborhood: data.bairro || "",
      city: data.localidade || "",
      state: data.uf || "",
    };
  } catch {
    return null;
  }
}
