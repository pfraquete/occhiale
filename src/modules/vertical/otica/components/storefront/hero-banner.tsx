import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Tables } from "@/shared/types/database";

interface HeroBannerProps {
  store: Tables<"stores">;
}

export function HeroBanner({ store }: HeroBannerProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          {store.name}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-brand-100">
          Encontre o óculos perfeito para você. Óculos de grau, sol, lentes de
          contato e muito mais.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/${store.slug}/catalogo`}
            className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-600"
          >
            Ver Catálogo
            <ArrowRight className="h-4 w-4" />
          </Link>
          {store.whatsapp_number && (
            <a
              href={`https://wa.me/${store.whatsapp_number.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Falar no WhatsApp
            </a>
          )}
        </div>
      </div>
      {/* Decorative circles */}
      <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/5" />
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5" />
    </section>
  );
}
