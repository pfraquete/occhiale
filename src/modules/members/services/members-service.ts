// ============================================================================
// Members Module - Service Layer
// ============================================================================

import { createClient } from "@/shared/lib/supabase/server";
import { createAuditLog } from "@/core/audit/logger";
import type {
  MemberWithDetails,
  MembersListParams,
  MembersListResult,
  InviteMemberInput,
} from "../types";

/**
 * List members of an organization with filtering and pagination.
 */
export async function listMembers(
  params: MembersListParams
): Promise<MembersListResult> {
  const supabase = await createClient();
  const { organizationId, page = 1, perPage = 20 } = params;
  const offset = (page - 1) * perPage;

  const { data, count, error } = await supabase
    .from("memberships")
    .select("*, role:roles(*)", { count: "exact" })
    .eq("organization_id", organizationId)
    .range(offset, offset + perPage - 1)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list members: ${error.message}`);
  }

  const members: MemberWithDetails[] = (data ?? []).map((m) => ({
    id: m.id,
    organizationId: m.organization_id,
    userId: m.user_id,
    roleId: m.role_id,
    isActive: m.is_active,
    invitedBy: m.invited_by,
    invitedAt: m.invited_at,
    acceptedAt: m.accepted_at,
    createdAt: m.created_at,
    updatedAt: m.updated_at,
    userName: "",
    userEmail: "",
    role: m.role as unknown as MemberWithDetails["role"],
  }));

  return {
    members,
    total: count ?? 0,
    page,
    perPage,
  };
}

/**
 * Invite a new member to the organization.
 */
export async function inviteMember(
  input: InviteMemberInput,
  invitedByUserId: string
): Promise<MemberWithDetails> {
  const supabase = await createClient();

  // Check if user already exists
  const { data: existingUser } = await supabase.rpc("get_user_by_email", {
    p_email: input.email,
  });

  const userId = (existingUser as unknown as { id: string })?.id;

  if (!userId) {
    throw new Error("User not found. They need to create an account first.");
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from("memberships")
    .select("id")
    .eq("organization_id", input.organizationId)
    .eq("user_id", userId)
    .single();

  if (existing) {
    throw new Error("User is already a member of this organization.");
  }

  const { data, error } = await supabase
    .from("memberships")
    .insert({
      organization_id: input.organizationId,
      user_id: userId,
      role_id: input.roleId,
      invited_by: invitedByUserId,
      invited_at: new Date().toISOString(),
      is_active: true,
    })
    .select("*, role:roles(*)")
    .single();

  if (error) {
    throw new Error(`Failed to invite member: ${error.message}`);
  }

  await createAuditLog({
    organizationId: input.organizationId,
    userId: invitedByUserId,
    action: "invite",
    entity: "member",
    entityId: data.id,
    newData: { email: input.email, roleId: input.roleId },
  });

  return {
    id: data.id,
    organizationId: data.organization_id,
    userId: data.user_id,
    roleId: data.role_id,
    isActive: data.is_active,
    invitedBy: data.invited_by,
    invitedAt: data.invited_at,
    acceptedAt: data.accepted_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    userName: "",
    userEmail: input.email,
    role: data.role as unknown as MemberWithDetails["role"],
  };
}

/**
 * Remove a member from the organization.
 */
export async function removeMember(
  membershipId: string,
  organizationId: string,
  removedByUserId: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("memberships")
    .update({ is_active: false })
    .eq("id", membershipId)
    .eq("organization_id", organizationId);

  if (error) {
    throw new Error(`Failed to remove member: ${error.message}`);
  }

  await createAuditLog({
    organizationId,
    userId: removedByUserId,
    action: "remove",
    entity: "member",
    entityId: membershipId,
  });
}

/**
 * Update a member's role.
 */
export async function updateMemberRole(
  membershipId: string,
  organizationId: string,
  newRoleId: string,
  updatedByUserId: string
): Promise<void> {
  const supabase = await createClient();

  // Get current role for audit
  const { data: current } = await supabase
    .from("memberships")
    .select("role_id")
    .eq("id", membershipId)
    .single();

  const { error } = await supabase
    .from("memberships")
    .update({ role_id: newRoleId })
    .eq("id", membershipId)
    .eq("organization_id", organizationId);

  if (error) {
    throw new Error(`Failed to update member role: ${error.message}`);
  }

  await createAuditLog({
    organizationId,
    userId: updatedByUserId,
    action: "update_role",
    entity: "member",
    entityId: membershipId,
    oldData: { roleId: current?.role_id },
    newData: { roleId: newRoleId },
  });
}
