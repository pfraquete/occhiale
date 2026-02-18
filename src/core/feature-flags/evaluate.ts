// ============================================================================
// Feature Flags - Evaluation Engine
// ============================================================================

import { createClient } from "@/shared/lib/supabase/server";
import type { FeatureFlag, Experiment, ExperimentVariant } from "../types";

/**
 * Check if a feature flag is enabled for a specific organization.
 *
 * Evaluation order:
 * 1. If the flag is not enabled globally, return false
 * 2. If the organization is in the allowed_organizations list, return true
 * 3. If rollout_percentage > 0, deterministically check based on org ID hash
 * 4. Otherwise, return the global is_enabled state
 *
 * @example
 * if (await isFeatureEnabled('new_dashboard', orgId)) {
 *   // Show new dashboard
 * }
 */
export async function isFeatureEnabled(
  flagKey: string,
  organizationId?: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data: flag } = await supabase
    .from("feature_flags")
    .select("*")
    .eq("key", flagKey)
    .single();

  if (!flag) return false;

  const featureFlag: FeatureFlag = {
    id: flag.id,
    key: flag.key,
    name: flag.name,
    description: flag.description,
    isEnabled: flag.is_enabled,
    rolloutPercentage: flag.rollout_percentage,
    allowedOrganizations: (flag.allowed_organizations as string[]) ?? [],
    metadata: (flag.metadata as Record<string, unknown>) ?? {},
    createdAt: flag.created_at,
    updatedAt: flag.updated_at,
  };

  return evaluateFlag(featureFlag, organizationId);
}

function evaluateFlag(
  flag: FeatureFlag,
  organizationId?: string
): boolean {
  // Global kill switch
  if (!flag.isEnabled) return false;

  // If no org context, just return global state
  if (!organizationId) return flag.isEnabled;

  // Check allow-list
  if (flag.allowedOrganizations.includes(organizationId)) {
    return true;
  }

  // Percentage-based rollout (deterministic hash)
  if (flag.rolloutPercentage > 0 && flag.rolloutPercentage < 100) {
    const hash = deterministicHash(`${flag.key}:${organizationId}`);
    const bucket = hash % 100;
    return bucket < flag.rolloutPercentage;
  }

  // 100% rollout = everyone
  if (flag.rolloutPercentage === 100) return true;

  return false;
}

/**
 * Get the experiment variant assigned to an organization.
 * Uses deterministic hashing so the same org always gets the same variant.
 *
 * @example
 * const variant = await getExperimentVariant('pricing_test', orgId);
 * if (variant?.key === 'variant_b') {
 *   // Show variant B pricing
 * }
 */
export async function getExperimentVariant(
  experimentKey: string,
  organizationId: string
): Promise<ExperimentVariant | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("experiments")
    .select("*")
    .eq("key", experimentKey)
    .eq("is_active", true)
    .single();

  if (!data) return null;

  const experiment: Experiment = {
    id: data.id,
    key: data.key,
    name: data.name,
    description: data.description,
    variants: (data.variants as unknown as ExperimentVariant[]) ?? [],
    isActive: data.is_active,
    startedAt: data.started_at,
    endedAt: data.ended_at,
  };

  return assignVariant(experiment, organizationId);
}

function assignVariant(
  experiment: Experiment,
  organizationId: string
): ExperimentVariant | null {
  if (experiment.variants.length === 0) return null;

  const totalWeight = experiment.variants.reduce(
    (sum, v) => sum + v.weight,
    0
  );
  if (totalWeight === 0) return experiment.variants[0] ?? null;

  const hash = deterministicHash(`${experiment.key}:${organizationId}`);
  const bucket = hash % totalWeight;

  let accumulated = 0;
  for (const variant of experiment.variants) {
    accumulated += variant.weight;
    if (bucket < accumulated) return variant;
  }

  return experiment.variants[0] ?? null;
}

/**
 * Simple deterministic hash function.
 * Produces consistent results for the same input.
 */
function deterministicHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Get all feature flags (for admin/settings pages).
 */
export async function getAllFeatureFlags(): Promise<FeatureFlag[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("feature_flags")
    .select("*")
    .order("key", { ascending: true });

  if (!data) return [];

  return data.map((f) => ({
    id: f.id,
    key: f.key,
    name: f.name,
    description: f.description,
    isEnabled: f.is_enabled,
    rolloutPercentage: f.rollout_percentage,
    allowedOrganizations: (f.allowed_organizations as string[]) ?? [],
    metadata: (f.metadata as Record<string, unknown>) ?? {},
    createdAt: f.created_at,
    updatedAt: f.updated_at,
  }));
}
