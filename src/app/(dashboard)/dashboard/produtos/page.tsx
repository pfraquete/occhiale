import { createClient } from "@/lib/supabase/server";
import { getUserStoreWithRole } from "@/lib/supabase/queries/dashboard";
import { getProducts } from "@/lib/supabase/queries/dashboard-products";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ProductsFilters } from "@/components/dashboard/products-filters";
import { ProductsTable } from "@/components/dashboard/products-table";
import { Suspense } from "react";

export const metadata = {
  title: "Produtos — OCCHIALE",
};

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const membership = await getUserStoreWithRole(user.id);
  if (!membership) redirect("/login");

  const page = Number(params.pagina) || 1;
  const perPage = 20;

  const { products, total } = await getProducts(membership.storeId, {
    category: params.categoria,
    isActive: params.ativo !== undefined ? params.ativo === "true" : undefined,
    search: params.q,
    page,
    perPage,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Produtos</h1>
          <p className="mt-1 text-sm text-text-tertiary">
            Gerencie o catálogo da sua loja.
          </p>
        </div>
        <Link
          href="/dashboard/produtos/novo"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Novo Produto
        </Link>
      </div>

      <Suspense fallback={null}>
        <ProductsFilters />
      </Suspense>

      <ProductsTable
        products={products}
        total={total}
        page={page}
        perPage={perPage}
      />
    </div>
  );
}
