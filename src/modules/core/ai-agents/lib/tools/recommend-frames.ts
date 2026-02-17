// ============================================
// OCCHIALE - AI Tool: Recommend Frames
// Matches face measurements against store products
// to recommend the best fitting frames
// ============================================

import {
  matchFramesToFace,
  type FaceMeasurements,
} from "@/modules/core/ai-agents/lib/face-measurement";
import { createServiceRoleClient } from "@/shared/lib/supabase/admin";
import type { ToolContext } from "./index";

export async function executeRecommendFrames(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  // Accept measurements either as a full object or individual fields
  const measurements = input.measurements as FaceMeasurements | undefined;
  const pd = input.pd as number | undefined;

  if (!measurements && !pd) {
    return JSON.stringify({
      error:
        "Medidas faciais não fornecidas. Primeiro peça ao cliente para enviar uma foto do rosto usando a ferramenta face_measurement.",
      suggestion:
        "Use a ferramenta face_measurement primeiro para obter as medidas do cliente.",
    });
  }

  // Build measurements from individual fields if not provided as object
  const faceMeasurements: FaceMeasurements = measurements ?? {
    pd: pd!,
    dnpRight: (input.dnpRight as number) ?? pd! / 2,
    dnpLeft: (input.dnpLeft as number) ?? pd! / 2,
    faceWidth: (input.faceWidth as number) ?? 140,
    faceShape: (input.faceShape as FaceMeasurements["faceShape"]) ?? "oval",
    bridgeWidth: (input.bridgeWidth as number) ?? 18,
    templeLength: (input.templeLength as number) ?? 140,
    hasReferenceCard: false,
    confidence: "medium",
    notes: "",
  };

  try {
    // Fetch products from the store with specs
    const supabase = createServiceRoleClient();
    const { data: products, error: dbError } = await supabase
      .from("products")
      .select("id, name, brand, price, images, specs")
      .eq("store_id", context.storeId)
      .eq("active", true)
      .not("specs", "is", null);

    if (dbError) {
      return JSON.stringify({
        error: "Erro ao buscar produtos da loja.",
      });
    }

    if (!products || products.length === 0) {
      return JSON.stringify({
        error: "Nenhum produto com especificações encontrado na loja.",
        suggestion:
          "Os produtos precisam ter as especificações preenchidas (largura da lente, ponte, etc.) para serem recomendados.",
      });
    }

    // Map products to the format expected by matchFramesToFace
    const productsForMatching = products.map((p) => {
      const specs = (p.specs ?? {}) as Record<string, unknown>;
      return {
        id: p.id as string,
        name: p.name as string,
        brand: (p.brand ?? "Sem marca") as string,
        price: p.price as number,
        images: (p.images ?? []) as string[],
        specs: {
          frame_shape: specs.frame_shape as string | undefined,
          face_shapes: specs.face_shapes as string[] | undefined,
          bridge: specs.bridge as number | undefined,
          temple_length: specs.temple_length as number | undefined,
          lens_width: specs.lens_width as number | undefined,
          material: specs.material as string | undefined,
          gender: specs.gender as string | undefined,
        },
      };
    });

    // Match frames to face
    const recommendations = matchFramesToFace(
      faceMeasurements,
      productsForMatching
    );

    // Return top 5 recommendations
    const top5 = recommendations.slice(0, 5);

    if (top5.length === 0) {
      return JSON.stringify({
        message:
          "Não encontrei armações com especificações compatíveis no catálogo. Posso mostrar todo o catálogo para você escolher.",
      });
    }

    const formatted = top5.map((rec, index) => ({
      ranking: index + 1,
      name: rec.name,
      brand: rec.brand,
      price: `R$ ${(rec.price / 100).toFixed(2)}`,
      compatibilidade: `${rec.compatibility.score}%`,
      motivos: rec.compatibility.reasons,
      alertas: rec.compatibility.warnings,
    }));

    return JSON.stringify({
      success: true,
      totalAnalyzed: productsForMatching.length,
      recommendations: formatted,
      message: `Encontrei ${top5.length} armações que combinam com seu rosto! A melhor opção é "${top5[0]!.name}" com ${top5[0]!.compatibility.score}% de compatibilidade.`,
    });
  } catch (error) {
    console.error("Recommend frames error:", error);
    return JSON.stringify({
      error: "Erro ao buscar recomendações. Tente novamente.",
    });
  }
}
