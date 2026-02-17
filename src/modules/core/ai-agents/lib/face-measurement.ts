// ============================================
// OCCHIALE - Face Measurement via AI Vision
// Analyzes face photos to extract optical measurements
// and recommend compatible frames
// ============================================

import Anthropic from "@anthropic-ai/sdk";
import { isValidHttpUrl } from "@/shared/lib/utils/sanitize";

// ------------------------------------------
// Types
// ------------------------------------------

export interface FaceMeasurements {
  /** Distância pupilar total (mm) */
  pd: number;
  /** DNP olho direito (mm) */
  dnpRight: number;
  /** DNP olho esquerdo (mm) */
  dnpLeft: number;
  /** Largura total do rosto (mm) */
  faceWidth: number;
  /** Formato do rosto detectado */
  faceShape: "oval" | "round" | "square" | "heart" | "oblong";
  /** Largura da ponte nasal estimada (mm) */
  bridgeWidth: number;
  /** Comprimento da têmpora estimado (mm) */
  templeLength: number;
  /** Se foi usado cartão de referência */
  hasReferenceCard: boolean;
  /** Confiança geral da medição */
  confidence: "high" | "medium" | "low";
  /** Notas adicionais da análise */
  notes: string;
}

export interface FaceMeasurementResult {
  success: boolean;
  measurements?: FaceMeasurements;
  warnings: string[];
  error?: string;
}

export interface FrameRecommendation {
  productId: string;
  name: string;
  brand: string;
  price: number;
  images: string[];
  compatibility: {
    /** Score de 0 a 100 */
    score: number;
    /** Razões da compatibilidade */
    reasons: string[];
    /** Alertas (ex: ponte muito larga) */
    warnings: string[];
  };
}

export interface FrameMatchResult {
  success: boolean;
  recommendations: FrameRecommendation[];
  measurements: FaceMeasurements;
  error?: string;
}

// ------------------------------------------
// Constants
// ------------------------------------------

const MODEL = "claude-sonnet-4-20250514";

/** Dimensões do cartão de crédito padrão ISO/IEC 7810 em mm */
const CREDIT_CARD_WIDTH_MM = 85.6;

const FACE_MEASUREMENT_PROMPT = `Você é um sistema especializado em medições faciais para ótica.
Analise a foto do rosto da pessoa e extraia medições precisas para recomendação de armações de óculos.

## Instruções de Medição

### Com Cartão de Referência
Se a pessoa estiver segurando um cartão de crédito/débito (85.6mm de largura) na testa ou próximo ao rosto:
- Use o cartão como referência de escala para calcular as medidas em milímetros
- A precisão esperada é de ±1mm

### Sem Cartão de Referência
Se não houver cartão de referência:
- Use proporções faciais médias para estimar as medidas
- A largura média da íris humana é ~11.7mm — use como referência
- A precisão será menor (±2-3mm)
- Indique confidence: "low" ou "medium"

## Medidas a Extrair

1. **PD (Distância Pupilar)**: distância horizontal entre os centros das duas pupilas
   - Adultos: tipicamente 50-75mm
   - Crianças: 40-55mm

2. **DNP Direita**: distância do centro da pupila direita ao centro do nariz
3. **DNP Esquerda**: distância do centro da pupila esquerda ao centro do nariz
   - DNP direita + DNP esquerda ≈ PD (pode haver assimetria de 1-2mm)

4. **Largura do Rosto**: distância horizontal na altura das têmporas
   - Adultos: tipicamente 130-160mm

5. **Formato do Rosto**: classifique como um dos seguintes:
   - "oval": comprimento maior que largura, queixo arredondado
   - "round": largura e comprimento similares, bochechas cheias
   - "square": mandíbula forte e angular, testa larga
   - "heart": testa larga, queixo pontudo
   - "oblong": rosto longo e estreito

6. **Largura da Ponte Nasal**: largura do nariz entre os olhos
   - Tipicamente 14-24mm

7. **Comprimento da Têmpora**: distância estimada da frente do rosto até atrás da orelha
   - Tipicamente 130-150mm

## Formato de Resposta
Responda APENAS com JSON válido (sem markdown, sem explicações):
{
  "pd": 63,
  "dnpRight": 32,
  "dnpLeft": 31,
  "faceWidth": 142,
  "faceShape": "oval",
  "bridgeWidth": 18,
  "templeLength": 140,
  "hasReferenceCard": true,
  "confidence": "high",
  "notes": "Medições baseadas no cartão de referência visível na testa"
}`;

// ------------------------------------------
// Singleton Client
// ------------------------------------------

let _faceClient: Anthropic | null = null;

function getFaceClient(): Anthropic {
  if (_faceClient) return _faceClient;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY");
  }

  _faceClient = new Anthropic({ apiKey });
  return _faceClient;
}

// ------------------------------------------
// Face Measurement
// ------------------------------------------

/**
 * Analyze a face photo to extract optical measurements.
 * The photo should be a frontal face photo, ideally with a credit card
 * held at the forehead for scale reference.
 */
