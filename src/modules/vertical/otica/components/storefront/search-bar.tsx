"use client";

import { useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  storeSlug: string;
  initialQuery?: string;
}

export function SearchBar({ storeSlug, initialQuery = "" }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim();
      if (trimmed) {
        router.push(`/${storeSlug}/catalogo?q=${encodeURIComponent(trimmed)}`);
      }
    },
    [query, storeSlug, router]
  );

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
      <input
        type="search"
        placeholder="Buscar produtos..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-full border border-border bg-surface-secondary py-2 pl-10 pr-10 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand-400 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
