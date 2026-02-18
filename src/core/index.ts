// ============================================================================
// Core Platform - Barrel Export
// ============================================================================

// Types
export type {
  Organization,
  OrganizationSettings,
  Membership,
  Role,
  ResourceType,
  ActionType,
  Permission,
  RolePermission,
  SubscriptionPlan,
  PlanFeature,
  FeatureKey,
  SubscriptionStatus,
  TenantSubscription,
  UsageRecord,
  AuditLog,
  FeatureFlag,
  Experiment,
  ExperimentVariant,
  Workflow,
  WorkflowStep,
  WorkflowStatus,
  TriggerType,
  TriggerEvent,
} from "./types";

// Auth
export { getCurrentUser, requireAuth, requireOrganization } from "./auth/session";

// Permissions
export { checkPermission, requirePermission, hasFeature } from "./permissions/check";
export { SYSTEM_ROLES } from "./permissions/constants";

// Billing
export { getSubscription, getPlanFeatures, checkUsageLimit } from "./billing/subscription";

// Audit
export { createAuditLog } from "./audit/logger";

// Feature Flags
export { isFeatureEnabled, getExperimentVariant } from "./feature-flags/evaluate";
