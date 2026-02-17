"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { CATEGORIES } from "@/shared/lib/utils/categories";

interface CatalogFiltersProps {
  storeSlug: string;
  brands: string[];
  mobile?: boolean;
}

const FRAME_SHAPES = [
  { value: "redondo", label: "Redondo" },
  { value: "quadrado", label: "Quadrado" },
  { value: "retangular", label: "Retangular" },
  { value: "aviador", label: "Aviador" },
  { value: "gatinho", label: "Gatinho" },
  { value: "oval", label: "Oval" },
];

const MATERIALS = [
  { value: "acetato", label: "Acetato" },
  { value: "metal", label: "Metal" },
  { value: "titanio", label: "Titânio" },
  { value: "misto", label: "Misto" },
];

export function CatalogFilters({
  storeSlug,
  brands,
  mobile,
}: CatalogFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function setFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("pagina"); // reset page on filter change
    router.push(`${pathname}?${params.toString()}`);
  }

  const currentCategoria = searchParams.get("categoria");
  const currentMarca = searchParams.get("marca");
  const currentForma = searchParams.get("forma");
  const currentMaterial = searchParams.get("material");

  const filtersContent = (
    <div className="space-y-6">
      {/* Categorias */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-text-primary">
          Categoria
        </h3>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.db}
              onClick={() =>
                setFilter(
                  "categoria",
                  currentCategoria === cat.slug ? null : cat.slug
                )
              }
              className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                currentCategoria === cat.slug
                  ? "bg-brand-50 font-medium text-brand-700"
                  : "text-text-secondary hover:bg-surface-secondary"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Marcas */}
      {brands.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-text-primary">
            Marca
          </h3>
          <div className="space-y-1">
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() =>
                  setFilter("marca", currentMarca === brand ? null : brand)
                }
                className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                  currentMarca === brand
                    ? "bg-brand-50 font-medium text-brand-700"
                    : "text-text-secondary hover:bg-surface-secondary"
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Formato */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-text-primary">
          Formato
        </h3>
        <div className="space-y-1">
          {FRAME_SHAPES.map((shape) => (
            <button
              key={shape.value}
              onClick={() =>
                setFilter(
                  "forma",
                  currentForma === shape.value ? null : shape.value
                )
              }
              className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                currentForma === shape.value
                  ? "bg-brand-50 font-medium text-brand-700"
                  : "text-text-secondary hover:bg-surface-secondary"
              }`}
            >
              {shape.label}
            </button>
          ))}
        </div>
      </div>

      {/* Material */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-text-primary">
          Material
        </h3>
        <div className="space-y-1">
          {MATERIALS.map((mat) => (
            <button
              key={mat.value}
              onClick={() =>
                setFilter(
                  "material",
                  currentMaterial === mat.value ? null : mat.value
                )
              }
              className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                currentMaterial === mat.value
                  ? "bg-brand-50 font-medium text-brand-700"
                  : "text-text-secondary hover:bg-surface-secondary"
              }`}
            >
              {mat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Mobile: button + sheet
  if (mobile) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-text-secondary lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
        </button>

        {open && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 z-50 w-72 overflow-y-auto bg-surface p-4 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Filtros</h2>
                <button onClick={() => setOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              {filtersContent}
            </div>
          </>
        )}
      </>
    );
  }

  // Desktop: sidebar
  return filtersContent;
}
