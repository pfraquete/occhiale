// ============================================
// OCCHIALE - Prescription OCR via Claude Vision
// Analyzes photos of optical prescriptions
// ============================================

import Anthropic from "@anthropic-ai/sdk";
import {
  ocrPrescriptionResultSchema,
  isPrescriptionExpired,
  isHighComplexity,
} from "@/lib/validations/prescription";
import { isValidHttpUrl } from "@/lib/utils/sanitize";

// ------------------------------------------
// Types
// ------------------------------------------

export interface PrescriptionOcrResult {
  success: boolean;
  data?: {
    od: { sphere: number; cylinder: number; axis: number };
    os: { sphere: number; cylinder: number; axis: number };
    addition?: number | null;
    dnp?: number | null;
    doctorName?: string | null;
    doctorCrm?: string | null;
    date?: string | null;
    confidence: "high" | "medium" | "low";
  };
  warnings: string[];
  error?: string;
}

// ------------------------------------------
// Constants
// ------------------------------------------

const MODEL = "claude-sonnet-4-20250514";

const OCR_SYSTEM_PROMPT = `Você é um sistema especializado em extrair dados de receitas ópticas (prescrições de óculos) de imagens.

Analise a imagem da receita e extraia os seguintes dados:

## Dados a Extrair
- **OD (Olho Direito)**: esfera, cilindro, eixo
- **OS (Olho Esquerdo)**: esfera, cilindro, eixo
- **Adição** (se presente — para lentes multifocais/bifocais)
- **DNP** (Distância Naso-Pupilar, em mm)
- **Nome do médico**
- **CRM do médico**
- **Data da receita**

## Regras de Interpretação
- Esfera (SPH/ESF): valores de -20.00 a +20.00, múltiplos de 0.25
- Cilindro (CYL/CIL): valores de -10.00 a 0.00, múltiplos de 0.25
- Eixo: 0 a 180 graus, número inteiro
- Adição (ADD): 0.50 a 4.00, múltiplos de 0.25
- DNP: 45 a 80mm
- Se o cilindro for positivo, converta para negativo (transposição)
- "Plano" ou "Pl" = 0.00
- Se um campo não for legível, use null

## Formato de Resposta
Responda APENAS com um JSON válido (sem markdown, sem explicações):
{
  "od": { "sphere": 0.00, "cylinder": 0.00, "axis": 0 },
  "os": { "sphere": 0.00, "cylinder": 0.00, "axis": 0 },
  "addition": null,
  "dnp": null,
  "doctorName": null,
  "doctorCrm": null,
  "date": null,
  "confidence": "high|medium|low",
  "notes": "observações sobre legibilidade ou dados incertos"
}`;

// ------------------------------------------
// Singleton Client
// ------------------------------------------

// FIX: Reuse singleton Anthropic client instead of creating a new one per call
let _ocrClient: Anthropic | null = null;

function getOcrClient(): Anthropic {
  if (_ocrClient) return _ocrClient;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY");
  }

  _ocrClient = new Anthropic({ apiKey });
  return _ocrClient;
}

// ------------------------------------------
// Main Function
// ------------------------------------------

/**
 * Analyze a prescription image using Claude Vision.
 * Returns structured prescription data or error.
 */
export async function analyzePrescriptionImage(
  imageUrl: string
): Promise<PrescriptionOcrResult> {
  // FIX: Validate URL to prevent SSRF attacks
  if (!isValidHttpUrl(imageUrl)) {
    return {
      success: false,
      warnings: [],
      error: "URL da imagem inválida. Apenas URLs HTTP/HTTPS são aceitas.",
    };
  }

  let client: Anthropic;
  try {
    client = getOcrClient();
  } catch {
    return {
      success: false,
      warnings: [],
      error: "API key não configurada para análise de receitas.",
    };
  }

  // Call Claude Vision
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: OCR_SYSTEM_PROMPT,
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
            text: "Analise esta receita óptica e extraia todos os dados. Responda apenas com o JSON.",
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
      error: "Não foi possível analisar a imagem.",
    };
  }

  // Parse JSON from response
  let rawData: unknown;
  try {
    // Claude might wrap in ```json blocks, strip them
    const jsonText = textBlock.text
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    rawData = JSON.parse(jsonText);
  } catch {
    return {
      success: false,
      warnings: [],
      error:
        "Não foi possível interpretar os dados da receita. A imagem pode estar borrada.",
    };
  }

  // Validate with Zod
  const parsed = ocrPrescriptionResultSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      warnings: [],
      error: `Dados extraídos são inválidos: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
    };
  }

  const data = parsed.data;
  const warnings: string[] = [];

  // Check prescription expiration
  if (data.date && isPrescriptionExpired(data.date)) {
    warnings.push(
      "⚠️ Esta receita pode estar vencida (mais de 1 ano). Recomende ao cliente consultar o oftalmologista."
    );
  }

  // Check high complexity
  if (isHighComplexity(data.od, data.os)) {
    warnings.push(
      "⚠️ Grau alto detectado. Recomende lentes de alto índice para melhor estética e conforto."
    );
  }

  // Check low confidence
  if (data.confidence === "low") {
    warnings.push(
      "⚠️ Baixa confiança na leitura. Confirme os valores com o cliente antes de prosseguir."
    );
  }

  // Check missing DNP
  if (!data.dnp) {
    warnings.push(
      "ℹ️ DNP não encontrada na receita. Será necessário medir na loja ou usar valor padrão."
    );
  }

  return {
    success: true,
    data: {
      od: data.od,
      os: data.os,
      addition: data.addition,
      dnp: data.dnp,
      doctorName: data.doctorName,
      doctorCrm: data.doctorCrm,
      date: data.date,
      confidence: data.confidence,
    },
    warnings,
  };
}
