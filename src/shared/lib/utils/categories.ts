// ============================================
// OCCHIALE - Category Mapping (DB ↔ Domain)
// ============================================

import {
  Glasses,
  Sun,
  Baby,
  Eye,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

// DB values (stores.products.category CHECK constraint)
export type DbCategory = "grau" | "sol" | "infantil" | "lentes" | "acessorios";

export interface CategoryInfo {
  db: DbCategory;
  slug: string; // URL-friendly
  label: string; // pt-BR display
  labelPlural: string;
  icon: LucideIcon;
  description: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    db: "grau",
    slug: "grau",
    label: "Óculos de Grau",
    labelPlural: "Óculos de Grau",
    icon: Glasses,
    description: "Armações para lentes corretivas",
  },
  {
    db: "sol",
    slug: "sol",
    label: "Óculos de Sol",
    labelPlural: "Óculos de Sol",
    icon: Sun,
    description: "Proteção e estilo para seus olhos",
  },
  {
    db: "infantil",
    slug: "infantil",
    label: "Infantil",
    labelPlural: "Óculos Infantis",
    icon: Baby,
    description: "Óculos resistentes para crianças",
  },
  {
    db: "lentes",
    slug: "lentes",
    label: "Lentes de Contato",
    labelPlural: "Lentes de Contato",
    icon: Eye,
    description: "Lentes para todos os graus",
  },
  {
    db: "acessorios",
    slug: "acessorios",
    label: "Acessórios",
    labelPlural: "Acessórios",
    icon: Sparkles,
    description: "Estojos, cordões e mais",
  },
];

/** Get category info by DB value */
export function getCategoryByDb(db: DbCategory): CategoryInfo | undefined {
  return CATEGORIES.find((c) => c.db === db);
}

/** Get category info by URL slug */
export function getCategoryBySlug(slug: string): CategoryInfo | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

/** Get category label for display */
export function getCategoryLabel(db: DbCategory): string {
  return getCategoryByDb(db)?.label ?? db;
}
