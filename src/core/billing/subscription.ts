// ============================================================================
// Billing Engine - Subscription Management
// ============================================================================

import { createClient } from "@/shared/lib/supabase/server";
import type {
  TenantSubscription,
  SubscriptionPlan,
  PlanFeature,
  FeatureKey,
} from "../types";

/**
 * Get the active subscription for an organization.
 * Returns null if no active subscription exists (free tier).
 */
export async function getSubscription(
  organizationId: string
): Promise<TenantSubscription | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("tenant_subscriptions")
    .select(
      `
      *,
      plan:subscription_plans(*)
    `
    )
    .eq("organization_id", organizationId)
    .in("status", ["active", "trialing"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!data) return null;

  return {
    id: data.id,
    organizationId: data.organization_id,
    planId: data.plan_id,
    status: data.status,
    billingCycle: data.billing_cycle,
    currentPeriodStart: data.current_period_start,
    currentPeriodEnd: data.current_period_end,
    trialEnd: data.trial_end,
    cancelAt: data.cancel_at,
    cancelledAt: data.cancelled_at,
    paymentProvider: data.payment_provider,
    paymentProviderId: data.payment_provider_id,
    plan: data.plan as unknown as SubscriptionPlan,
  };
}

/**
 * Get all features for a subscription plan.
 */
export async function getPlanFeatures(
  planId: string
): Promise<PlanFeature[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("plan_features")
    .select("*")
    .eq("plan_id", planId);

  if (!data) return [];

  return data.map((f) => ({
    id: f.id,
    planId: f.plan_id,
    featureKey: f.feature_key as FeatureKey,
    featureValue: f.feature_value as unknown as string,
  }));
}

/**
 * Check if the organization has reached a numeric usage limit.
 * Returns { allowed: true, current, limit } or { allowed: false, ... }.
 */
export async function checkUsageLimit(
  organizationId: string,
  featureKey: FeatureKey,
  currentCount?: number
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const supabase = await createClient();

  // Get the active subscription's plan
  const subscription = await getSubscription(organizationId);

  if (!subscription) {
    // No subscription = free plan limits
    const { data: freePlan } = await supabase
      .from("subscription_plans")
      .select("id")
      .eq("slug", "free")
      .single();

    if (!freePlan) {
      return { allowed: false, current: 0, limit: 0 };
    }

    const { data: feature } = await supabase
      .from("plan_features")
      .select("feature_value")
      .eq("plan_id", freePlan.id)
      .eq("feature_key", featureKey)
      .single();

    const limit = feature
      ? parseInt(feature.feature_value as unknown as string, 10)
      : 0;
    const current = currentCount ?? 0;

    if (limit === -1) return { allowed: true, current, limit };
    return { allowed: current < limit, current, limit };
  }

  // Get the feature limit from the plan
  const { data: feature } = await supabase
    .from("plan_features")
    .select("feature_value")
    .eq("plan_id", subscription.planId)
    .eq("feature_key", featureKey)
    .single();

  const limit = feature
    ? parseInt(feature.feature_value as unknown as string, 10)
    : 0;
  const current = currentCount ?? 0;

  // -1 means unlimited
  if (limit === -1) return { allowed: true, current, limit };

  return { allowed: current < limit, current, limit };
}

/**
 * Get all available subscription plans with their features.
 */
export async function getAvailablePlans(): Promise<SubscriptionPlan[]> {
  const supabase = await createClient();

  const { data: plans } = await supabase
    .from("subscription_plans")
    .select(
      `
      *,
      features:plan_features(*)
    `
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (!plans) return [];

  return plans.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    priceMonthly: p.price_monthly,
    priceYearly: p.price_yearly,
    isActive: p.is_active,
    sortOrder: p.sort_order,
    features: (p.features as unknown as PlanFeature[]) ?? [],
  }));
}

/**
 * Track usage increment for a metric.
 */
export async function trackUsage(
  organizationId: string,
  metricKey: string,
  increment: number = 1
): Promise<void> {
  const supabase = await createClient();

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const { data: existing } = await supabase
    .from("usage_tracking")
    .select("id, metric_value")
    .eq("organization_id", organizationId)
    .eq("metric_key", metricKey)
    .eq("period_start", periodStart.toISOString())
    .single();

  if (existing) {
    await supabase
      .from("usage_tracking")
      .update({ metric_value: existing.metric_value + increment })
      .eq("id", existing.id);
  } else {
    await supabase.from("usage_tracking").insert({
      organization_id: organizationId,
      metric_key: metricKey,
      metric_value: increment,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
    });
  }
}