export async function analyzeFacePhoto(
  imageUrl: string
): Promise<FaceMeasurementResult> {
  // Validate URL
  if (!isValidHttpUrl(imageUrl)) {
    return {
      success: false,
      warnings: [],
      error: "URL da imagem inválida. Apenas URLs HTTP/HTTPS são aceitas.",
    };
  }

  let client: Anthropic;
  try {
    client = getFaceClient();
  } catch {
    return {
      success: false,
      warnings: [],
      error: "API key não configurada para análise facial.",
    };
  }

  // Call Claude Vision
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: FACE_MEASUREMENT_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "url",
              url: imageUrl,
            },
          },
          {
            type: "text",
            text: "Analise esta foto do rosto e extraia todas as medidas ópticas. Se houver um cartão de crédito visível, use-o como referência de escala. Responda apenas com o JSON.",
          },
        ],
      },
    ],
  });

  // Extract text response
  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text"
  );

  if (!textBlock) {
    return {
      success: false,
      warnings: [],
      error: "Não foi possível analisar a imagem do rosto.",
    };
  }

  // Parse JSON
  let rawData: Record<string, unknown>;
  try {
    const jsonText = textBlock.text
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    rawData = JSON.parse(jsonText) as Record<string, unknown>;
  } catch {
    return {
      success: false,
      warnings: [],
      error:
        "Não foi possível interpretar as medidas. Tente enviar uma foto frontal mais clara.",
    };
  }

  // Validate ranges
  const warnings: string[] = [];
  const measurements = validateMeasurements(rawData, warnings);

  if (!measurements) {
    return {
      success: false,
      warnings,
      error: "As medidas extraídas estão fora dos limites aceitáveis.",
    };
  }

  // Add warnings based on confidence
  if (!measurements.hasReferenceCard) {
    warnings.push(
      "📏 Nenhum cartão de referência detectado. As medidas são estimativas baseadas em proporções faciais. Para maior precisão, envie uma nova foto segurando um cartão de crédito na testa."
    );
  }

  if (measurements.confidence === "low") {
    warnings.push(
      "⚠️ Baixa confiança nas medidas. A foto pode estar em ângulo, com pouca luz, ou muito distante."
    );
  }

  // Check PD vs DNP consistency
  const dnpSum = measurements.dnpRight + measurements.dnpLeft;
  if (Math.abs(dnpSum - measurements.pd) > 3) {
    warnings.push(
      "⚠️ Inconsistência entre DP e DNP. Recomendamos confirmar as medidas presencialmente."
    );
  }

  return {
    success: true,
    measurements,
    warnings,
  };
}

// ------------------------------------------
// Validation
// ------------------------------------------

function validateMeasurements(
  data: Record<string, unknown>,
  warnings: string[]
): FaceMeasurements | null {
  const pd = Number(data.pd);
  const dnpRight = Number(data.dnpRight);
  const dnpLeft = Number(data.dnpLeft);
  const faceWidth = Number(data.faceWidth);
  const bridgeWidth = Number(data.bridgeWidth);
  const templeLength = Number(data.templeLength);

  // Validate PD range
  if (isNaN(pd) || pd < 40 || pd > 80) {
    warnings.push("DP fora do intervalo aceitável (40-80mm).");
    return null;
  }

  // Validate DNP range
  if (isNaN(dnpRight) || dnpRight < 20 || dnpRight > 42) {
    warnings.push("DNP direita fora do intervalo aceitável (20-42mm).");
    return null;
  }
  if (isNaN(dnpLeft) || dnpLeft < 20 || dnpLeft > 42) {
    warnings.push("DNP esquerda fora do intervalo aceitável (20-42mm).");
    return null;
  }

  // Validate face width
  if (isNaN(faceWidth) || faceWidth < 100 || faceWidth > 180) {
    warnings.push("Largura do rosto fora do intervalo aceitável (100-180mm).");
    return null;
  }

  // Validate face shape
  const validShapes = ["oval", "round", "square", "heart", "oblong"] as const;
  const faceShape = String(data.faceShape) as (typeof validShapes)[number];
  if (!validShapes.includes(faceShape)) {
    warnings.push("Formato do rosto não reconhecido.");
    return null;
  }

  // Validate confidence
  const validConfidence = ["high", "medium", "low"] as const;
  const confidence = String(
    data.confidence
  ) as (typeof validConfidence)[number];
  if (!validConfidence.includes(confidence)) {
    return null;
  }

  return {
    pd: Math.round(pd * 10) / 10,
    dnpRight: Math.round(dnpRight * 10) / 10,
    dnpLeft: Math.round(dnpLeft * 10) / 10,
    faceWidth: Math.round(faceWidth),
    faceShape,
    bridgeWidth: isNaN(bridgeWidth) ? 18 : Math.round(bridgeWidth),
    templeLength: isNaN(templeLength) ? 140 : Math.round(templeLength),
    hasReferenceCard: Boolean(data.hasReferenceCard),
    confidence,
    notes: String(data.notes ?? ""),
  };
}

