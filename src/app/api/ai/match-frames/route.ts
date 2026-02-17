import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/shared/lib/supabase/admin";
import {
  matchFramesToFace,
  type FaceMeasurements,
} from "@/modules/core/ai-agents/lib/face-measurement";
import { rateLimiters } from "@/shared/lib/utils/rate-limit";

/**
 * POST /api/ai/match-frames
 * Matches face measurements against store products and returns ranked recommendations.
 * Body: { storeId: string, measurements: FaceMeasurements }
 * Public endpoint (customers use this via storefront).
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = rateLimiters.aiFrameMatch(ip);
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

  const storeId = body.storeId as string | undefined;
  const measurements = body.measurements as FaceMeasurements | undefined;

  if (!storeId || !measurements) {
    return NextResponse.json(
      { error: "Forneça storeId e measurements" },
      { status: 400 }
    );
  }

  // Validate measurements have required fields
  if (!measurements.pd || !measurements.faceWidth || !measurements.faceShape) {
    return NextResponse.json(
      { error: "Medidas faciais incompletas" },
      { status: 400 }
    );
  }

  try {
    // Fetch active products from the store that are eyewear (not accessories)
    const supabase = createServiceRoleClient();
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, brand, price, images, specs")
      .eq("store_id", storeId)
      .eq("is_active", true)
      .in("category", ["oculos-grau", "oculos-sol", "infantil"])
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json(
        { error: "Erro ao buscar produtos" },
        { status: 500 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json({
        recommendations: [],
        message: "Nenhum produto encontrado nesta loja.",
      });
    }

    // Map products to the format expected by matchFramesToFace
    const productsForMatching = products.map((p) => {
      const specs = (p.specs ?? {}) as Record<string, unknown>;
      return {
        id: p.id,
        name: p.name,
        brand: p.brand ?? "Sem marca",
        price: p.price,
        images: (p.images ?? []) as string[],
        specs: {
          frame_shape: specs.frameShape as string | undefined,
          face_shapes: specs.idealFaceShapes as string[] | undefined,
          bridge: specs.bridgeWidth as number | undefined,
          temple_length: specs.templeLength as number | undefined,
          lens_width: specs.lensWidth as number | undefined,
          material: specs.frameMaterial as string | undefined,
          gender: specs.gender as string | undefined,
        },
      };
    });

    const recommendations = matchFramesToFace(
      measurements,
      productsForMatching
    );

    return NextResponse.json({
      recommendations: recommendations.slice(0, 20),
      totalProducts: products.length,
    });
  } catch (err) {
    console.error("Frame matching error:", err);
    return NextResponse.json(
      { error: "Erro interno ao recomendar armações" },
      { status: 500 }
    );
  }
}
