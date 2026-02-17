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

  // FIX: Made synonyms bidirectional
  synonyms: {
    oculos: ["óculos", "armação", "armacao"],
    óculos: ["oculos", "armação", "armacao"],
    armação: ["oculos", "óculos", "armacao"],
    armacao: ["oculos", "óculos", "armação"],
    sol: ["solar", "escuro"],
    solar: ["sol", "escuro"],
    escuro: ["sol", "solar"],
    grau: ["receituário", "receituario", "graduado"],
    receituário: ["grau", "receituario", "graduado"],
    receituario: ["grau", "receituário", "graduado"],
    graduado: ["grau", "receituário", "receituario"],
    lente: ["lentes", "cristal"],
    lentes: ["lente", "cristal"],
    cristal: ["lente", "lentes"],
    acetato: ["acrilico"],
    acrilico: ["acetato"],
    aviador: ["aviator", "pilot"],
    aviator: ["aviador", "pilot"],
    pilot: ["aviador", "aviator"],
    gatinho: ["cat-eye", "cat eye"],
    "cat-eye": ["gatinho", "cat eye"],
    "cat eye": ["gatinho", "cat-eye"],
  },
} as const;

/**
 * Configure all Meilisearch indices.
 * Call this during initial setup or when index settings need to be updated.
 *
 * FIX: Run settings updates sequentially instead of Promise.all to avoid
 * race conditions. Meilisearch processes settings updates as tasks, and
 * concurrent updates to the same index can conflict.
 */
export async function configureIndices(client: MeiliSearch): Promise<void> {
  const config = PRODUCTS_INDEX_CONFIG;

  // Create or update the products index
  const createTask = await client.createIndex(config.uid, {
    primaryKey: config.primaryKey,
  });

  // Wait for index creation to complete before applying settings
  await client.tasks.waitForTask(createTask.taskUid);

  const index = client.index(config.uid);

  // Apply settings sequentially to avoid race conditions
  const t1 = await index.updateSearchableAttributes([
    ...config.searchableAttributes,
  ]);
  await client.tasks.waitForTask(t1.taskUid);

  const t2 = await index.updateFilterableAttributes([
    ...config.filterableAttributes,
  ]);
  await client.tasks.waitForTask(t2.taskUid);

  const t3 = await index.updateSortableAttributes([
    ...config.sortableAttributes,
  ]);
  await client.tasks.waitForTask(t3.taskUid);

  const t4 = await index.updateDisplayedAttributes([
    ...config.displayedAttributes,
  ]);
  await client.tasks.waitForTask(t4.taskUid);

  const t5 = await index.updateTypoTolerance({
    enabled: config.typoTolerance.enabled,
    minWordSizeForTypos: config.typoTolerance.minWordSizeForTypos,
  });
  await client.tasks.waitForTask(t5.taskUid);

  const t6 = await index.updateSynonyms(
    Object.fromEntries(
      Object.entries(config.synonyms).map(([k, v]) => [k, [...v]])
    )
  );
  await client.tasks.waitForTask(t6.taskUid);
}

/**
 * Get the products index config for reference.
 */
export function getProductsIndexConfig() {
  return PRODUCTS_INDEX_CONFIG;
}
