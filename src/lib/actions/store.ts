"use server";

import { createClient } from "@/lib/supabase/server";
import { createStoreSchema } from "@/lib/validations/store";

export interface ActionResult {
  success: boolean;
  error?: string;
  storeId?: string;
}

/**
 * Create a new store for the authenticated user.
 * The DB trigger `create_owner_membership_trigger` automatically creates
 * the store_member record with role='owner'.
 */
export async function createStoreAction(
  formData: Record<string, unknown>
): Promise<ActionResult> {
  const parsed = createStoreSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const supabase = await createClient();

  // 1. Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuário não autenticado" };
  }

  // 2. Check if user already has a store
  const { data: existingMembership } = await supabase
    .from("store_members")
    .select("store_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (existingMembership) {
    return { success: false, error: "Você já possui uma loja cadastrada" };
  }

  // 3. Check if slug is available
  const { data: existingStore } = await supabase
    .from("stores")
    .select("id")
    .eq("slug", parsed.data.slug)
    .maybeSingle();

  if (existingStore) {
    return {
      success: false,
      error: "Este slug já está em uso. Escolha outro.",
    };
  }

  // 4. Create the store
  const { data: store, error: storeError } = await supabase
    .from("stores")
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      owner_id: user.id,
      whatsapp_number: parsed.data.whatsappNumber ?? null,
      plan: parsed.data.plan ?? "starter",
    })
    .select("id")
    .single();

  if (storeError) {
    console.error("Failed to create store:", storeError);

    if (storeError.code === "23505") {
      return {
        success: false,
        error: "Este slug já está em uso. Escolha outro.",
      };
    }

    return {
      success: false,
      error: "Erro ao criar loja. Tente novamente.",
    };
  }

  return { success: true, storeId: store.id };
}

/**
 * Check if the current user already has a store.
 */
export async function checkUserHasStore(): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from("store_members")
    .select("store_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  return !!data;
}

/**
 * Check if a slug is available.
 */
export async function checkSlugAvailability(
  slug: string
): Promise<{ available: boolean }> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("stores")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  return { available: !data };
}
