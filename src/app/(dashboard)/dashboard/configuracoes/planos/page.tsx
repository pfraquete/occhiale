// ============================================================================
// Billing & Plans Page
// ============================================================================

import { requireOrganization } from "@/core/auth/session";
import { getSubscription, getAvailablePlans } from "@/core/billing/subscription";
import { redirect } from "next/navigation";

export default async function BillingPage() {
  let context;
  try {
    context = await requireOrganization();
  } catch {
    redirect("/login");
  }

  const { organization } = context;

  const [subscription, plans] = await Promise.all([
    getSubscription(organization.id),
    getAvailablePlans(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Planos &amp; Faturamento
        </h1>
        <p className="text-sm text-text-secondary">
          Gerencie seu plano de assinatura e faturamento.
        </p>
      </div>

      {/* Current Plan */}
      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold">Plano Atual</h2>
        {subscription ? (
          <div className="space-y-2">
            <p className="text-text-primary">
              <span className="font-semibold">{subscription.plan?.name}</span>
              <span className="ml-2 text-sm text-text-secondary">
                ({subscription.billingCycle === "monthly" ? "Mensal" : "Anual"})
              </span>
            </p>
            <p className="text-sm text-text-secondary">
              Status: {subscription.status}
            </p>
            <p className="text-sm text-text-secondary">
              Período atual:{" "}
              {new Date(
                subscription.currentPeriodStart
              ).toLocaleDateString("pt-BR")}{" "}
              -{" "}
              {new Date(
                subscription.currentPeriodEnd
              ).toLocaleDateString("pt-BR")}
            </p>
          </div>
        ) : (
          <p className="text-text-secondary">
            Plano Free - Sem assinatura ativa.
          </p>
        )}
      </div>

      {/* Available Plans */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Planos Disponíveis
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-lg border border-border bg-surface p-6"
            >
              <h3 className="text-lg font-bold text-text-primary">
                {plan.name}
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                {plan.description}
              </p>
              <p className="mt-4 text-2xl font-bold text-text-primary">
                {plan.priceMonthly === 0
                  ? "Grátis"
                  : `R$ ${(plan.priceMonthly / 100).toFixed(2)}`}
                {plan.priceMonthly > 0 && (
                  <span className="text-sm font-normal text-text-secondary">
                    /mês
                  </span>
                )}
              </p>
              <ul className="mt-4 space-y-2">
                {(plan.features ?? []).map((feature) => (
                  <li
                    key={feature.featureKey}
                    className="text-sm text-text-secondary"
                  >
                    {formatFeature(feature.featureKey, feature.featureValue)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatFeature(key: string, value: string): string {
  const labels: Record<string, string> = {
    max_products: "Produtos",
    max_stores: "Lojas",
    max_members: "Membros",
    whatsapp_integration: "WhatsApp",
    ai_chat: "Chat IA",
    advanced_reports: "Relatórios avançados",
    pos: "PDV",
    crm_automations: "Automações CRM",
    fiscal_integration: "Integração fiscal",
    custom_domain: "Domínio customizado",
  };

  const label = labels[key] ?? key;

  if (value === "true") return `${label}: Incluído`;
  if (value === "false") return `${label}: Não incluído`;
  if (value === "-1") return `${label}: Ilimitado`;
  return `${label}: até ${value}`;
}
