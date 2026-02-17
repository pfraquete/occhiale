"use client";

import { cn } from "@/shared/lib/utils/cn";
import { AgentStateBadge } from "./agent-state-badge";
import { SentimentIndicator } from "./sentiment-indicator";
import type { AgentState } from "@/shared/types/domain";

interface ConversationItemProps {
  id: string;
  phone: string;
  customerName?: string | null;
  lastMessage?: string | null;
  lastMessageAt: string | null;
  agentState: AgentState;
  sentiment?: string | null;
  isAiActive: boolean;
  isSelected: boolean;
  onClick: () => void;
}

export function ConversationItem({
  phone,
  customerName,
  lastMessage,
  lastMessageAt,
  agentState,
  sentiment,
  isAiActive,
  isSelected,
  onClick,
}: ConversationItemProps) {
  const displayName = customerName || formatPhone(phone);
  const timeAgo = getTimeAgo(lastMessageAt);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors",
        isSelected
          ? "bg-brand-50 border border-brand-200"
          : "hover:bg-bg-secondary"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium",
          isAiActive
            ? "bg-brand-100 text-brand-700"
            : "bg-orange-100 text-orange-700"
        )}
      >
        {displayName.charAt(0).toUpperCase()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium text-text-primary">
            {displayName}
          </span>
          <span className="shrink-0 text-xs text-text-tertiary">{timeAgo}</span>
        </div>

        {lastMessage && (
          <p className="mt-0.5 truncate text-xs text-text-secondary">
            {lastMessage}
          </p>
        )}

        <div className="mt-1 flex items-center gap-2">
          <AgentStateBadge state={agentState} />
          <SentimentIndicator sentiment={sentiment} />
          {!isAiActive && (
            <span className="text-xs text-orange-600 font-medium">Humano</span>
          )}
        </div>
      </div>
    </button>
  );
}

// ------------------------------------------
// Helpers
// ------------------------------------------

function formatPhone(phone: string): string {
  // Format: 5511999999999 → (11) 99999-9999
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 13) {
    return `(${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
  }
  if (cleaned.length === 12) {
    return `(${cleaned.slice(2, 4)}) ${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
  }
  return phone;
}

function getTimeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin}min`;
  if (diffHr < 24) return `${diffHr}h`;
  if (diffDay < 7) return `${diffDay}d`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}
