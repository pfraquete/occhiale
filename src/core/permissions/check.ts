// ============================================================================
// RBAC - Permission Checking
// ============================================================================

import { createClient } from "@/shared/lib/supabase/server";
import type { ResourceType, ActionType, FeatureKey } from "../types";
import { permissionKey } from "./constants";

interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Check if a user has a specific permission within their organization.
 * Uses the role_permissions table via the user's membership role.
 */
export async function checkPermission(
  userId: string,
  organizationId: string,
  resource: ResourceType,
  action: ActionType
): Promise<PermissionCheckResult> {
  const supabase = await createClient();

  // Get user's membership and role
  const { data: membership } = await supabase
    .from("memberships")
    .select("role_id")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .eq("is_active", true)
    .single();

  if (!membership?.role_id) {
    return { allowed: false, reason: "No active membership found" };
  }

  // Check if the role has the required permission
  const { data: rolePermission } = await supabase
    .from("role_permissions")
    .select(
      `
      id,
      permission:permissions!inner(resource, action)
    `
    )
    .eq("role_id", membership.role_id)
    .single();

  // Get all permissions for this role
  const { data: permissions } = await supabase
    .from("role_permissions")
    .select(
      `
      permissions(resource, action)
    `
    )
    .eq("role_id", membership.role_id);

  if (!permissions) {
    return { allowed: false, reason: "No permissions found for role" };
  }

  const hasPermission = permissions.some((rp) => {
    const perm = rp.permissions as unknown as {
      resource: string;
      action: string;
    };
    return perm?.resource === resource && perm?.action === action;
  });

  // Also check for 'manage' permission (manage implies all actions on a resource)
  const hasManagePermission = permissions.some((rp) => {
    const perm = rp.permissions as unknown as {
      resource: string;
      action: string;
    };
    return perm?.resource === resource && perm?.action === "manage";
  });

  if (hasPermission || hasManagePermission) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Missing permission: ${permissionKey(resource, action)}`,
  };
}

/**
 * Require a permission. Throws if not allowed.
 * Use in server actions and API routes.
 */
export async function requirePermission(
  userId: string,
  organizationId: string,
  resource: ResourceType,
  action: ActionType
): Promise<void> {
  const result = await checkPermission(
    userId,
    organizationId,
    resource,
    action
  );
  if (!result.allowed) {
    throw new Error(result.reason ?? "Permission denied");
  }
}

/**
 * Check if an organization has access to a feature based on their subscription plan.
 * Returns false if the feature is not available or the limit has been reached.
 */
export async function hasFeature(
  organizationId: string,
  featureKey: FeatureKey
): Promise<boolean> {
  const supabase = await createClient();

  // Get the organization's active subscription
  const { data: subscription } = await supabase
    .from("tenant_subscriptions")
    .select(
      `
      plan_id,
      status
    `
    )
    .eq("organization_id", organizationId)
    .in("status", ["active", "trialing"])
    .single();

  if (!subscription) {
    return false;
  }

  // Get the feature value for this plan
  const { data: feature } = await supabase
    .from("plan_features")
    .select("feature_value")
    .eq("plan_id", subscription.plan_id)
    .eq("feature_key", featureKey)
    .single();

  if (!feature) {
    return false;
  }

  const value = feature.feature_value as unknown as string;

  // Boolean features
  if (value === "true") return true;
  if (value === "false") return false;

  // Numeric features (-1 means unlimited)
  const numericValue = parseInt(value, 10);
  if (!isNaN(numericValue)) {
    return numericValue === -1 || numericValue > 0;
  }

  return false;
}
