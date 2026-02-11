import { notFound } from "next/navigation";
import {
  getStoreBySlug,
  getFeaturedProducts,
} from "@/lib/supabase/queries/stores";
import { HeroBanner } from "@/components/storefront/hero-banner";
import { FeaturedProducts } from "@/components/storefront/featured-products";
import { CategoriesShowcase } from "@/components/storefront/categories-showcase";
import { TrustBadges } from "@/components/storefront/trust-badges";

interface StoreHomePageProps {
  params: Promise<{ slug: string }>;
}

export default async function StoreHomePage({ params }: StoreHomePageProps) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  if (!store) {
    notFound();
  }

  const products = await getFeaturedProducts(store.id, 8);

  return (
    <>
      <HeroBanner store={store} />
      <TrustBadges />
      <FeaturedProducts
        products={products}
        storeSlug={slug}
        title="Novidades"
      />
      <CategoriesShowcase storeSlug={slug} />
    </>
  );
}
