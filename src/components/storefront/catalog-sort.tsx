"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface CatalogSortProps {
  storeSlug: string;
}

const sortOptions = [
  { value: "recentes", label: "Mais recentes" },
  { value: "preco_asc", label: "Menor preço" },
  { value: "preco_desc", label: "Maior preço" },
  { value: "nome", label: "A-Z" },
];

export function CatalogSort({ storeSlug: _storeSlug }: CatalogSortProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const current = searchParams.get("ordenar") || "recentes";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("ordenar", value);
    params.delete("pagina");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={current}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-secondary focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
    >
      {sortOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
