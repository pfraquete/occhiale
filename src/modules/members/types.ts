// ============================================================================
// Members Module - Type Definitions
// ============================================================================

import type { Membership, Role } from "@/core/types";

export interface MemberWithDetails extends Membership {
  userName: string;
  userEmail: string;
  role: Role | null;
}

export interface InviteMemberInput {
  email: string;
  roleId: string;
  organizationId: string;
}

export interface UpdateMemberRoleInput {
  membershipId: string;
  roleId: string;
}

export interface MembersListParams {
  organizationId: string;
  search?: string;
  roleId?: string;
  page?: number;
  perPage?: number;
}

export interface MembersListResult {
  members: MemberWithDetails[];
  total: number;
  page: number;
  perPage: number;
}
