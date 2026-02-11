// ============================================
// OCCHIALE - Meilisearch Index Configuration
// Defines index settings for products search
// ============================================

import { MeiliSearch } from "meilisearch";

/**
 * Products index configuration.
 * Optimized for Brazilian optical store product search.
 */
const PRODUCTS_INDEX_CONFIG = {
  uid: "products",
  primaryKey: "id",

  searchableAttributes: ["name", "brand", "description_seo", "category"],

  filterableAttributes: [
    "store_id",
    "category",
    "brand",
    "is_active",
    "price",
    "stock_qty",
  ],

  sortableAttributes: [
    "price",
    "created_at",
    "updated_at",
    "name",
    "stock_qty",
  ],

  displayedAttributes: [
    "id",
    "store_id",
    "name",
    "brand",
    "category",
    "description_seo",
    "price",
    "compare_price",
    "stock_qty",
    "is_active",
    "images",
    "specs",
    "created_at",
    "updated_at",
  ],

  typoTolerance: {
    enabled: true,
    minWordSizeForTypos: {
      oneTypo: 3,
      twoTypos: 6,
    },
  },

  // Portuguese-friendly: disable stop words for now, can be added later
  // stopWords: ["de", "do", "da", "dos", "das", "um", "uma", "com", "para", "por"],

  // Synonym examples for optical industry
  synonyms: {
    oculos: ["óculos", "armação", "armacao"],
    sol: ["solar", "escuro"],
    grau: ["receituário", "receituario", "graduado"],
    lente: ["lentes", "cristal"],
    acetato: ["acrilico"],
    aviador: ["aviator", "pilot"],
    gatinho: ["cat-eye", "cat eye"],
  },
} as const;

/**
 * Configure all Meilisearch indices.
 * Call this during initial setup or when index settings need to be updated.
 */
export async function configureIndices(client: MeiliSearch): Promise<void> {
  const config = PRODUCTS_INDEX_CONFIG;

  // Create or update the products index
  await client.createIndex(config.uid, {
    primaryKey: config.primaryKey,
  });

  const index = client.index(config.uid);

  // Apply settings in parallel
  await Promise.all([
    index.updateSearchableAttributes([...config.searchableAttributes]),
    index.updateFilterableAttributes([...config.filterableAttributes]),
    index.updateSortableAttributes([...config.sortableAttributes]),
    index.updateDisplayedAttributes([...config.displayedAttributes]),
    index.updateTypoTolerance({
      enabled: config.typoTolerance.enabled,
      minWordSizeForTypos: config.typoTolerance.minWordSizeForTypos,
    }),
    index.updateSynonyms(
      Object.fromEntries(
        Object.entries(config.synonyms).map(([k, v]) => [k, [...v]])
      )
    ),
  ]);
}

/**
 * Get the products index config for reference.
 */
export function getProductsIndexConfig() {
  return PRODUCTS_INDEX_CONFIG;
}
