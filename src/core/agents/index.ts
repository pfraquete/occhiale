// ============================================================================
// Core Agents - AI & Automation Agent Infrastructure
// ============================================================================
//
// This module provides the base infrastructure for plugging in:
// - AI agents (Claude, GPT, etc.)
// - Webhook processors
// - Cron jobs
// - Internal automation agents
//
// Agents are registered and executed through a unified interface.
// ============================================================================

export interface AgentContext {
  organizationId: string;
  userId?: string;
  storeId?: string;
  metadata?: Record<string, unknown>;
}

export interface AgentResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export type AgentHandler = (
  context: AgentContext,
  input: unknown
) => Promise<AgentResult>;

/**
 * Agent registry - central place to register and dispatch agents.
 */
class AgentRegistry {
  private agents = new Map<string, AgentHandler>();

  register(name: string, handler: AgentHandler): void {
    this.agents.set(name, handler);
  }

  async execute(
    name: string,
    context: AgentContext,
    input: unknown
  ): Promise<AgentResult> {
    const handler = this.agents.get(name);
    if (!handler) {
      return { success: false, error: `Agent "${name}" not registered` };
    }

    try {
      return await handler(context, input);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown agent error";
      console.error(`[Agent:${name}] Execution failed:`, message);
      return { success: false, error: message };
    }
  }

  list(): string[] {
    return Array.from(this.agents.keys());
  }

  has(name: string): boolean {
    return this.agents.has(name);
  }
}

export const agentRegistry = new AgentRegistry();
