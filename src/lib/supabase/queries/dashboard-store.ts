import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/types/database";

/**
 * Get store settings for dashboard config page.
 */
export async function getStoreSettings(storeId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stores")
    .select(
      "id, name, slug, logo_url, whatsapp_number, plan, settings, description, is_active"
    )
    .eq("id", storeId)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Update store settings.
 */
export async function updateStoreSettings(
  storeId: string,
  input: Partial<{
    name: string;
    logo_url: string | null;
    whatsapp_number: string | null;
    description: string | null;
    settings: Json;
  }>
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("stores")
    .update(input)
    .eq("id", storeId);

  if (error) {
    throw new Error(`Failed to update store settings: ${error.message}`);
  }
}

/**
 * Get store members with their user info.
 * Note: We select from store_members and join auth info via user metadata.
 */
export async function getStoreMembers(storeId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("store_members")
    .select("id, user_id, role, created_at")
    .eq("store_id", storeId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch store members:", error.message);
    return [];
  }

  return data ?? [];
}

/**
 * Remove a store member.
 */
export async function removeStoreMember(memberId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("store_members")
    .delete()
    .eq("id", memberId);

  if (error) {
    throw new Error(`Failed to remove member: ${error.message}`);
  }
}
