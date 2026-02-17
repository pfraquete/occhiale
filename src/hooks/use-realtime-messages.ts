"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/shared/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface RealtimeMessage {
  id: string;
  role: string;
  content: string;
  media_url: string | null;
  media_type: string | null;
  tool_calls: Record<string, unknown>[] | null;
  created_at: string;
}

/**
 * Subscribe to new WhatsApp messages via Supabase Realtime.
 * Calls onNewMessage when a new message is inserted for the given conversation.
 *
 * Requires whatsapp_messages table to be added to the Realtime publication:
 * ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_messages;
 */
export function useRealtimeMessages(
  conversationId: string | null,
  onNewMessage: (message: RealtimeMessage) => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const callbackRef = useRef(onNewMessage);

  // Keep callback ref updated without causing re-subscription
  useEffect(() => {
    callbackRef.current = onNewMessage;
  }, [onNewMessage]);

  useEffect(() => {
    if (!conversationId) {
      // Cleanup existing channel if conversation is deselected
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      return;
    }

    const supabase = createClient();

    const channel = supabase
      .channel(`whatsapp-messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "whatsapp_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as RealtimeMessage;
          callbackRef.current(newMsg);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [conversationId]);
}

/**
 * Subscribe to conversation updates (agent_state, sentiment, is_ai_active).
 * Useful for updating the conversations list in real-time.
 */
export function useRealtimeConversations(
  storeId: string | null,
  onUpdate: (conversation: Record<string, unknown>) => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const callbackRef = useRef(onUpdate);

  useEffect(() => {
    callbackRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!storeId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`whatsapp-conversations-${storeId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT + UPDATE
          schema: "public",
          table: "whatsapp_conversations",
          filter: `store_id=eq.${storeId}`,
        },
        (payload) => {
          callbackRef.current(payload.new as Record<string, unknown>);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [storeId]);
}
