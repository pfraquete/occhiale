// ============================================================================
// Audit Logs Page
// ============================================================================

import { requireOrganization } from "@/core/auth/session";
import { queryAuditLogs } from "@/core/audit/logger";
import { redirect } from "next/navigation";

export default async function AuditPage() {
  let context;
  try {
    context = await requireOrganization();
  } catch {
    redirect("/login");
  }

  const { organization } = context;

  const { logs, total } = await queryAuditLogs(organization.id, {
    limit: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Log de Auditoria
        </h1>
        <p className="text-sm text-text-secondary">
          Histórico de todas as ações realizadas na organização.
          {total > 0 && ` (${total} registros)`}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-surface">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
            <p className="text-sm">Nenhum registro de auditoria encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-text-secondary">
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Ação</th>
                  <th className="px-4 py-3 font-medium">Entidade</th>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Usuário</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-border">
                    <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                      {new Date(log.createdAt).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-bg-secondary px-2 py-0.5 text-xs font-medium">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-primary">
                      {log.entity}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                      {log.entityId
                        ? `${log.entityId.slice(0, 8)}...`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                      {log.userId
                        ? `${log.userId.slice(0, 8)}...`
                        : "Sistema"}
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
