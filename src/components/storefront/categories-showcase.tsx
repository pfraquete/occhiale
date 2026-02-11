import Link from "next/link";
import { CATEGORIES } from "@/lib/utils/categories";

interface CategoriesShowcaseProps {
  storeSlug: string;
}

export function CategoriesShowcase({ storeSlug }: CategoriesShowcaseProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <h2 className="font-display text-2xl font-bold text-text-primary">
        Categorias
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.db}
              href={`/${storeSlug}/catalogo?categoria=${cat.slug}`}
              className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-6 transition-all hover:border-brand-300 hover:shadow-md"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
                <Icon className="h-7 w-7" />
              </div>
              <span className="text-sm font-medium text-text-primary">
                {cat.label}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
