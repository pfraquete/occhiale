"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export interface ActionResult {
  success: boolean;
  error?: string;
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
    const supabase = createServiceRoleClient();

    const { error } = await supabase
      .from("whatsapp_conversations")
      .update({
        is_ai_active: isAiActive,
        agent_state: isAiActive ? "greeting" : "human_takeover",
      })
      .eq("id", conversationId);

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
    const supabase = createServiceRoleClient();

    // Get conversation details (phone + store for Evolution instance)
    const { data: conversation, error: convError } = await supabase
      .from("whatsapp_conversations")
      .select("phone, store_id, stores(slug)")
      .eq("id", conversationId)
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
      const { getEvolutionClient } = await import("@/lib/evolution/client");

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
