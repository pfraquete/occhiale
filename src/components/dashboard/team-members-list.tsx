"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { removeMemberAction } from "@/modules/vertical/otica/actions/store-settings";
import { Avatar } from "@/shared/ui/components/avatar";

const roleLabels: Record<string, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  member: "Membro",
};

interface Member {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

interface TeamMembersListProps {
  members: Member[];
  currentUserRole: string;
}

export function TeamMembersList({
  members,
  currentUserRole,
}: TeamMembersListProps) {
  const [isPending, startTransition] = useTransition();

  const canManageMembers =
    currentUserRole === "owner" || currentUserRole === "admin";

  function handleRemove(memberId: string) {
    if (!confirm("Tem certeza que deseja remover este membro?")) return;

    startTransition(async () => {
      await removeMemberAction(memberId);
    });
  }

  if (members.length === 0) {
    return (
      <p className="text-sm text-text-tertiary">Nenhum membro na equipe.</p>
    );
  }

  return (
    <div className="divide-y divide-border">
      {members.map((member) => (
        <div key={member.id} className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Avatar name={member.user_id.slice(0, 8)} size="sm" />
            <div>
              <p className="text-sm font-medium text-text-primary">
                {member.user_id.slice(0, 8)}...
              </p>
              <p className="text-xs text-text-tertiary">
                {roleLabels[member.role] ?? member.role}
              </p>
            </div>
          </div>

          {canManageMembers && member.role !== "owner" && (
            <button
              type="button"
              onClick={() => handleRemove(member.id)}
              disabled={isPending}
              className="rounded-lg p-1.5 text-text-tertiary hover:bg-red-50 hover:text-danger disabled:opacity-50"
              title="Remover membro"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
