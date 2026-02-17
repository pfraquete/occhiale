// ============================================
// OCCHIALE - AI Tool: Face Measurement
// Analyzes customer face photo to extract optical
// measurements via Claude Vision
// ============================================

import { analyzeFacePhoto } from "@/modules/core/ai-agents/lib/face-measurement";
import type { ToolContext } from "./index";

/**
 * Tutorial video URL for face measurement instructions.
 * The video shows how to hold a credit card next to the face
 * for accurate AI measurements.
 *
 * This is set at deploy time via env var or defaults to the
 * public path on the storefront.
 */
const TUTORIAL_VIDEO_PATH = "/videos/tutorial-medicao-facial.mp4";

export async function executeFaceMeasurement(
  input: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  const imageUrl = input.imageUrl as string | undefined;

  if (!imageUrl) {
    // No image provided — send tutorial video and instructions
    const storeSlug = context.storeSlug ?? "";
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "https://occhiale.com.br";
    const tutorialVideoUrl = `${baseUrl}${storeSlug ? `/${storeSlug}` : ""}${TUTORIAL_VIDEO_PATH}`;

    return JSON.stringify({
      error:
        "O cliente ainda não enviou a foto. Envie o vídeo tutorial e as instruções abaixo.",
      sendVideo: {
        url: tutorialVideoUrl,
        caption: "📐 Tutorial: Como tirar a foto para medição facial com IA",
      },
      message:
        "Para encontrar o óculos perfeito para você, preciso de uma foto do seu rosto! 📸\n\n" +
        "Assista o vídeo acima e siga os passos:\n\n" +
        "1️⃣ Pegue um cartão de crédito (ou qualquer cartão de plástico)\n" +
        "2️⃣ Posicione ao lado do rosto, na altura dos olhos\n" +
        "3️⃣ Segure firme rente à têmpora\n" +
        "4️⃣ Tire uma selfie de frente, olhando direto pra câmera\n" +
        "5️⃣ Envie a foto aqui!\n\n" +
        "💡 O cartão serve como referência de tamanho para medições mais precisas (±1mm).\n" +
        "Sem o cartão, a precisão é de ±3mm — ainda funciona bem!",
    });
  }

  try {
    const result = await analyzeFacePhoto(imageUrl);

    if (!result.success) {
      return JSON.stringify({
        error: result.error,
        suggestion:
          "Peça ao cliente para enviar uma foto frontal mais clara, com boa iluminação.",
      });
    }

    const m = result.measurements!;

    return JSON.stringify({
      success: true,
      measurements: {
        pd: m.pd,
        pdDescription: `Distância pupilar: ${m.pd}mm`,
        dnpRight: m.dnpRight,
        dnpLeft: m.dnpLeft,
        faceWidth: m.faceWidth,
        faceShape: m.faceShape,
        faceShapeDescription: getFaceShapeDescription(m.faceShape),
        bridgeWidth: m.bridgeWidth,
        templeLength: m.templeLength,
        confidence: m.confidence,
      },
      recommendations: {
        frameWidth: `${Math.round(m.faceWidth - 10)}–${Math.round(m.faceWidth + 5)}mm`,
        bridge: `${Math.max(14, m.bridgeWidth - 2)}–${m.bridgeWidth + 2}mm`,
        temple: `${m.templeLength - 5}–${m.templeLength + 5}mm`,
        bestFrameShapes: getRecommendedShapes(m.faceShape),
      },
      warnings: result.warnings,
      nextSteps: [
        "Posso buscar armações que combinam com seu rosto. Quer ver?",
        "Se tiver uma receita, posso calcular a calibragem das lentes também.",
      ],
    });
  } catch (error) {
    console.error("Face measurement error:", error);
    return JSON.stringify({
      error:
        "Não foi possível analisar a foto do rosto. Tente enviar uma foto mais nítida.",
      suggestion: "A foto deve ser frontal, com boa iluminação e sem óculos.",
    });
  }
}

function getFaceShapeDescription(shape: string): string {
  const descriptions: Record<string, string> = {
    oval: "Rosto oval — o formato mais versátil, combina com quase todos os estilos de armação.",
    round:
      "Rosto redondo — armações angulares e retangulares ajudam a alongar o rosto.",
    square:
      "Rosto quadrado — armações redondas e ovais suavizam os traços angulares.",
    heart:
      "Rosto coração — armações aviador e cat-eye equilibram a testa mais larga.",
    oblong:
      "Rosto oblongo — armações oversized e wayfarer adicionam largura ao rosto.",
  };
  return descriptions[shape] ?? `Formato: ${shape}`;
}

function getRecommendedShapes(faceShape: string): string[] {
  const map: Record<string, string[]> = {
    oval: ["Aviador", "Wayfarer", "Retangular", "Redondo", "Cat-eye"],
    round: ["Retangular", "Quadrado", "Wayfarer", "Angular"],
    square: ["Redondo", "Oval", "Aviador", "Cat-eye", "Sem-aro"],
    heart: ["Aviador", "Cat-eye", "Sem-aro", "Redondo"],
    oblong: ["Oversized", "Wayfarer", "Borboleta", "Redondo"],
  };
  return map[faceShape] ?? ["Aviador", "Wayfarer", "Retangular"];
}
