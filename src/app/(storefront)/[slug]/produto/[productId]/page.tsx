import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getProductById,
  getRelatedProducts,
} from "@/shared/lib/supabase/queries/products";
import { getStoreBySlug } from "@/shared/lib/supabase/queries/stores";
import { formatCentsToBRL } from "@/shared/lib/utils/format";
import { getCategoryLabel, type DbCategory } from "@/shared/lib/utils/categories";
import { ProductImageGallery } from "@/modules/vertical/otica/components/storefront/product-image-gallery";
import { ProductSpecsTable } from "@/modules/vertical/otica/components/storefront/product-specs-table";
import { AddToCartButton } from "@/modules/vertical/otica/components/storefront/add-to-cart-button";
import { Breadcrumbs } from "@/modules/vertical/otica/components/storefront/breadcrumbs";
import { FeaturedProducts } from "@/modules/vertical/otica/components/storefront/featured-products";

interface ProductPageProps {
  params: Promise<{ slug: string; productId: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { productId } = await params;
  const product = await getProductById(productId);
  if (!product) return {};

  return {
    title: product.name,
    description:
      product.description_seo ??
      product.description ??
      `${product.name} — ${product.brand ?? ""}`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug, productId } = await params;
  const [store, product] = await Promise.all([
    getStoreBySlug(slug),
    getProductById(productId),
  ]);

  if (!store || !product) {
    notFound();
  }

  const related = await getRelatedProducts(
    store.id,
    product.category,
    product.id,
    4
  );

  const hasDiscount =
    product.compare_price && product.compare_price > product.price;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumbs
        items={[
          { label: "Início", href: `/${slug}` },
          { label: "Catálogo", href: `/${slug}/catalogo` },
          {
            label: getCategoryLabel(product.category as DbCategory),
            href: `/${slug}/catalogo?categoria=${product.category}`,
          },
          { label: product.name },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <ProductImageGallery
          images={product.images ?? []}
          productName={product.name}
        />

        {/* Info */}
        <div className="space-y-6">
          {product.brand && (
            <span className="text-sm font-medium text-text-tertiary">
              {product.brand}
            </span>
          )}

          <h1 className="font-display text-2xl font-bold text-text-primary lg:text-3xl">
            {product.name}
          </h1>

          {/* Price */}
          <div>
            {hasDiscount && (
              <p className="text-sm text-text-tertiary line-through">
                {formatCentsToBRL(product.compare_price!)}
              </p>
            )}
            <p className="text-3xl font-bold text-brand-700">
              {formatCentsToBRL(product.price)}
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              ou até 12x de {formatCentsToBRL(Math.ceil(product.price / 12))}
            </p>
            {hasDiscount && (
              <span className="mt-2 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                Economia de{" "}
                {formatCentsToBRL(product.compare_price! - product.price)}
              </span>
            )}
          </div>

          {/* Stock */}
          {product.stock_qty > 0 && product.stock_qty <= 5 && (
            <p className="text-sm font-medium text-amber-600">
              Últimas {product.stock_qty} unidade
              {product.stock_qty > 1 ? "s" : ""}!
            </p>
          )}

          {/* Add to cart */}
          <AddToCartButton
            product={product}
            storeId={store.id}
            storeSlug={slug}
          />

          {/* Description */}
          {product.description && (
            <div>
              <h3 className="mb-2 text-lg font-semibold text-text-primary">
                Descrição
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                {product.description}
              </p>
            </div>
          )}

          {/* Specs */}
          <ProductSpecsTable specs={product.specs} />
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <FeaturedProducts
          products={related}
          storeSlug={slug}
          title="Produtos Relacionados"
        />
      )}
    </div>
  );
}
