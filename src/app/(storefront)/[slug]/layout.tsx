import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getStoreBySlug } from "@/shared/lib/supabase/queries/stores";
import { StoreProvider } from "@/modules/vertical/otica/components/storefront/store-provider";
import { StoreHeader } from "@/modules/vertical/otica/components/storefront/store-header";
import { StoreFooter } from "@/modules/vertical/otica/components/storefront/store-footer";
import { WhatsAppFab } from "@/modules/vertical/otica/components/storefront/whatsapp-fab";

interface StoreLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) return {};

  return {
    title: {
      default: store.name,
      template: `%s | ${store.name}`,
    },
    description: `Loja online ${store.name} — Óculos de grau, sol, lentes de contato e acessórios.`,
  };
}

export default async function StoreLayout({
  children,
  params,
}: StoreLayoutProps) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  if (!store) {
    notFound();
  }

  return (
    <StoreProvider store={store}>
      <div className="flex min-h-screen flex-col">
        <StoreHeader store={store} />
        <main className="flex-1">{children}</main>
        <StoreFooter store={store} />
        <WhatsAppFab />
      </div>
    </StoreProvider>
  );
}
