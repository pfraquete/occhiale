"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { X } from "lucide-react";
import { getCategoryBySlug } from "@/shared/lib/utils/categories";

interface ActiveFiltersProps {
  storeSlug: string;
}

export function ActiveFilters({ storeSlug: _storeSlug }: ActiveFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters: { key: string; label: string }[] = [];

  const cat = searchParams.get("categoria");
  if (cat) {
    const info = getCategoryBySlug(cat);
    filters.push({ key: "categoria", label: info?.label ?? cat });
  }

  const marca = searchParams.get("marca");
  if (marca) filters.push({ key: "marca", label: marca });

  const forma = searchParams.get("forma");
  if (forma) filters.push({ key: "forma", label: forma });

  const material = searchParams.get("material");
  if (material) filters.push({ key: "material", label: material });

  const q = searchParams.get("q");
  if (q) filters.push({ key: "q", label: `"${q}"` });

  if (filters.length === 0) return null;

  function removeFilter(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("pagina");
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearAll() {
    router.push(pathname);
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {filters.map((f) => (
        <button
          key={f.key}
          onClick={() => removeFilter(f.key)}
          className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100"
        >
          {f.label}
          <X className="h-3 w-3" />
        </button>
      ))}
      <button
        onClick={clearAll}
        className="text-xs text-text-tertiary hover:text-text-secondary"
      >
        Limpar tudo
      </button>
    </div>
  );
}
