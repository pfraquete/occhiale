// ============================================================================
// Members Module - Barrel Export
// ============================================================================

// Types
export type {
  MemberWithDetails,
  InviteMemberInput,
  UpdateMemberRoleInput,
  MembersListParams,
  MembersListResult,
} from "./types";

// Services
export {
  listMembers,
  inviteMember,
  removeMember,
  updateMemberRole,
} from "./services/members-service";

// Components
export { MembersTable } from "./components/members-table";
export { InviteMemberForm } from "./components/invite-member-form";

// Hooks
export { useMembers } from "./hooks/use-members";
