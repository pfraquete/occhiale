import Link from "next/link";
import type { Tables } from "@/shared/types/database";
import { CategoryNav } from "./category-nav";
import { SearchBar } from "./search-bar";
import { CartIcon } from "./cart-icon";
import { UserMenu } from "./user-menu";
import { MobileMenu } from "./mobile-menu";

interface StoreHeaderProps {
  store: Tables<"stores">;
}

export function StoreHeader({ store }: StoreHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-sm">
      {/* Main bar */}
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        {/* Mobile menu */}
        <MobileMenu />

        {/* Logo */}
        <Link
          href={`/${store.slug}`}
          className="flex items-center gap-2 font-display text-xl font-bold text-brand-900"
        >
          {store.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.logo_url} alt={store.name} className="h-8 w-auto" />
          ) : (
            store.name
          )}
        </Link>

        {/* Search - desktop */}
        <div className="hidden flex-1 justify-center lg:flex">
          <SearchBar storeSlug={store.slug} />
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1">
          <UserMenu />
          <CartIcon storeSlug={store.slug} />
        </div>
      </div>

      {/* Category nav - desktop */}
      <div className="mx-auto hidden max-w-7xl px-4 lg:block">
        <CategoryNav storeSlug={store.slug} />
      </div>

      {/* Search - mobile */}
      <div className="border-t border-border px-4 py-2 lg:hidden">
        <SearchBar storeSlug={store.slug} />
      </div>
    </header>
  );
}