// ------------------------------------------
// Frame Matching
// ------------------------------------------

/** Formatos de armação recomendados por formato de rosto */
const FACE_SHAPE_FRAME_MAP: Record<string, string[]> = {
  oval: [
    "aviador",
    "wayfarer",
    "retangular",
    "redondo",
    "cat-eye",
    "quadrado",
    "borboleta",
  ],
  round: ["retangular", "quadrado", "wayfarer", "angular", "geométrico"],
  square: ["redondo", "oval", "aviador", "cat-eye", "sem-aro"],
  heart: ["aviador", "cat-eye", "sem-aro", "redondo", "oval"],
  oblong: [
    "oversized",
    "wayfarer",
    "borboleta",
    "redondo",
    "aviador",
    "quadrado",
  ],
};

interface ProductSpecs {
  frame_shape?: string;
  face_shapes?: string[];
  bridge?: number;
  temple_length?: number;
  lens_width?: number;
  material?: string;
  gender?: string;
}

interface ProductForMatching {
  id: string;
  name: string;
  brand: string;
  price: number;
  images: string[];
  specs: ProductSpecs;
}

/**
 * Match face measurements against a list of products and return
 * ranked recommendations.
 */
export function matchFramesToFace(
  measurements: FaceMeasurements,
  products: ProductForMatching[]
): FrameRecommendation[] {
  const recommendations: FrameRecommendation[] = [];

  for (const product of products) {
    const specs = product.specs;
    let score = 50; // Base score
    const reasons: string[] = [];
    const matchWarnings: string[] = [];

    // 1. Face shape compatibility (0-30 points)
    const recommendedShapes =
      FACE_SHAPE_FRAME_MAP[measurements.faceShape] ?? [];
    if (specs.face_shapes?.includes(measurements.faceShape)) {
      score += 30;
      reasons.push(`Armação recomendada para rosto ${measurements.faceShape}`);
    } else if (
      specs.frame_shape &&
      recommendedShapes.some((s) =>
        specs.frame_shape!.toLowerCase().includes(s)
      )
    ) {
      score += 20;
      reasons.push(
        `Formato ${specs.frame_shape} combina com rosto ${measurements.faceShape}`
      );
    }

    // 2. Frame width vs face width (0-25 points)
    if (specs.lens_width && specs.bridge) {
      const frameWidth = specs.lens_width * 2 + specs.bridge;
      const widthDiff = Math.abs(frameWidth - measurements.faceWidth);

      if (widthDiff <= 5) {
        score += 25;
        reasons.push("Largura da armação perfeita para seu rosto");
      } else if (widthDiff <= 10) {
        score += 15;
        reasons.push("Largura da armação boa para seu rosto");
      } else if (widthDiff <= 15) {
        score += 5;
        matchWarnings.push(
          `Armação ${frameWidth > measurements.faceWidth ? "um pouco larga" : "um pouco estreita"} para seu rosto`
        );
      } else {
        score -= 10;
        matchWarnings.push(
          `Armação ${frameWidth > measurements.faceWidth ? "muito larga" : "muito estreita"} para seu rosto`
        );
      }
    }

    // 3. Bridge width compatibility (0-15 points)
    if (specs.bridge) {
      const bridgeDiff = Math.abs(specs.bridge - measurements.bridgeWidth);
      if (bridgeDiff <= 2) {
        score += 15;
        reasons.push("Ponte nasal com encaixe perfeito");
      } else if (bridgeDiff <= 4) {
        score += 8;
      } else {
        matchWarnings.push(
          `Ponte ${specs.bridge > measurements.bridgeWidth ? "um pouco larga" : "um pouco estreita"} para seu nariz`
        );
      }
    }

    // 4. Temple length compatibility (0-10 points)
    if (specs.temple_length) {
      const templeDiff = Math.abs(
        specs.temple_length - measurements.templeLength
      );
      if (templeDiff <= 5) {
        score += 10;
        reasons.push("Comprimento das hastes ideal");
      } else if (templeDiff <= 10) {
        score += 5;
      } else {
        matchWarnings.push("Hastes podem não ter o comprimento ideal");
      }
    }

    // 5. PD vs lens width check (decentration)
    if (specs.lens_width && specs.bridge) {
      const framePD = specs.lens_width + specs.bridge;
      const decentration = Math.abs(framePD - measurements.pd) / 2;
      if (decentration > 5) {
        score -= 15;
        matchWarnings.push(
          `Descentração alta (${decentration.toFixed(1)}mm) — lentes podem ficar mais grossas`
        );
      } else if (decentration <= 2) {
        score += 10;
        reasons.push("Excelente alinhamento óptico (baixa descentração)");
      }
    }

    // Clamp score
    score = Math.max(0, Math.min(100, score));

    recommendations.push({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      images: product.images,
      compatibility: {
        score,
        reasons,
        warnings: matchWarnings,
      },
    });
  }

  // Sort by score descending
  recommendations.sort((a, b) => b.compatibility.score - a.compatibility.score);

  return recommendations;
}
