// ============================================
// OCCHIALE - Meilisearch Sync API Route
// POST: triggers product sync to Meilisearch
// Supports full sync (all stores) or per-store sync
// ============================================

import { NextResponse, type NextRequest } from "next/server";
import { MeiliSearch } from "meilisearch";
import { configureIndices } from "@/lib/meilisearch/indices";
import { syncAllProducts, syncStoreProducts } from "@/lib/meilisearch/sync";

/**
 * POST /api/meilisearch/sync
 *
 * Body:
 * - storeId? (string) — sync a specific store. If omitted, syncs all stores.
 * - configure? (boolean) — run index configuration before sync (first-time setup)
 *
 * Auth: Requires EVOLUTION_API_KEY in x-internal-key header (reusing the same internal auth).
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify internal auth
    const internalKey = request.headers.get("x-internal-key");
    if (internalKey !== process.env.EVOLUTION_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse body
    const body = await request.json().catch(() => ({}));
    const storeId = body.storeId as string | undefined;
    const configure = body.configure as boolean | undefined;

    // 3. Configure indices if requested (first-time setup)
    if (configure) {
      const host = process.env.MEILISEARCH_URL;
      const apiKey = process.env.MEILISEARCH_API_KEY;

      if (!host) {
        return NextResponse.json(
          { error: "MEILISEARCH_URL not configured" },
          { status: 500 }
        );
      }

      const client = new MeiliSearch({
        host,
        apiKey: apiKey ?? undefined,
      });

      await configureIndices(client);
    }

    // 4. Sync products
    const result = storeId
      ? await syncStoreProducts(storeId)
      : await syncAllProducts();

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Sync failed",
          details: result.error,
          durationMs: result.durationMs,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      indexed: result.indexed,
      deleted: result.deleted,
      durationMs: result.durationMs,
      scope: storeId ? `store:${storeId}` : "all",
    });
  } catch (error) {
    console.error("Meilisearch sync error:", error);
    return NextResponse.json(
      { error: "Sync processing failed" },
      { status: 500 }
    );
  }
}
