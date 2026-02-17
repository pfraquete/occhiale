import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import {
  analyzeProductPhoto,
  analyzeProductPhotos,
} from "@/modules/core/ai-agents/lib/product-recognition";
import { rateLimiters } from "@/shared/lib/utils/rate-limit";

/**
 * POST /api/ai/recognize-product
 * Analyzes product photo(s) and returns auto-detected specs.
 * Body: { imageUrl: string } or { imageUrls: string[] }
 */
export async function POST(request: NextRequest) {
  // Rate limit
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = rateLimiters.aiProductRecognition(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente em breve." },
      { status: 429 }
    );
  }

  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Parse body
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const imageUrl = body.imageUrl as string | undefined;
  const imageUrls = body.imageUrls as string[] | undefined;

  if (!imageUrl && (!imageUrls || imageUrls.length === 0)) {
    return NextResponse.json(
      { error: "Forneça imageUrl ou imageUrls" },
      { status: 400 }
    );
  }

  try {
    const result =
      imageUrls && imageUrls.length > 0
        ? await analyzeProductPhotos(imageUrls)
        : await analyzeProductPhoto(imageUrl!);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 422 });
    }

    return NextResponse.json({ specs: result.specs });
  } catch (err) {
    console.error("Product recognition error:", err);
    return NextResponse.json(
      { error: "Erro interno ao analisar produto" },
      { status: 500 }
    );
  }
}
