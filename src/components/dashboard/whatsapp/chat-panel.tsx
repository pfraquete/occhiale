"use client";

import { useState, useEffect, useCallback } from "react";
import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { useRealtimeMessages } from "@/hooks/use-realtime-messages";
import { MessageSquare } from "lucide-react";
import type { AgentState } from "@/lib/types/domain";

interface Conversation {
  id: string;
  phone: string;
  agent_state: string;
  sentiment: string | null;
  is_ai_active: boolean;
  customers: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
}

interface Message {
  id: string;
  role: string;
  content: string;
  media_url: string | null;
  media_type: string | null;
  tool_calls: unknown;
  created_at: string;
}

interface ChatPanelProps {
  conversation: Conversation | null;
  storeId: string;
  onConversationUpdate?: (id: string, updates: Partial<Conversation>) => void;
}

export function ChatPanel({
  conversation,
  storeId,
  onConversationUpdate,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isAiActive, setIsAiActive] = useState(
    conversation?.is_ai_active ?? true
  );

  // Load messages when conversation changes
  // FIX: Use API route instead of directly importing server-only module
  // The previous code imported getMessagesForConversation which uses
  // createServiceRoleClient() — not available in the browser.
  useEffect(() => {
    if (!conversation) {
      setMessages([]);
      return;
    }

    setIsAiActive(conversation.is_ai_active);

    async function loadMessages() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/whatsapp/messages?conversationId=${conversation!.id}&limit=50`
        );
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages ?? []);
        } else {
          console.error("Failed to load messages:", res.statusText);
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setLoading(false);
      }
    }

    loadMessages();
  }, [conversation]);

  // Realtime new messages
  const handleNewMessage = useCallback((newMsg: Message) => {
    setMessages((prev) => {
      // Prevent duplicates
      if (prev.some((m) => m.id === newMsg.id)) return prev;
      return [...prev, newMsg];
    });
  }, []);

  useRealtimeMessages(conversation?.id ?? null, handleNewMessage);

  // Toggle AI active
  async function handleToggleAi() {
    if (!conversation) return;
    setIsToggling(true);

    try {
      const { toggleAiActiveAction } = await import("@/lib/actions/whatsapp");
      await toggleAiActiveAction(conversation.id, !isAiActive);
      setIsAiActive(!isAiActive);
      onConversationUpdate?.(conversation.id, {
        is_ai_active: !isAiActive,
      });
    } catch (error) {
      console.error("Failed to toggle AI:", error);
    } finally {
      setIsToggling(false);
    }
  }

  // Send manual message
  async function handleSendMessage(text: string) {
    if (!conversation) return;

    try {
      const { sendManualMessageAction } =
        await import("@/lib/actions/whatsapp");
      await sendManualMessageAction(conversation.id, text);
      // Message will appear via Realtime subscription
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }

  // No conversation selected
  if (!conversation) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-text-tertiary" />
          <p className="mt-2 text-sm text-text-tertiary">
            Selecione uma conversa para visualizar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <ChatHeader
        phone={conversation.phone}
        customerName={conversation.customers?.name}
        agentState={conversation.agent_state as AgentState}
        sentiment={conversation.sentiment}
        isAiActive={isAiActive}
        onToggleAi={handleToggleAi}
        isToggling={isToggling}
      />

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-text-tertiary">Carregando mensagens...</p>
        </div>
      ) : (
        <ChatMessages messages={messages} />
      )}

      <ChatInput isAiActive={isAiActive} onSend={handleSendMessage} />
    </div>
  );
}
