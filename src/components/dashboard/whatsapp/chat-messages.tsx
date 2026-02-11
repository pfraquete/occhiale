"use client";

import { useEffect, useRef } from "react";
import { ChatMessageBubble } from "./chat-message-bubble";

interface Message {
  id: string;
  role: string;
  content: string;
  media_url: string | null;
  media_type: string | null;
  tool_calls: unknown;
  created_at: string;
}

interface ChatMessagesProps {
  messages: Message[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-text-tertiary">
          Nenhuma mensagem nesta conversa
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg) => (
        <ChatMessageBubble
          key={msg.id}
          role={msg.role as "customer" | "assistant" | "system"}
          content={msg.content}
          mediaUrl={msg.media_url}
          mediaType={msg.media_type}
          toolCalls={msg.tool_calls as Record<string, unknown>[] | null}
          createdAt={msg.created_at}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
