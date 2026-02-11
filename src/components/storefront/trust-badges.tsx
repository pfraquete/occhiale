import { Truck, CreditCard, Shield, Headphones } from "lucide-react";

const badges = [
  {
    icon: Truck,
    title: "Frete para todo Brasil",
    description: "Entrega rápida e segura",
  },
  {
    icon: CreditCard,
    title: "Até 12x sem juros",
    description: "PIX, cartão e boleto",
  },
  {
    icon: Shield,
    title: "Compra segura",
    description: "Seus dados protegidos",
  },
  {
    icon: Headphones,
    title: "Atendimento",
    description: "WhatsApp e e-mail",
  },
];

export function TrustBadges() {
  return (
    <section className="border-y border-border bg-surface-secondary">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 lg:grid-cols-4">
        {badges.map((badge) => {
          const Icon = badge.icon;
          return (
            <div key={badge.title} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  {badge.title}
                </p>
                <p className="text-xs text-text-tertiary">
                  {badge.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
