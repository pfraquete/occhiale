import { notFound } from "next/navigation";
import { getStoreBySlug } from "@/shared/lib/supabase/queries/stores";
import {
  getFilteredProducts,
  getBrandsForStore,
} from "@/shared/lib/supabase/queries/products";
import { ProductCard } from "@/modules/vertical/otica/components/storefront/product-card";
import { CatalogFilters } from "@/modules/vertical/otica/components/storefront/catalog-filters";
import { CatalogSort } from "@/modules/vertical/otica/components/storefront/catalog-sort";
import { Pagination } from "@/modules/vertical/otica/components/storefront/pagination";
import { EmptyState } from "@/modules/vertical/otica/components/storefront/empty-state";
import { ActiveFilters } from "@/modules/vertical/otica/components/storefront/active-filters";

interface CatalogoPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CatalogoPage({
  params,
  searchParams,
}: CatalogoPageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  const store = await getStoreBySlug(slug);
  if (!store) notFound();

  const categoria = typeof sp.categoria === "string" ? sp.categoria : undefined;
  const marca = typeof sp.marca === "string" ? sp.marca : undefined;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const forma = typeof sp.forma === "string" ? sp.forma : undefined;
  const material = typeof sp.material === "string" ? sp.material : undefined;
  const preco_min =
    typeof sp.preco_min === "string" ? Number(sp.preco_min) : undefined;
  const preco_max =
    typeof sp.preco_max === "string" ? Number(sp.preco_max) : undefined;
  const ordenar = typeof sp.ordenar === "string" ? sp.ordenar : undefined;
  const pagina = typeof sp.pagina === "string" ? Number(sp.pagina) : 1;

  const [result, brands] = await Promise.all([
    getFilteredProducts({
      storeId: store.id,
      category: categoria,
      brand: marca,
      q,
      frameShape: forma,
      frameMaterial: material,
      priceMin: preco_min,
      priceMax: preco_max,
      sort: ordenar as
        | "preco_asc"
        | "preco_desc"
        | "recentes"
        | "nome"
        | undefined,
      page: pagina,
    }),
    getBrandsForStore(store.id),
  ]);

  const hasFilters = !!(
    categoria ||
    marca ||
    q ||
    forma ||
    material ||
    preco_min ||
    preco_max
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-text-primary">
          {q ? `Resultados para "${q}"` : "Catálogo"}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {result.total} produto{result.total !== 1 ? "s" : ""} encontrado
          {result.total !== 1 ? "s" : ""}
        </p>
      </div>

      {hasFilters && <ActiveFilters storeSlug={slug} />}

      <div className="flex gap-6">
        {/* Sidebar filters - desktop */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <CatalogFilters storeSlug={slug} brands={brands} />
        </aside>

        {/* Products */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <CatalogSort storeSlug={slug} />
            {/* Mobile filter trigger */}
            <CatalogFilters storeSlug={slug} brands={brands} mobile />
          </div>

          {result.products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {result.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    storeSlug={slug}
                  />
                ))}
              </div>

              {result.totalPages > 1 && (
                <Pagination
                  currentPage={result.page}
                  totalPages={result.totalPages}
                  storeSlug={slug}
                />
              )}
            </>
          ) : (
            <EmptyState
              title={
                hasFilters ? "Nenhum produto encontrado" : "Catálogo vazio"
              }
              description={
                hasFilters
                  ? "Tente remover alguns filtros"
                  : "Em breve teremos novidades!"
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
