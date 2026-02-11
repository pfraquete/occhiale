import type { Tables } from "@/lib/types/database";
import { ProductCard } from "./product-card";

interface FeaturedProductsProps {
  products: Tables<"products">[];
  storeSlug: string;
  title?: string;
}

export function FeaturedProducts({
  products,
  storeSlug,
  title = "Destaques",
}: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <h2 className="font-display text-2xl font-bold text-text-primary">
        {title}
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            storeSlug={storeSlug}
          />
        ))}
      </div>
    </section>
  );
}
