import { Shield, CreditCard } from "lucide-react";

export function PaymentSettingsInfo() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4">
        <Shield className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900">
            Pagamentos processados pela plataforma OCCHIALE
          </p>
          <p className="mt-1 text-xs text-blue-700">
            Todos os pagamentos são processados de forma segura através da conta
            Pagar.me da plataforma. Você não precisa configurar nenhuma chave de
            API.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="text-sm font-semibold text-text-primary">
          Métodos de Pagamento Aceitos
        </h3>
        <div className="mt-3 space-y-2.5">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <CreditCard className="h-4 w-4 text-text-tertiary" />
            Cartão de Crédito (até 12x)
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <div className="flex h-4 w-4 items-center justify-center rounded text-[8px] font-bold text-text-tertiary border border-text-tertiary">
              PIX
            </div>
            PIX (aprovação instantânea)
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <div className="flex h-4 w-4 items-center justify-center text-[8px] text-text-tertiary">
              |||
            </div>
            Boleto Bancário
          </div>
        </div>
      </div>

      <p className="text-xs text-text-tertiary">
        Os valores das vendas serão transferidos automaticamente de acordo com o
        calendário de repasses do Pagar.me. Em caso de dúvidas, entre em contato
        com o suporte da OCCHIALE.
      </p>
    </div>
  );
}
