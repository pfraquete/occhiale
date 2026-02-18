// ============================================================================
// RBAC - System Role & Permission Constants
// ============================================================================

import type { ResourceType, ActionType } from "../types";

/**
 * System role names. These are the default roles created in every organization.
 */
export const SYSTEM_ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  MANAGER: "manager",
  MEMBER: "member",
  VIEWER: "viewer",
} as const;

export type SystemRoleName = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];

/**
 * All available resources in the system.
 */
export const RESOURCES: ResourceType[] = [
  "organization",
  "members",
  "billing",
  "products",
  "orders",
  "customers",
  "analytics",
  "settings",
  "whatsapp",
  "pos",
  "inventory",
  "crm",
  "fiscal",
  "audit",
  "feature_flags",
];

/**
 * All available actions.
 */
export const ACTIONS: ActionType[] = [
  "create",
  "read",
  "update",
  "delete",
  "manage",
  "export",
  "use",
];

/**
 * Permission string format helper.
 * Produces strings like "products:create", "orders:read".
 */
export function permissionKey(
  resource: ResourceType,
  action: ActionType
): string {
  return `${resource}:${action}`;
}
