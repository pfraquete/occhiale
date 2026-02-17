import type { Json } from "@/shared/types/database";

interface ProductSpecsTableProps {
  specs: Json;
}

const SPEC_LABELS: Record<string, string> = {
  frameShape: "Formato",
  frameMaterial: "Material",
  frameColor: "Cor",
  frameWidth: "Largura da armação",
  bridgeWidth: "Largura da ponte",
  templeLength: "Comprimento da haste",
  lensWidth: "Largura da lente",
  lensHeight: "Altura da lente",
  weight: "Peso",
  uvProtection: "Proteção UV",
  polarized: "Polarizado",
  gender: "Gênero",
};

const SPEC_FORMATTERS: Record<string, (v: unknown) => string> = {
  frameWidth: (v) => `${v}mm`,
  bridgeWidth: (v) => `${v}mm`,
  templeLength: (v) => `${v}mm`,
  lensWidth: (v) => `${v}mm`,
  lensHeight: (v) => `${v}mm`,
  weight: (v) => `${v}g`,
  uvProtection: (v) => (v ? "Sim" : "Não"),
  polarized: (v) => (v ? "Sim" : "Não"),
};

export function ProductSpecsTable({ specs }: ProductSpecsTableProps) {
  if (!specs || typeof specs !== "object") return null;

  const entries = Object.entries(specs as Record<string, unknown>).filter(
    ([, v]) => v !== null && v !== undefined && v !== ""
  );

  if (entries.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3 text-lg font-semibold text-text-primary">
        Especificações
      </h3>
      <dl className="divide-y divide-border rounded-lg border border-border">
        {entries.map(([key, value]) => {
          if (key === "idealFaceShapes" || Array.isArray(value)) return null;

          const label = SPEC_LABELS[key] ?? key;
          const formatter = SPEC_FORMATTERS[key];
          const displayValue = formatter ? formatter(value) : String(value);

          return (
            <div key={key} className="flex justify-between px-4 py-2.5 text-sm">
              <dt className="text-text-secondary">{label}</dt>
              <dd className="font-medium capitalize text-text-primary">
                {displayValue}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
