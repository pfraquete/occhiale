import type { MetadataRoute } from "next";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://occhiale.com.br";

/**
 * Dynamic sitemap generation.
 * Includes:
 * - Static pages (home, login, cadastro)
 * - Store pages (each store's storefront)
 * - Product pages (each product detail)
 * - SEO pages (published blog/guide/landing pages)
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServiceRoleClient();
  const entries: MetadataRoute.Sitemap = [];

  // Static pages
  entries.push(
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/cadastro`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    }
  );

  // Store pages
  const { data: stores } = await supabase
    .from("stores")
    .select("slug, updated_at")
    .eq("is_active", true);

  if (stores) {
    for (const store of stores) {
      entries.push({
        url: `${BASE_URL}/${store.slug}`,
        lastModified: new Date(store.updated_at),
        changeFrequency: "daily",
        priority: 0.8,
      });

      entries.push({
        url: `${BASE_URL}/${store.slug}/catalogo`,
        lastModified: new Date(store.updated_at),
        changeFrequency: "daily",
        priority: 0.7,
      });
    }
  }

  // Product pages (active products only)
  const { data: products } = await supabase
    .from("products")
    .select("id, store_id, updated_at, stores!inner(slug, is_active)")
    .eq("is_active", true)
    .limit(5000);

  if (products) {
    for (const product of products) {
      const store = product.stores as unknown as {
        slug: string;
        is_active: boolean;
      };
      if (!store?.is_active) continue;

      entries.push({
        url: `${BASE_URL}/${store.slug}/produto/${product.id}`,
        lastModified: new Date(product.updated_at),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  // Published SEO pages
  const { data: seoPages } = await supabase
    .from("seo_pages")
    .select("slug, store_id, updated_at, stores!inner(slug, is_active)")
    .eq("is_published", true)
    .limit(2000);

  if (seoPages) {
    for (const page of seoPages) {
      const store = page.stores as unknown as {
        slug: string;
        is_active: boolean;
      };
      if (!store?.is_active) continue;

      entries.push({
        url: `${BASE_URL}/${store.slug}/p/${page.slug}`,
        lastModified: new Date(page.updated_at),
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
  }

  return entries;
}
