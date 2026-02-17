"use client";

import { useState } from "react";
import { Input } from "@/shared/ui/components/input";
import { ConversationItem } from "./conversation-item";
import { Search } from "lucide-react";
import type { AgentState } from "@/shared/types/domain";

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

interface ConversationsListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationsList({
  conversations,
  selectedId,
  onSelect,
}: ConversationsListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "ai" | "human">("all");

  const filtered = conversations.filter((c) => {
    // Search filter
    if (search) {
      const term = search.toLowerCase();
      const name = c.customers?.name?.toLowerCase() ?? "";
      const phone = c.phone.toLowerCase();
      if (!name.includes(term) && !phone.includes(term)) {
        return false;
      }
    }

    // AI/Human filter
    if (filter === "ai" && !c.is_ai_active) return false;
    if (filter === "human" && c.is_ai_active) return false;

    return true;
  });

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="p-3 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <Input
            placeholder="Buscar conversas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1">
          {(
            [
              { key: "all", label: "Todas" },
              { key: "ai", label: "IA" },
              { key: "human", label: "Humano" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                filter === key
                  ? "bg-brand-100 text-brand-700"
                  : "text-text-tertiary hover:bg-bg-secondary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
        {filtered.length === 0 ? (
          <p className="p-4 text-center text-sm text-text-tertiary">
            Nenhuma conversa encontrada
          </p>
        ) : (
          filtered.map((c) => (
            <ConversationItem
              key={c.id}
              id={c.id}
              phone={c.phone}
              customerName={c.customers?.name}
              lastMessage={null}
              lastMessageAt={c.last_message_at}
              agentState={c.agent_state as AgentState}
              sentiment={c.sentiment}
              isAiActive={c.is_ai_active}
              isSelected={selectedId === c.id}
              onClick={() => onSelect(c.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
