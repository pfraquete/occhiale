// ============================================
// OCCHIALE - AI Tool: Escalate to Human
// Transfers conversation to human agent
// ============================================

import { updateConversationState } from "@/lib/supabase/queries/whatsapp";
import type { ToolContext } from "./index";

export async function executeEscalateToHuman(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  const reason =
    (input.reason as string) ?? "Cliente solicitou atendimento humano";

  // Update conversation: disable AI, set state to human_takeover
  await updateConversationState(context.conversationId, {
    isAiActive: false,
    agentState: "human_takeover",
  });

  return JSON.stringify({
    success: true,
    message: `Conversa transferida para atendimento humano. Motivo: ${reason}`,
    action: "A equipe da loja receberá uma notificação no painel.",
  });
}
