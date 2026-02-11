import { NextResponse } from "next/server";

/**
 * Health Check Endpoint
 * GET /api/health
 *
 * Returns the health status of the application.
 * Used by monitoring tools, load balancers, and uptime checks.
 */
export async function GET() {
  const checks: Record<string, "ok" | "error"> = {};

  // Check Supabase connectivity
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const res = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
        },
        signal: AbortSignal.timeout(5000),
      });
      checks.supabase = res.ok ? "ok" : "error";
    } else {
      checks.supabase = "error";
    }
  } catch {
    checks.supabase = "error";
  }

  // Check Meilisearch connectivity
  try {
    const meiliUrl = process.env.MEILISEARCH_URL;
    if (meiliUrl) {
      const res = await fetch(`${meiliUrl}/health`, {
        signal: AbortSignal.timeout(5000),
      });
      checks.meilisearch = res.ok ? "ok" : "error";
    } else {
      checks.meilisearch = "error";
    }
  } catch {
    checks.meilisearch = "error";
  }

  // Check Evolution API connectivity
  try {
    const evoUrl = process.env.EVOLUTION_API_URL;
    if (evoUrl) {
      const res = await fetch(`${evoUrl}/instance/fetchInstances`, {
        headers: {
          apikey: process.env.EVOLUTION_API_KEY ?? "",
        },
        signal: AbortSignal.timeout(5000),
      });
      checks.evolution = res.ok ? "ok" : "error";
    } else {
      checks.evolution = "error";
    }
  } catch {
    checks.evolution = "error";
  }

  const allHealthy = Object.values(checks).every((v) => v === "ok");

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? "dev",
      checks,
    },
    { status: allHealthy ? 200 : 503 }
  );
}
