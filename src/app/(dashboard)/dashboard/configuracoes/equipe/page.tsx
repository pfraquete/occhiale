import { createClient } from "@/shared/lib/supabase/server";
import { getUserStoreWithRole } from "@/shared/lib/supabase/queries/dashboard";
import { getStoreMembers } from "@/shared/lib/supabase/queries/dashboard-store";
import { redirect } from "next/navigation";
import { SettingsNav } from "@/components/dashboard/settings-nav";
import { TeamMembersList } from "@/components/dashboard/team-members-list";

export const metadata = {
  title: "Equipe — Configurações — OCCHIALE",
};

export default async function TeamSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const membership = await getUserStoreWithRole(user.id);
  if (!membership) redirect("/login");

  const members = await getStoreMembers(membership.storeId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">
          Configurações
        </h1>
        <p className="mt-1 text-sm text-text-tertiary">
          Gerencie as configurações da sua loja.
        </p>
      </div>

      <SettingsNav />

      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-surface p-5">
        <h2 className="text-base font-semibold text-text-primary">Equipe</h2>
        <p className="mt-1 text-xs text-text-tertiary">
          Membros que têm acesso ao painel administrativo.
        </p>
        <div className="mt-4">
          <TeamMembersList
            members={members}
            currentUserRole={membership.role}
          />
        </div>
        <div className="mt-6 rounded-lg bg-yellow-50 p-4">
          <p className="text-xs text-yellow-700">
            <strong>Nota:</strong> O convite de novos membros por e-mail será
            disponível em uma versão futura. Por enquanto, adicione membros
            manualmente no Supabase.
          </p>
        </div>
      </div>
    </div>
  );
}
