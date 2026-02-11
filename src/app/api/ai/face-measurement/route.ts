import { NextRequest, NextResponse } from "next/server";
import { analyzeFacePhoto } from "@/lib/ai/face-measurement";
import { rateLimiters } from "@/lib/utils/rate-limit";

/**
 * POST /api/ai/face-measurement
 * Analyzes a face photo and returns optical measurements.
 * Body: { imageUrl: string }
 * Public endpoint (customers use this via storefront).
 */
export async function POST(request: NextRequest) {
  // Rate limit
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = rateLimiters.aiFaceMeasurement(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente em breve." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const imageUrl = body.imageUrl as string | undefined;
  if (!imageUrl) {
    return NextResponse.json({ error: "Forneça imageUrl" }, { status: 400 });
  }

  try {
    const result = await analyzeFacePhoto(imageUrl);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, warnings: result.warnings },
        { status: 422 }
      );
    }

    return NextResponse.json({
      measurements: result.measurements,
      warnings: result.warnings,
    });
  } catch (err) {
    console.error("Face measurement error:", err);
    return NextResponse.json(
      { error: "Erro interno ao analisar foto do rosto" },
      { status: 500 }
    );
  }
}
