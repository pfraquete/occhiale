import { SettingsNav } from "@/components/dashboard/settings-nav";
import { PaymentSettingsInfo } from "@/modules/core/financeiro/components/payment-settings-info";

export const metadata = {
  title: "Pagamentos — Configurações — OCCHIALE",
};

export default function PaymentSettingsPage() {
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
          Pagamentos
        </h2>
        <p className="mt-1 text-xs text-text-tertiary">
          Configuração dos métodos de pagamento.
        </p>
        <div className="mt-4">
          <PaymentSettingsInfo />
        </div>
      </div>
    </div>
  );
}
