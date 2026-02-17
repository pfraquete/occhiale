"use client";

import { Button } from "@/shared/ui/components/button";
import { AgentStateBadge } from "./agent-state-badge";
import { SentimentIndicator } from "./sentiment-indicator";
import { Bot, UserRound } from "lucide-react";
import type { AgentState } from "@/shared/types/domain";

interface ChatHeaderProps {
  phone: string;
  customerName?: string | null;
  agentState: AgentState;
  sentiment?: string | null;
  isAiActive: boolean;
  onToggleAi: () => void;
  isToggling: boolean;
}

export function ChatHeader({
  phone,
  customerName,
  agentState,
  sentiment,
  isAiActive,
  onToggleAi,
  isToggling,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-medium">
          {(customerName ?? phone).charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            {customerName ?? phone}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-text-tertiary">{phone}</span>
            <AgentStateBadge state={agentState} />
            <SentimentIndicator sentiment={sentiment} />
          </div>
        </div>
      </div>

      {/* Toggle AI button */}
      <Button
        variant={isAiActive ? "secondary" : "primary"}
        size="sm"
        onClick={onToggleAi}
        disabled={isToggling}
      >
        {isAiActive ? (
          <>
            <UserRound className="mr-1.5 h-4 w-4" />
            Assumir
          </>
        ) : (
          <>
            <Bot className="mr-1.5 h-4 w-4" />
            Devolver à IA
          </>
        )}
      </Button>
    </div>
  );
}
