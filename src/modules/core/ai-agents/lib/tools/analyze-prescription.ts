// ============================================
// OCCHIALE - AI Tool: Analyze Prescription
// Uses Claude Vision to OCR optical prescriptions
// Full implementation in Fase 3 (OCR Pipeline)
// ============================================

import { analyzePrescriptionImage } from "@/modules/core/ai-agents/lib/prescription-ocr";
import type { ToolContext } from "./index";

export async function executeAnalyzePrescription(
  input: Record<string, unknown>,
  _context: ToolContext
): Promise<string> {
  const imageUrl = input.imageUrl as string | undefined;

  if (!imageUrl) {
    return JSON.stringify({
      error:
        "URL da imagem não fornecida. Peça ao cliente para enviar a foto da receita.",
    });
  }

  try {
    const result = await analyzePrescriptionImage(imageUrl);
    return JSON.stringify(result);
  } catch (error) {
    console.error("Prescription OCR error:", error);
    return JSON.stringify({
      error:
        "Não foi possível analisar a receita. A imagem pode estar borrada ou em formato não suportado.",
      suggestion:
        "Peça ao cliente para enviar uma foto mais nítida da receita.",
    });
  }
}
