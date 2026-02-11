import Link from "next/link";
import { Package, ArrowRight } from "lucide-react";

export function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
      <div className="rounded-full bg-brand-50 p-4">
        <Package className="h-8 w-8 text-brand-700" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-text-primary">
        Nenhum pedido ainda
      </h2>
      <p className="mt-2 max-w-sm text-sm text-text-tertiary">
        Comece adicionando produtos ao seu catálogo. Quando seus clientes
        fizerem pedidos, eles aparecerão aqui.
      </p>
      <Link
        href="/dashboard/produtos/novo"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
      >
        Adicionar primeiro produto
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
