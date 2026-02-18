// ============================================================================
// Team Members Management Page
// ============================================================================

import { requireOrganization } from "@/core/auth/session";
import { listMembers } from "@/modules/members";
import { redirect } from "next/navigation";

export default async function MembersSettingsPage() {
  let context;
  try {
    context = await requireOrganization();
  } catch {
    redirect("/login");
  }

  const { organization } = context;

  let membersResult;
  try {
    membersResult = await listMembers({
      organizationId: organization.id,
      page: 1,
      perPage: 50,
    });
  } catch {
    membersResult = { members: [], total: 0, page: 1, perPage: 50 };
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Equipe</h1>
          <p className="text-sm text-text-secondary">
            Gerencie os membros da sua organização.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface">
        {membersResult.members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
            <p className="text-sm">Nenhum membro encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-text-secondary">
                  <th className="px-4 py-3 font-medium">Membro</th>
                  <th className="px-4 py-3 font-medium">Cargo</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Desde</th>
                </tr>
              </thead>
              <tbody>
                {membersResult.members.map((member) => (
                  <tr key={member.id} className="border-b border-border">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary">
                        {member.userName || "Membro"}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {member.userEmail}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {member.role?.name ?? "Sem cargo"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium ${member.isActive ? "text-green-600" : "text-red-600"}`}
                      >
                        {member.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {new Date(member.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
