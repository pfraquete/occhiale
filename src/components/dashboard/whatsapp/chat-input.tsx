"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
  isAiActive: boolean;
  onSend: (text: string) => Promise<void>;
}

export function ChatInput({ isAiActive, onSend }: ChatInputProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      await onSend(trimmed);
      setText("");
    } finally {
      setSending(false);
    }
  }

  if (isAiActive) {
    return (
      <div className="border-t border-border bg-bg-secondary p-3">
        <p className="text-center text-xs text-text-tertiary">
          🤖 A IA está atendendo esta conversa.{" "}
          <span className="font-medium">
            Clique em &quot;Assumir&quot; para responder manualmente.
          </span>
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 border-t border-border p-3"
    >
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Digite sua mensagem..."
        disabled={sending}
        className="flex-1"
      />
      <Button type="submit" size="sm" disabled={!text.trim() || sending}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
