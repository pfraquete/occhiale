// ============================================
// OCCHIALE - Product Recognition via AI Vision
// Analyzes eyewear product photos to automatically
// extract specs, generate descriptions, and categorize
// ============================================

import Anthropic from "@anthropic-ai/sdk";
import { isValidHttpUrl } from "@/shared/lib/utils/sanitize";

// ------------------------------------------
// Types
// ------------------------------------------

export interface ProductAISpecs {
  /** Formato da armação detectado */
  frameShape:
    | "redondo"
    | "quadrado"
    | "retangular"
    | "aviador"
    | "gatinho"
    | "oval"
    | "hexagonal"
    | "clubmaster"
    | null;
  /** Material da armação detectado */
  frameMaterial: "acetato" | "metal" | "titanio" | "misto" | "nylon" | null;
  /** Cor principal da armação */
  frameColor: string;
  /** Cores secundárias */
  secondaryColors: string[];
  /** Largura estimada da lente (mm) */
  lensWidth: number | null;
  /** Altura estimada da lente (mm) */
  lensHeight: number | null;
  /** Largura estimada da ponte (mm) */
  bridgeWidth: number | null;
  /** Comprimento estimado da haste (mm) */
  templeLength: number | null;
  /** Largura total estimada da armação (mm) */
  frameWidth: number | null;
  /** Peso estimado (g) */
  weight: number | null;
  /** Proteção UV */
  uvProtection: boolean;
  /** Lente polarizada */
  polarized: boolean;
  /** Formatos de rosto ideais */
  idealFaceShapes: ("oval" | "redondo" | "quadrado" | "coracao" | "oblongo")[];
  /** Gênero alvo */
  gender: "masculino" | "feminino" | "unissex" | "infantil";
  /** Categoria sugerida */
  suggestedCategory:
    | "oculos-grau"
    | "oculos-sol"
    | "lentes-contato"
    | "acessorios"
    | "infantil";
  /** Marca detectada (se visível) */
  detectedBrand: string | null;
  /** Modelo detectado (se visível) */
  detectedModel: string | null;
  /** Descrição SEO gerada automaticamente */
  generatedDescription: string;
  /** Tags para busca */
  searchTags: string[];
  /** Confiança geral da análise */
  confidence: "high" | "medium" | "low";
}

export interface ProductRecognitionResult {
  success: boolean;
  specs?: ProductAISpecs;
  error?: string;
}

// ------------------------------------------
// Constants
// ------------------------------------------

const MODEL = "claude-sonnet-4-20250514";

const PRODUCT_RECOGNITION_PROMPT = `Você é um sistema especializado em reconhecimento de produtos ópticos (óculos, armações, lentes).
Analise a foto do produto e extraia todas as informações possíveis para catalogação automática.

## O que analisar

### 1. Formato da armação (frameShape)
Classifique como um dos seguintes:
- "redondo": lentes circulares
- "quadrado": lentes quadradas com cantos definidos
- "retangular": lentes mais largas que altas, cantos suaves
- "aviador": formato gota, ponte dupla
- "gatinho": pontas superiores elevadas (cat-eye)
- "oval": lentes ovais
- "hexagonal": lentes com 6 lados
- "clubmaster": parte superior grossa, inferior fina (browline)
Se não for possível identificar, use null.

### 2. Material (frameMaterial)
- "acetato": plástico grosso, colorido, brilhante
- "metal": armação fina metálica
- "titanio": metal leve, geralmente fosco
- "misto": combinação de materiais
- "nylon": plástico fino e flexível

### 3. Medidas estimadas
Estime as medidas em milímetros baseado nas proporções da imagem:
- lensWidth: largura de cada lente (tipicamente 45-60mm)
- lensHeight: altura de cada lente (tipicamente 30-50mm)
- bridgeWidth: largura da ponte nasal (tipicamente 14-24mm)
- templeLength: comprimento da haste (tipicamente 130-150mm)
- frameWidth: largura total da armação (tipicamente 125-150mm)
- weight: peso estimado em gramas (acetato: 25-40g, metal: 15-25g, titânio: 10-20g)

### 4. Características
- uvProtection: true se for óculos de sol ou se houver indicação de UV
- polarized: true se houver indicação de lente polarizada
- gender: "masculino", "feminino", "unissex" ou "infantil"

### 5. Formatos de rosto ideais (idealFaceShapes)
Baseado no formato da armação, indique os formatos de rosto mais compatíveis:
- Redondo/oval → combina com rosto quadrado, oblongo
- Quadrado/retangular → combina com rosto redondo, oval
- Aviador → combina com rosto oval, quadrado, coracao
- Gatinho → combina com rosto oval, quadrado, coracao
- Hexagonal → combina com rosto oval, redondo
- Clubmaster → combina com rosto oval, redondo, coracao

### 6. Categoria sugerida
- "oculos-grau": se for armação sem lentes escuras ou com lentes transparentes
- "oculos-sol": se tiver lentes escuras/coloridas
- "infantil": se for claramente para crianças
- "acessorios": se for case, cordão, lenço, etc.

### 7. Marca e modelo
Se visível na armação (logo, nome gravado), identifique marca e modelo.

### 8. Descrição SEO
Gere uma descrição de 2-3 frases para o produto, otimizada para SEO, em português brasileiro.
Inclua: formato, material, cor, público-alvo, ocasião de uso.

### 9. Tags de busca
Liste 5-10 palavras-chave relevantes para busca (em português).

## Formato de Resposta
Responda APENAS com JSON válido (sem markdown, sem explicações):
{
  "frameShape": "aviador",
  "frameMaterial": "metal",
  "frameColor": "dourado",
  "secondaryColors": ["preto"],
  "lensWidth": 58,
  "lensHeight": 48,
  "bridgeWidth": 14,
  "templeLength": 135,
  "frameWidth": 140,
  "weight": 20,
  "uvProtection": true,
  "polarized": false,
  "idealFaceShapes": ["oval", "quadrado", "coracao"],
  "gender": "unissex",
  "suggestedCategory": "oculos-sol",
  "detectedBrand": "Ray-Ban",
  "detectedModel": "Aviator Classic RB3025",
  "generatedDescription": "Óculos de sol Ray-Ban Aviator Classic com armação dourada em metal e lentes verdes. Design atemporal unissex, ideal para uso diário e ocasiões ao ar livre. Proteção UV completa.",
  "searchTags": ["ray-ban", "aviador", "dourado", "metal", "unissex", "oculos-sol", "classico", "uv"],
  "confidence": "high"
}`;

