import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://occhiale.com.br";

interface PageProps {
  params: Promise<{ slug: string; pageSlug: string }>;
}

async function getSeoPage(storeSlug: string, pageSlug: string) {
  const supabase = createServiceRoleClient();

  const { data: store } = await supabase
    .from("stores")
    .select("id, name, slug")
    .eq("slug", storeSlug)
    .eq("is_active", true)
    .maybeSingle();

  if (!store) return null;

  const { data: page } = await supabase
    .from("seo_pages")
    .select("*")
    .eq("store_id", store.id)
    .eq("slug", pageSlug)
    .eq("is_published", true)
    .maybeSingle();

  if (!page) return null;

  return { store, page };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, pageSlug } = await params;
  const result = await getSeoPage(slug, pageSlug);

  if (!result) {
    return { title: "Página não encontrada" };
  }

  return {
    title: result.page.title,
    description: result.page.meta_description ?? undefined,
    openGraph: {
      title: result.page.title,
      description: result.page.meta_description ?? undefined,
      url: `${BASE_URL}/${slug}/p/${pageSlug}`,
      type: "article",
      siteName: result.store.name,
    },
    alternates: {
      canonical: `${BASE_URL}/${slug}/p/${pageSlug}`,
    },
  };
}

export default async function SeoPageRoute({ params }: PageProps) {
  const { slug, pageSlug } = await params;
  const result = await getSeoPage(slug, pageSlug);

  if (!result) {
    notFound();
  }

  const { store, page } = result;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: store.name, url: `${BASE_URL}/${store.slug}` },
          {
            name: page.title,
            url: `${BASE_URL}/${store.slug}/p/${page.slug}`,
          },
        ]}
      />

      {page.schema_json && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(page.schema_json),
          }}
        />
      )}

      <article className="mx-auto max-w-3xl px-4 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            {page.title}
          </h1>
          {page.meta_description && (
            <p className="mt-3 text-lg text-zinc-600">
              {page.meta_description}
            </p>
          )}
        </header>

        {page.content_html ? (
          <div
            className="prose prose-zinc max-w-none prose-headings:font-semibold prose-a:text-zinc-900 prose-a:underline"
            dangerouslySetInnerHTML={{ __html: page.content_html }}
          />
        ) : (
          <p className="text-zinc-500">Conteúdo em breve.</p>
        )}
      </article>
    </>
  );
}
