// ============================================
// OCCHIALE - Meilisearch Cron Sync Route
// GET: Called by Vercel Cron or external cron to sync all stores
// Protected by CRON_SECRET header
// ============================================

import { NextResponse, type NextRequest } from "next/server";
import { syncAllProducts } from "@/lib/meilisearch/sync";
import { configureIndices } from "@/lib/meilisearch/indices";
import { MeiliSearch } from "meilisearch";

export const maxDuration = 60; // Allow up to 60s for Vercel

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (Vercel Cron sends this automatically)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure indices are configured
    const host =
      process.env.MEILISEARCH_URL ?? process.env.NEXT_PUBLIC_MEILISEARCH_HOST;
    const apiKey =
      process.env.MEILISEARCH_API_KEY ?? process.env.MEILISEARCH_ADMIN_KEY;
    if (!host) {
      return NextResponse.json(
        { error: "Meilisearch not configured" },
        { status: 500 }
      );
    }
    const meiliClient = new MeiliSearch({ host, apiKey: apiKey ?? undefined });
    await configureIndices(meiliClient);

    // Sync all products across all stores
    const result = await syncAllProducts();

    return NextResponse.json({
      success: result.success,
      totalProductsSynced: result.indexed,
      durationMs: result.durationMs,
      error: result.error ?? undefined,
    });
  } catch (error) {
    console.error("Meilisearch cron sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
