import { createClient } from "@/shared/lib/supabase/server";
import { getUserStoreWithRole } from "@/shared/lib/supabase/queries/dashboard";
import { redirect } from "next/navigation";
import { SettingsNav } from "@/components/dashboard/settings-nav";
import { ShippingSettingsForm } from "@/components/dashboard/shipping-settings-form";

export const metadata = {
  title: "Frete — Configurações — OCCHIALE",
};

export default async function ShippingSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const membership = await getUserStoreWithRole(user.id);
  if (!membership) redirect("/login");

  const settings = (membership.store.settings ?? {}) as Record<string, unknown>;
  const shipping = (settings.shipping ?? {}) as Record<string, unknown>;

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
        <h2 className="text-base font-semibold text-text-primary">Frete</h2>
        <p className="mt-1 text-xs text-text-tertiary">
          Configure o custo de frete e condições para frete grátis.
        </p>
        <div className="mt-4">
          <ShippingSettingsForm
            storeId={membership.storeId}
            defaultValues={{
              defaultCost: (shipping.defaultCost as number) ?? 0,
              freeAbove: (shipping.freeAbove as number) ?? undefined,
            }}
          />
        </div>
      </div>
    </div>
  );
}
