"use client";

import { useState, useCallback } from "react";
import { ConversationsList } from "./conversations-list";
import { ChatPanel } from "./chat-panel";
import { useRealtimeConversations } from "@/hooks/use-realtime-messages";

interface Conversation {
  id: string;
  phone: string;
  agent_state: string;
  sentiment: string | null;
  is_ai_active: boolean;
  last_message_at: string | null;
  customers: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
}

interface WhatsAppMonitorProps {
  storeId: string;
  initialConversations: Conversation[];
  totalConversations: number;
}

export function WhatsAppMonitor({
  storeId,
  initialConversations,
  totalConversations,
}: WhatsAppMonitorProps) {
  const [conversations, setConversations] =
    useState<Conversation[]>(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedConversation =
    conversations.find((c) => c.id === selectedId) ?? null;

  // Handle real-time conversation updates (new conversations, state changes)
  const handleConversationUpdate = useCallback(
    (updated: Record<string, unknown>) => {
      setConversations((prev) => {
        const id = updated.id as string;
        const existingIdx = prev.findIndex((c) => c.id === id);

        if (existingIdx >= 0) {
          // Update existing conversation
          const existing = prev[existingIdx]!;
          const updated_: Conversation = {
            ...existing,
            ...(updated.agent_state !== undefined && {
              agent_state: updated.agent_state as string,
            }),
            ...(updated.sentiment !== undefined && {
              sentiment: updated.sentiment as string | null,
            }),
            ...(updated.is_ai_active !== undefined && {
              is_ai_active: updated.is_ai_active as boolean,
            }),
            ...(updated.last_message_at !== undefined && {
              last_message_at: updated.last_message_at as string,
            }),
          };

          const next = [...prev];
          next[existingIdx] = updated_;

          // Re-sort by last_message_at (newest first)
          next.sort(
            (a, b) =>
              new Date(b.last_message_at ?? 0).getTime() -
              new Date(a.last_message_at ?? 0).getTime()
          );

          return next;
        }

        // New conversation — add to the top
        // It won't have customers data from Realtime, so it shows phone only
        const newConv: Conversation = {
          id,
          phone: (updated.phone as string) ?? "",
          agent_state: (updated.agent_state as string) ?? "greeting",
          sentiment: (updated.sentiment as string | null) ?? null,
          is_ai_active: (updated.is_ai_active as boolean) ?? true,
          last_message_at:
            (updated.last_message_at as string) ?? new Date().toISOString(),
          customers: null,
        };

        return [newConv, ...prev];
      });
    },
    []
  );

  // Subscribe to conversation changes
  useRealtimeConversations(storeId, handleConversationUpdate);

  // Handle inline updates from ChatPanel (optimistic)
  const handleChatPanelUpdate = useCallback(
    (id: string, updates: Partial<Conversation>) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
    },
    []
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left: Conversations list */}
      <div className="w-80 flex-shrink-0 border-r border-border-primary bg-bg-primary">
        <div className="flex h-14 items-center border-b border-border-primary px-4">
          <h2 className="text-sm font-semibold text-text-primary">Conversas</h2>
          <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
            {conversations.length}
          </span>
        </div>
        <ConversationsList
          conversations={conversations}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      {/* Right: Chat panel */}
      <ChatPanel
        conversation={selectedConversation}
        storeId={storeId}
        onConversationUpdate={handleChatPanelUpdate}
      />
    </div>
  );
}
