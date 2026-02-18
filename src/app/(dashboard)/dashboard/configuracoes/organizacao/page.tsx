// ============================================================================
// Organization Settings Page
// ============================================================================

import { requireOrganization } from "@/core/auth/session";
import { redirect } from "next/navigation";

export default async function OrganizationSettingsPage() {
  let context;
  try {
    context = await requireOrganization();
  } catch {
    redirect("/login");
  }

  const { organization } = context;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Organização</h1>
        <p className="text-sm text-text-secondary">
          Gerencie as configurações da sua organização.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold">Dados da Organização</h2>
        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-text-secondary">Nome</dt>
            <dd className="text-text-primary">{organization.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">Slug</dt>
            <dd className="font-mono text-sm text-text-primary">
              {organization.slug}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-text-secondary">Status</dt>
            <dd className="text-text-primary">
              {organization.isActive ? "Ativa" : "Inativa"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
