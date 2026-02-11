import { createClient } from "@/lib/supabase/server";
import { getUserStoreWithRole } from "@/lib/supabase/queries/dashboard";
import { redirect } from "next/navigation";
import { SettingsNav } from "@/components/dashboard/settings-nav";
import { WhatsAppConnection } from "@/components/dashboard/whatsapp-connection";

export const metadata = {
  title: "WhatsApp — Configurações — OCCHIALE",
};

export default async function WhatsAppSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const membership = await getUserStoreWithRole(user.id);
  if (!membership) redirect("/login");

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

      <div className="mx-auto max-w-2xl">
        <WhatsAppConnection storeId={membership.storeId} />
      </div>
    </div>
  );
}
