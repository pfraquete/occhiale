"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCentsToBRL } from "@/shared/lib/utils/format";
import { ToggleProductSwitch } from "./toggle-product-switch";
import { ProductActionsDropdown } from "./product-actions-dropdown";

interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  price: number;
  compare_price: number | null;
  stock_qty: number;
  is_active: boolean;
  images: string[];
  created_at: string;
}

const categoryLabels: Record<string, string> = {
  "oculos-grau": "Óculos de Grau",
  "oculos-sol": "Óculos de Sol",
  "lentes-contato": "Lentes de Contato",
  acessorios: "Acessórios",
  infantil: "Infantil",
};

interface ProductsTableProps {
  products: Product[];
  total: number;
  page: number;
  perPage: number;
}

export function ProductsTable({
  products,
  total,
  page,
  perPage,
}: ProductsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / perPage);

  function goToPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage > 1) {
      params.set("pagina", String(newPage));
    } else {
      params.delete("pagina");
    }
    router.push(`/dashboard/produtos?${params.toString()}`);
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-12 text-center">
        <p className="text-sm text-text-tertiary">Nenhum produto encontrado.</p>
        <Link
          href="/dashboard/produtos/novo"
          className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Criar primeiro produto →
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
              <th className="px-5 py-3">Produto</th>
              <th className="px-5 py-3">Categoria</th>
              <th className="px-5 py-3 text-right">Preço</th>
              <th className="px-5 py-3 text-right">Estoque</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-bg-secondary/50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-bg-secondary">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[8px] text-text-tertiary">
                          IMG
                        </div>
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/dashboard/produtos/${product.id}`}
                        className="text-sm font-medium text-text-primary hover:text-brand-600"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-text-tertiary">
                        {product.brand ?? "—"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-text-secondary">
                  {categoryLabels[product.category] ?? product.category}
                </td>
                <td className="px-5 py-3 text-right">
                  <p className="text-sm font-medium text-text-primary">
                    {formatCentsToBRL(product.price)}
                  </p>
                  {product.compare_price && (
                    <p className="text-xs text-text-tertiary line-through">
                      {formatCentsToBRL(product.compare_price)}
                    </p>
                  )}
                </td>
                <td className="px-5 py-3 text-right text-sm text-text-secondary">
                  {product.stock_qty}
                </td>
                <td className="px-5 py-3">
                  <ToggleProductSwitch
                    productId={product.id}
                    isActive={product.is_active}
                  />
                </td>
                <td className="px-5 py-3">
                  <ProductActionsDropdown
                    productId={product.id}
                    productName={product.name}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <p className="text-xs text-text-tertiary">
            Mostrando {(page - 1) * perPage + 1}–
            {Math.min(page * perPage, total)} de {total} produtos
          </p>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
