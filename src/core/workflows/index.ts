// ============================================================================
// Core Workflows - Automation Workflow Engine
// ============================================================================
//
// Workflows define a sequence of steps that execute in response to triggers.
// Each step can be an action, condition, delay, or loop.
//
// Example workflow: "Post-Purchase Follow-up"
//   1. Trigger: order.status = 'delivered'
//   2. Delay: 24 hours
//   3. Action: Send WhatsApp satisfaction survey
//   4. Condition: If NPS < 7
//   5. Action: Alert manager
// ============================================================================

import type { Workflow, WorkflowStep } from "../types";
import { agentRegistry, type AgentContext } from "../agents";

export interface StepExecutor {
  (
    step: WorkflowStep,
    context: WorkflowExecutionContext
  ): Promise<StepResult>;
}

export interface WorkflowExecutionContext extends AgentContext {
  workflowId: string;
  variables: Record<string, unknown>;
}

export interface StepResult {
  success: boolean;
  output?: unknown;
  nextStepId?: string | null;
}

/**
 * Step executor registry.
 */
const stepExecutors = new Map<string, StepExecutor>();

export function registerStepExecutor(
  type: string,
  executor: StepExecutor
): void {
  stepExecutors.set(type, executor);
}

/**
 * Execute a single workflow step.
 */
async function executeStep(
  step: WorkflowStep,
  context: WorkflowExecutionContext
): Promise<StepResult> {
  const executor = stepExecutors.get(step.type);

  if (!executor) {
    return {
      success: false,
      nextStepId: step.failureStepId,
    };
  }

  try {
    return await executor(step, context);
  } catch {
    return {
      success: false,
      nextStepId: step.failureStepId,
    };
  }
}

/**
 * Execute a workflow from a given starting step.
 * Processes steps sequentially following nextStepId links.
 */
export async function executeWorkflow(
  workflow: Workflow,
  context: AgentContext,
  initialVariables?: Record<string, unknown>
): Promise<{
  success: boolean;
  stepsExecuted: number;
  results: StepResult[];
}> {
  if (workflow.status !== "active") {
    return { success: false, stepsExecuted: 0, results: [] };
  }

  const executionContext: WorkflowExecutionContext = {
    ...context,
    workflowId: workflow.id,
    variables: initialVariables ?? {},
  };

  const results: StepResult[] = [];
  const stepsMap = new Map(workflow.steps.map((s) => [s.id, s]));

  let currentStep = workflow.steps[0];
  let maxSteps = 100; // Safety limit

  while (currentStep && maxSteps > 0) {
    const result = await executeStep(currentStep, executionContext);
    results.push(result);
    maxSteps--;

    if (!result.success && currentStep.failureStepId) {
      currentStep = stepsMap.get(currentStep.failureStepId) ?? undefined;
    } else if (result.nextStepId) {
      currentStep = stepsMap.get(result.nextStepId) ?? undefined;
    } else if (currentStep.nextStepId) {
      currentStep = stepsMap.get(currentStep.nextStepId) ?? undefined;
    } else {
      break;
    }
  }

  const allSuccess = results.every((r) => r.success);

  return {
    success: allSuccess,
    stepsExecuted: results.length,
    results,
  };
}

// Register built-in step executors

registerStepExecutor("action", async (step, context) => {
  const agentName = step.config.agent as string;

  if (!agentName || !agentRegistry.has(agentName)) {
    return { success: false };
  }

  const result = await agentRegistry.execute(agentName, context, step.config);
  return {
    success: result.success,
    output: result.data,
    nextStepId: step.nextStepId,
  };
});

registerStepExecutor("condition", async (step, context) => {
  const field = step.config.field as string;
  const operator = step.config.operator as string;
  const value = step.config.value;
  const actual = context.variables[field];

  let conditionMet = false;

  switch (operator) {
    case "eq":
      conditionMet = actual === value;
      break;
    case "neq":
      conditionMet = actual !== value;
      break;
    case "gt":
      conditionMet = (actual as number) > (value as number);
      break;
    case "lt":
      conditionMet = (actual as number) < (value as number);
      break;
    case "contains":
      conditionMet = String(actual).includes(String(value));
      break;
    default:
      conditionMet = false;
  }

  return {
    success: true,
    output: { conditionMet },
    nextStepId: conditionMet ? step.nextStepId : step.failureStepId,
  };
});

registerStepExecutor("delay", async (step) => {
  // In production, delays would be handled by a job queue (e.g., pg_cron, BullMQ).
  // This is a placeholder for the interface.
  const delayMs = (step.config.delayMinutes as number ?? 0) * 60 * 1000;
  void delayMs; // Would be used by job scheduler
  return {
    success: true,
    output: { scheduledDelay: step.config.delayMinutes },
    nextStepId: step.nextStepId,
  };
});
