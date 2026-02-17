"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";
import { createServiceRoleClient } from "@/shared/lib/supabase/admin";

export interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Verify that the current user is authenticated and has access
 * to the conversation's store via store_members.
 * Returns the storeId if authorized, or null if not.
 */
async function authorizeConversationAccess(
  conversationId: string
): Promise<string | null> {
  // 1. Get authenticated user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 2. Get conversation's store_id using service role (bypasses RLS)
  const adminClient = createServiceRoleClient();
  const { data: conversation } = await adminClient
    .from("whatsapp_conversations")
    .select("store_id")
    .eq("id", conversationId)
    .single();

  if (!conversation) return null;

  // 3. Verify user is a member of this store
  const { data: membership } = await supabase
    .from("store_members")
    .select("store_id")
    .eq("user_id", user.id)
    .eq("store_id", conversation.store_id)
    .limit(1)
    .maybeSingle();

  if (!membership) return null;

  return conversation.store_id;
}

/**
 * Toggle AI active state for a conversation.
 * When disabled, human takes over. When enabled, AI resumes.
 */
export async function toggleAiActiveAction(
  conversationId: string,
  isAiActive: boolean
): Promise<ActionResult> {
  if (!conversationId) {
    return { success: false, error: "ID da conversa é obrigatório" };
  }

  try {
    // FIX: Verify user is authenticated and authorized for this conversation
    const storeId = await authorizeConversationAccess(conversationId);
    if (!storeId) {
      return { success: false, error: "Não autorizado" };
    }

    const supabase = createServiceRoleClient();

    const { error } = await supabase
      .from("whatsapp_conversations")
      .update({
        is_ai_active: isAiActive,
        agent_state: isAiActive ? "greeting" : "human_takeover",
      })
      .eq("id", conversationId)
      .eq("store_id", storeId); // Extra safety: scope to authorized store

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/dashboard/whatsapp");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Erro ao alternar estado da IA",
    };
  }
}

/**
 * Send a manual message from the dashboard (human takeover mode).
 * Saves to DB and sends via Evolution API.
 */
export async function sendManualMessageAction(
  conversationId: string,
  text: string
): Promise<ActionResult> {
  if (!conversationId || !text.trim()) {
    return { success: false, error: "Conversa e texto são obrigatórios" };
  }

  try {
    // FIX: Verify user is authenticated and authorized for this conversation
    const storeId = await authorizeConversationAccess(conversationId);
    if (!storeId) {
      return { success: false, error: "Não autorizado" };
    }

    const supabase = createServiceRoleClient();

    // Get conversation details (phone + store for Evolution instance)
    const { data: conversation, error: convError } = await supabase
      .from("whatsapp_conversations")
      .select("phone, store_id, stores(slug)")
      .eq("id", conversationId)
      .eq("store_id", storeId) // Extra safety: scope to authorized store
      .single();

    if (convError || !conversation) {
      return { success: false, error: "Conversa não encontrada" };
    }

    // Save outbound message to DB
    const { error: msgError } = await supabase
      .from("whatsapp_messages")
      .insert({
        conversation_id: conversationId,
        role: "assistant",
        content: text.trim(),
      });

    if (msgError) {
      throw new Error(msgError.message);
    }

    // Update last_message_at
    await supabase
      .from("whatsapp_conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId);

    // Send via Evolution API (fire and forget — don't fail if Evolution is down)
    try {
      const { getEvolutionClient } = await import("@/modules/core/whatsapp/lib/evolution/client");

      const evolution = getEvolutionClient();

      // Instance name is the store slug
      const storeData = conversation.stores as unknown as {
        slug: string;
      } | null;
      const instanceName = storeData?.slug ?? "default";

      await evolution.sendText(instanceName, conversation.phone, text.trim());
    } catch (evolutionError) {
      console.error("Failed to send via Evolution API:", evolutionError);
      // Message is saved in DB — dashboard will show it
      // Evolution send failure is non-blocking
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro ao enviar mensagem",
    };
  }
}
