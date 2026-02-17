import { Badge } from "@/shared/ui/components/badge";
import type { AgentState } from "@/shared/types/domain";

const STATE_CONFIG: Record<
  AgentState,
  {
    label: string;
    variant: "default" | "success" | "cta" | "danger" | "warning" | "outline";
  }
> = {
  idle: { label: "Inativo", variant: "outline" },
  greeting: { label: "Saudação", variant: "default" },
  browsing: { label: "Navegando", variant: "default" },
  recommending: { label: "Recomendando", variant: "cta" },
  prescription: { label: "Receita", variant: "warning" },
  checkout: { label: "Checkout", variant: "success" },
  support: { label: "Suporte", variant: "outline" },
  human_takeover: { label: "Humano", variant: "danger" },
};

interface AgentStateBadgeProps {
  state: AgentState;
}

export function AgentStateBadge({ state }: AgentStateBadgeProps) {
  const config = STATE_CONFIG[state] ?? STATE_CONFIG.idle;

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