// ------------------------------------------
// Singleton Client
// ------------------------------------------

let _productClient: Anthropic | null = null;

function getProductClient(): Anthropic {
  if (_productClient) return _productClient;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY");
  }

  _productClient = new Anthropic({ apiKey });
  return _productClient;
}

// ------------------------------------------
// Product Recognition
// ------------------------------------------

/**
 * Analyze a product photo to automatically extract specs,
 * generate description, and categorize the product.
 */
export async function analyzeProductPhoto(
  imageUrl: string
): Promise<ProductRecognitionResult> {
  if (!isValidHttpUrl(imageUrl)) {
    return {
      success: false,
      error: "URL da imagem inválida. Apenas URLs HTTP/HTTPS são aceitas.",
    };
  }

  let client: Anthropic;
  try {
    client = getProductClient();
  } catch {
    return {
      success: false,
      error: "API key não configurada para reconhecimento de produto.",
    };
  }

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: PRODUCT_RECOGNITION_PROMPT,
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
            text: "Analise esta foto de produto óptico e extraia todas as especificações, medidas, descrição e categorização. Responda apenas com o JSON.",
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text"
  );

  if (!textBlock) {
    return {
      success: false,
      error: "Não foi possível analisar a imagem do produto.",
    };
  }

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
      error:
        "Não foi possível interpretar os dados do produto. Tente outra foto.",
    };
  }

  const specs = validateProductSpecs(rawData);
  if (!specs) {
    return {
      success: false,
      error: "Os dados extraídos não são válidos. Tente uma foto mais clara.",
    };
  }

  return { success: true, specs };
}

/**
 * Analyze multiple product photos for a more comprehensive analysis.
 * Uses the first image as primary and others as supplementary.
 */
export async function analyzeProductPhotos(
  imageUrls: string[]
): Promise<ProductRecognitionResult> {
  if (imageUrls.length === 0) {
    return { success: false, error: "Nenhuma imagem fornecida." };
  }

  // Validate all URLs
  for (const url of imageUrls) {
    if (!isValidHttpUrl(url)) {
      return {
        success: false,
        error: `URL inválida: ${url}`,
      };
    }
  }

  let client: Anthropic;
  try {
    client = getProductClient();
  } catch {
    return {
      success: false,
      error: "API key não configurada para reconhecimento de produto.",
    };
  }

  // Build content array with all images
  const content: Anthropic.Messages.ContentBlockParam[] = [];

  for (const url of imageUrls.slice(0, 4)) {
    content.push({
      type: "image",
      source: { type: "url", url },
    });
  }

  content.push({
    type: "text",
    text: `Analise ${imageUrls.length > 1 ? "estas fotos" : "esta foto"} de produto óptico e extraia todas as especificações, medidas, descrição e categorização. Se houver múltiplas fotos, use todas para uma análise mais precisa (frente, lateral, detalhe). Responda apenas com o JSON.`,
  });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: PRODUCT_RECOGNITION_PROMPT,
    messages: [{ role: "user", content }],
  });

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text"
  );

  if (!textBlock) {
    return {
      success: false,
      error: "Não foi possível analisar as imagens do produto.",
    };
  }

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
      error: "Não foi possível interpretar os dados. Tente outras fotos.",
    };
  }

  const specs = validateProductSpecs(rawData);
  if (!specs) {
    return {
      success: false,
      error: "Os dados extraídos não são válidos. Tente fotos mais claras.",
    };
  }

  return { success: true, specs };
}

