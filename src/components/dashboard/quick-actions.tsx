import Link from "next/link";
import { Plus, ShoppingBag, Settings } from "lucide-react";

const actions = [
  {
    label: "Novo Produto",
    href: "/dashboard/produtos/novo",
    icon: Plus,
    description: "Adicionar um produto ao catálogo",
  },
  {
    label: "Ver Pedidos",
    href: "/dashboard/pedidos",
    icon: ShoppingBag,
    description: "Gerenciar pedidos recebidos",
  },
  {
    label: "Configurações",
    href: "/dashboard/configuracoes",
    icon: Settings,
    description: "Ajustar configurações da loja",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/50"
        >
          <div className="rounded-lg bg-brand-50 p-2.5 transition-colors group-hover:bg-brand-100">
            <action.icon className="h-5 w-5 text-brand-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">
              {action.label}
            </p>
            <p className="text-xs text-text-tertiary">{action.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
