// ============================================================================
// Core Platform Types - SaaS Infrastructure
// ============================================================================

// === ORGANIZATION (Multi-Tenant) ===

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  ownerId: string;
  settings: OrganizationSettings;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationSettings {
  timezone?: string;
  locale?: string;
  currency?: string;
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
  };
}

export interface Membership {
  id: string;
  organizationId: string;
  userId: string;
  roleId: string | null;
  isActive: boolean;
  invitedBy: string | null;
  invitedAt: string | null;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// === RBAC ===

export interface Role {
  id: string;
  organizationId: string | null;
  name: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ResourceType =
  | "organization"
  | "members"
  | "billing"
  | "products"
  | "orders"
  | "customers"
  | "analytics"
  | "settings"
  | "whatsapp"
  | "pos"
  | "inventory"
  | "crm"
  | "fiscal"
  | "audit"
  | "feature_flags";

export type ActionType =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "manage"
  | "export"
  | "use";

export interface Permission {
  id: string;
  resource: ResourceType;
  action: ActionType;
  description: string | null;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
}

// === BILLING ===

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  isActive: boolean;
  sortOrder: number;
  features?: PlanFeature[];
}

export interface PlanFeature {
  id: string;
  planId: string;
  featureKey: FeatureKey;
  featureValue: string;
}

export type FeatureKey =
  | "max_products"
  | "max_stores"
  | "max_members"
  | "whatsapp_integration"
  | "ai_chat"
  | "advanced_reports"
  | "pos"
  | "crm_automations"
  | "fiscal_integration"
  | "custom_domain";

export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "cancelled"
  | "trialing"
  | "paused";

export interface TenantSubscription {
  id: string;
  organizationId: string;
  planId: string;
  status: SubscriptionStatus;
  billingCycle: "monthly" | "yearly";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEnd: string | null;
  cancelAt: string | null;
  cancelledAt: string | null;
  paymentProvider: "stripe" | "pagarme" | "manual" | null;
  paymentProviderId: string | null;
  plan?: SubscriptionPlan;
}

export interface UsageRecord {
  id: string;
  organizationId: string;
  metricKey: string;
  metricValue: number;
  periodStart: string;
  periodEnd: string;
}

// === AUDIT ===

export interface AuditLog {
  id: string;
  organizationId: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

// === FEATURE FLAGS ===

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  isEnabled: boolean;
  rolloutPercentage: number;
  allowedOrganizations: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Experiment {
  id: string;
  key: string;
  name: string;
  description: string | null;
  variants: ExperimentVariant[];
  isActive: boolean;
  startedAt: string | null;
  endedAt: string | null;
}

export interface ExperimentVariant {
  key: string;
  name: string;
  weight: number;
}

// === AUTOMATION ===

export type WorkflowStatus = "draft" | "active" | "paused" | "archived";
export type TriggerType =
  | "event"
  | "schedule"
  | "webhook"
  | "manual"
  | "condition";

export interface Workflow {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  triggerType: TriggerType;
  triggerConfig: Record<string, unknown>;
  steps: WorkflowStep[];
  status: WorkflowStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  id: string;
  type: "action" | "condition" | "delay" | "loop";
  config: Record<string, unknown>;
  nextStepId: string | null;
  failureStepId: string | null;
}

export interface TriggerEvent {
  id: string;
  organizationId: string;
  eventType: string;
  payload: Record<string, unknown>;
  processedAt: string | null;
  createdAt: string;
}
