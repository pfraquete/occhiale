import { createClient } from "@/lib/supabase/server";
import { getUserStoreWithRole } from "@/lib/supabase/queries/dashboard";
import { redirect } from "next/navigation";
import { SettingsNav } from "@/components/dashboard/settings-nav";
import { GeneralSettingsForm } from "@/components/dashboard/general-settings-form";

export const metadata = {
  title: "Configurações — OCCHIALE",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const membership = await getUserStoreWithRole(user.id);
  if (!membership) redirect("/login");

  const store = membership.store;

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
        <h2 className="text-base font-semibold text-text-primary">
          Configurações Gerais
        </h2>
        <p className="mt-1 text-xs text-text-tertiary">
          Informações básicas da sua loja.
        </p>
        <div className="mt-4">
          <GeneralSettingsForm
            storeId={membership.storeId}
            defaultValues={{
              name: store.name,
              description:
                ((store.settings as Record<string, unknown>)
                  ?.description as string) ?? "",
              logoUrl: store.logo_url ?? "",
              whatsappNumber: store.whatsapp_number ?? "",
            }}
          />
        </div>
      </div>
    </div>
  );
}
