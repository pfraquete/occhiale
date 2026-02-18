// ============================================================================
// Members Module - Members Table Component
// ============================================================================

"use client";

import { Badge } from "@/shared/ui/components";
import type { MemberWithDetails } from "../types";

interface MembersTableProps {
  members: MemberWithDetails[];
  onRemove?: (id: string) => void;
  onChangeRole?: (id: string, roleId: string) => void;
}

export function MembersTable({
  members,
  onRemove,
  onChangeRole,
}: MembersTableProps) {
  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
        <p className="text-sm">Nenhum membro encontrado.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-text-secondary">
            <th className="px-4 py-3 font-medium">Membro</th>
            <th className="px-4 py-3 font-medium">Cargo</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Desde</th>
            {(onRemove || onChangeRole) && (
              <th className="px-4 py-3 font-medium">Ações</th>
            )}
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="border-b border-border">
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-text-primary">
                    {member.userName || "Usuário"}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {member.userEmail}
                  </p>
                </div>
              </td>
              <td className="px-4 py-3">
                <Badge variant="default">
                  {member.role?.name ?? "Sem cargo"}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <Badge variant={member.isActive ? "success" : "outline"}>
                  {member.isActive ? "Ativo" : "Inativo"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-text-secondary">
                {new Date(member.createdAt).toLocaleDateString("pt-BR")}
              </td>
              {(onRemove || onChangeRole) && (
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {onChangeRole && (
                      <button
                        type="button"
                        onClick={() =>
                          onChangeRole(member.id, member.roleId ?? "")
                        }
                        className="text-xs text-brand-700 hover:underline"
                      >
                        Alterar cargo
                      </button>
                    )}
                    {onRemove && (
                      <button
                        type="button"
                        onClick={() => onRemove(member.id)}
                        className="text-xs text-danger hover:underline"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
