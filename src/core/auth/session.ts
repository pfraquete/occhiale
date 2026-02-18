// ============================================================================
// Core Auth - Session Management
// ============================================================================

import { createClient } from "@/shared/lib/supabase/server";
import type { Organization, Membership } from "../types";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
}

export interface SessionContext {
  user: SessionUser;
  organization: Organization;
  membership: Membership;
}

/**
 * Get the current authenticated user from Supabase session.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    id: user.id,
    email: user.email ?? "",
    name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
  };
}

/**
 * Require authentication. Throws if not authenticated.
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

/**
 * Get the user's active organization context.
 * Uses the organization_id from cookie/header or falls back to the first membership.
 */
export async function requireOrganization(
  organizationId?: string
): Promise<SessionContext> {
  const user = await requireAuth();
  const supabase = await createClient();

  let query = supabase
    .from("memberships")
    .select(
      `
      *,
      organization:organizations(*)
    `
    )
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  }

  const { data: memberships, error } = await query.limit(1).single();

  if (error || !memberships) {
    throw new Error("No organization membership found");
  }

  const org = memberships.organization as unknown as Organization;
  const membership: Membership = {
    id: memberships.id,
    organizationId: memberships.organization_id,
    userId: memberships.user_id,
    roleId: memberships.role_id,
    isActive: memberships.is_active,
    invitedBy: memberships.invited_by,
    invitedAt: memberships.invited_at,
    acceptedAt: memberships.accepted_at,
    createdAt: memberships.created_at,
    updatedAt: memberships.updated_at,
  };

  return {
    user,
    organization: org,
    membership,
  };
}
