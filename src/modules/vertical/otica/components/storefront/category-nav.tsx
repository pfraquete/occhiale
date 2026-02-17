import Link from "next/link";
import { CATEGORIES } from "@/shared/lib/utils/categories";

interface CategoryNavProps {
  storeSlug: string;
  currentCategory?: string;
}

export function CategoryNav({ storeSlug, currentCategory }: CategoryNavProps) {
  return (
    <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
      <Link
        href={`/${storeSlug}/catalogo`}
        className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
          !currentCategory
            ? "bg-brand-600 text-white"
            : "text-text-secondary hover:bg-surface-secondary"
        }`}
      >
        Todos
      </Link>
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.db}
          href={`/${storeSlug}/catalogo?categoria=${cat.slug}`}
          className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            currentCategory === cat.slug
              ? "bg-brand-600 text-white"
              : "text-text-secondary hover:bg-surface-secondary"
          }`}
        >
          {cat.label}
        </Link>
      ))}
    </nav>
  );
}