// ------------------------------------------
// Validation
// ------------------------------------------

const VALID_FRAME_SHAPES = [
  "redondo",
  "quadrado",
  "retangular",
  "aviador",
  "gatinho",
  "oval",
  "hexagonal",
  "clubmaster",
] as const;

const VALID_MATERIALS = [
  "acetato",
  "metal",
  "titanio",
  "misto",
  "nylon",
] as const;

const VALID_FACE_SHAPES = [
  "oval",
  "redondo",
  "quadrado",
  "coracao",
  "oblongo",
] as const;

const VALID_CATEGORIES = [
  "oculos-grau",
  "oculos-sol",
  "lentes-contato",
  "acessorios",
  "infantil",
] as const;

const VALID_GENDERS = ["masculino", "feminino", "unissex", "infantil"] as const;

function validateProductSpecs(
  data: Record<string, unknown>
): ProductAISpecs | null {
  // Frame shape
  const frameShape = VALID_FRAME_SHAPES.includes(
    data.frameShape as (typeof VALID_FRAME_SHAPES)[number]
  )
    ? (data.frameShape as ProductAISpecs["frameShape"])
    : null;

  // Material
  const frameMaterial = VALID_MATERIALS.includes(
    data.frameMaterial as (typeof VALID_MATERIALS)[number]
  )
    ? (data.frameMaterial as ProductAISpecs["frameMaterial"])
    : null;

  // Color
  const frameColor = typeof data.frameColor === "string" ? data.frameColor : "";

  // Secondary colors
  const secondaryColors = Array.isArray(data.secondaryColors)
    ? (data.secondaryColors as string[]).filter((c) => typeof c === "string")
    : [];

  // Numeric measurements with range validation
  const lensWidth = validateRange(data.lensWidth, 30, 75);
  const lensHeight = validateRange(data.lensHeight, 20, 60);
  const bridgeWidth = validateRange(data.bridgeWidth, 10, 30);
  const templeLength = validateRange(data.templeLength, 100, 160);
  const frameWidth = validateRange(data.frameWidth, 100, 170);
  const weight = validateRange(data.weight, 5, 80);

  // Booleans
  const uvProtection = data.uvProtection === true;
  const polarized = data.polarized === true;

  // Face shapes
  const idealFaceShapes = Array.isArray(data.idealFaceShapes)
    ? ((data.idealFaceShapes as string[]).filter((s) =>
        VALID_FACE_SHAPES.includes(s as (typeof VALID_FACE_SHAPES)[number])
      ) as ProductAISpecs["idealFaceShapes"])
    : [];

  // Gender
  const gender = VALID_GENDERS.includes(
    data.gender as (typeof VALID_GENDERS)[number]
  )
    ? (data.gender as ProductAISpecs["gender"])
    : "unissex";

  // Category
  const suggestedCategory = VALID_CATEGORIES.includes(
    data.suggestedCategory as (typeof VALID_CATEGORIES)[number]
  )
    ? (data.suggestedCategory as ProductAISpecs["suggestedCategory"])
    : "oculos-grau";

  // Brand and model
  const detectedBrand =
    typeof data.detectedBrand === "string" && data.detectedBrand.length > 0
      ? data.detectedBrand
      : null;
  const detectedModel =
    typeof data.detectedModel === "string" && data.detectedModel.length > 0
      ? data.detectedModel
      : null;

  // Description
  const generatedDescription =
    typeof data.generatedDescription === "string"
      ? data.generatedDescription
      : "";

  if (!generatedDescription) return null;

  // Tags
  const searchTags = Array.isArray(data.searchTags)
    ? (data.searchTags as string[])
        .filter((t) => typeof t === "string")
        .slice(0, 15)
    : [];

  // Confidence
  const confidence = ["high", "medium", "low"].includes(
    data.confidence as string
  )
    ? (data.confidence as ProductAISpecs["confidence"])
    : "low";

  return {
    frameShape,
    frameMaterial,
    frameColor,
    secondaryColors,
    lensWidth,
    lensHeight,
    bridgeWidth,
    templeLength,
    frameWidth,
    weight,
    uvProtection,
    polarized,
    idealFaceShapes,
    gender,
    suggestedCategory,
    detectedBrand,
    detectedModel,
    generatedDescription,
    searchTags,
    confidence,
  };
}

function validateRange(
  value: unknown,
  min: number,
  max: number
): number | null {
  const num = Number(value);
  if (isNaN(num) || num < min || num > max) return null;
  return Math.round(num * 10) / 10;
}
