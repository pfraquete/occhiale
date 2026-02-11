// ============================================
// OCCHIALE - AI Tools Registry
// Tool definitions for Claude API function calling
// ============================================

import type Anthropic from "@anthropic-ai/sdk";
import { executeSearchProducts } from "./search-products";
import { executeCreateQuote } from "./create-quote";
import { executeCustomerProfile } from "./customer-profile";
import { executeAnalyzePrescription } from "./analyze-prescription";
import { executeTrackOrder } from "./track-order";
import { executeEscalateToHuman } from "./escalate-to-human";
import { executeFaceMeasurement } from "./face-measurement";
import { executeRecommendFrames } from "./recommend-frames";
import { executeCalculateLens } from "./calculate-lens";

// ------------------------------------------
// Tool Definitions (sent to Claude API)
// ------------------------------------------

export const AI_TOOLS: Anthropic.Tool[] = [
  {
    name: "search_products",
    description:
      "Busca produtos no catálogo da loja. Use para encontrar óculos, lentes e acessórios por nome, marca, categoria ou faixa de preço.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Texto de busca (nome do produto, marca, modelo, etc.)",
        },
        category: {
          type: "string",
          enum: [
            "oculos-grau",
            "oculos-sol",
            "lentes-contato",
            "acessorios",
            "infantil",
          ],
          description: "Filtrar por categoria",
        },
        brand: {
          type: "string",
          description: "Filtrar por marca (ex: Ray-Ban, Oakley)",
        },
        maxPrice: {
          type: "number",
          description: "Preço máximo em reais (ex: 500 para até R$500)",
        },
        limit: {
          type: "number",
          description: "Número máximo de resultados (padrão: 5)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "create_quote",
    description:
      "Monta um orçamento com itens selecionados. Retorna o resumo com subtotal, frete e total.",
    input_schema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              productId: {
                type: "string",
                description: "ID do produto",
              },
              quantity: {
                type: "number",
                description: "Quantidade",
              },
            },
            required: ["productId", "quantity"],
          },
          description: "Lista de itens para o orçamento",
        },
      },
      required: ["items"],
    },
  },
  {
    name: "get_customer_profile",
    description:
      "Consulta o perfil do cliente pelo número de telefone. Retorna nome, histórico de compras e preferências.",
    input_schema: {
      type: "object",
      properties: {
        phone: {
          type: "string",
          description: "Número de telefone do cliente (ex: 5511999999999)",
        },
      },
      required: ["phone"],
    },
  },
  {
    name: "analyze_prescription",
    description:
      "Analisa uma foto de receita médica (prescrição óptica). Extrai os dados de grau (esfera, cilindro, eixo, adição, DNP) usando OCR com visão computacional.",
    input_schema: {
      type: "object",
      properties: {
        imageUrl: {
          type: "string",
          description: "URL da imagem da receita médica",
        },
      },
      required: ["imageUrl"],
    },
  },
  {
    name: "track_order",
    description: "Rastreia o status de um pedido pelo número do pedido.",
    input_schema: {
      type: "object",
      properties: {
        orderNumber: {
          type: "string",
          description: "Número do pedido (ex: OCC-202501-ABC123)",
        },
      },
      required: ["orderNumber"],
    },
  },
  {
    name: "escalate_to_human",
    description:
      "Transfere a conversa para atendimento humano. Use quando o cliente pede explicitamente, quando há reclamação grave, ou quando a IA não consegue resolver.",
    input_schema: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          description:
            "Motivo da transferência (ex: cliente solicitou, reclamação, problema técnico)",
        },
      },
      required: ["reason"],
    },
  },

  // =============================================
  // NEW: Face Measurement, Frame Recommendation,
  //      Lens Calibration
  // =============================================

  {
    name: "face_measurement",
    description:
      "Analisa uma foto do rosto do cliente para medir distância pupilar (DP), DNP, formato do rosto, largura facial e recomendar especificações ideais de armação. Use quando o cliente enviar uma foto do rosto ou pedir para medir/analisar o rosto.",
    input_schema: {
      type: "object",
      properties: {
        imageUrl: {
          type: "string",
          description: "URL da foto do rosto do cliente",
        },
      },
      required: ["imageUrl"],
    },
  },
  {
    name: "recommend_frames",
    description:
      "Recomenda armações do catálogo da loja baseado nas medidas faciais do cliente. Use APÓS obter as medidas com face_measurement. Cruza formato do rosto, DP, largura facial e ponte nasal com as especificações dos produtos para encontrar as melhores opções.",
    input_schema: {
      type: "object",
      properties: {
        measurements: {
          type: "object",
          description:
            "Objeto completo de medidas faciais retornado por face_measurement",
          properties: {
            pd: { type: "number", description: "Distância pupilar (mm)" },
            dnpRight: { type: "number", description: "DNP direito (mm)" },
            dnpLeft: { type: "number", description: "DNP esquerdo (mm)" },
            faceWidth: { type: "number", description: "Largura do rosto (mm)" },
            faceShape: {
              type: "string",
              enum: ["oval", "round", "square", "heart", "oblong"],
              description: "Formato do rosto",
            },
            bridgeWidth: {
              type: "number",
              description: "Largura da ponte nasal (mm)",
            },
            templeLength: {
              type: "number",
              description: "Comprimento da têmpora (mm)",
            },
          },
          required: ["pd", "faceWidth", "faceShape"],
        },
        pd: {
          type: "number",
          description:
            "Alternativa: fornecer apenas a DP se não tiver o objeto completo",
        },
        faceShape: {
          type: "string",
          enum: ["oval", "round", "square", "heart", "oblong"],
          description: "Formato do rosto (se não usar measurements)",
        },
        faceWidth: {
          type: "number",
          description: "Largura do rosto em mm (se não usar measurements)",
        },
      },
      required: [],
    },
  },
  {
    name: "calculate_lens_calibration",
    description:
      "Calcula os parâmetros de calibragem e montagem das lentes a partir da receita (prescrição), medidas faciais e especificações da armação escolhida. Retorna: tipo de lente, índice de refração, espessura estimada, descentração, prisma induzido, tratamentos recomendados e relatório para o laboratório. Use quando o cliente tiver receita + medidas + armação escolhida.",
    input_schema: {
      type: "object",
      properties: {
        prescription: {
          type: "object",
          description: "Receita completa (pode vir de analyze_prescription)",
          properties: {
            od: {
              type: "object",
              properties: {
                sphere: { type: "number", description: "Esférico OD" },
                cylinder: { type: "number", description: "Cilíndrico OD" },
                axis: { type: "number", description: "Eixo OD (0-180)" },
                addition: { type: "number", description: "Adição OD" },
              },
              required: ["sphere"],
            },
            os: {
              type: "object",
              properties: {
                sphere: { type: "number", description: "Esférico OE" },
                cylinder: { type: "number", description: "Cilíndrico OE" },
                axis: { type: "number", description: "Eixo OE (0-180)" },
                addition: { type: "number", description: "Adição OE" },
              },
              required: ["sphere"],
            },
          },
          required: ["od", "os"],
        },
        odSphere: {
          type: "number",
          description:
            "Alternativa: esférico OD direto (se não usar prescription)",
        },
        osSphere: {
          type: "number",
          description: "Alternativa: esférico OE direto",
        },
        odCylinder: { type: "number", description: "Cilíndrico OD" },
        osCylinder: { type: "number", description: "Cilíndrico OE" },
        odAxis: { type: "number", description: "Eixo OD" },
        osAxis: { type: "number", description: "Eixo OE" },
        odAddition: { type: "number", description: "Adição OD" },
        osAddition: { type: "number", description: "Adição OE" },
        face: {
          type: "object",
          description: "Medidas faciais (pode vir de face_measurement)",
          properties: {
            pd: { type: "number", description: "DP total (mm)" },
            dnpRight: { type: "number", description: "DNP direito (mm)" },
            dnpLeft: { type: "number", description: "DNP esquerdo (mm)" },
            ocHeight: { type: "number", description: "Altura pupilar (mm)" },
          },
          required: ["pd", "dnpRight", "dnpLeft"],
        },
        pd: { type: "number", description: "Alternativa: DP direto" },
        dnpRight: { type: "number", description: "DNP direito" },
        dnpLeft: { type: "number", description: "DNP esquerdo" },
        frame: {
          type: "object",
          description: "Especificações da armação escolhida",
          properties: {
            lensWidth: { type: "number", description: "Largura da lente (mm)" },
            lensHeight: { type: "number", description: "Altura da lente (mm)" },
            bridgeWidth: { type: "number", description: "Ponte (mm)" },
            templeLength: { type: "number", description: "Haste (mm)" },
          },
          required: ["lensWidth", "lensHeight", "bridgeWidth"],
        },
        lensWidth: {
          type: "number",
          description: "Alternativa: largura da lente",
        },
        lensHeight: { type: "number", description: "Altura da lente" },
        bridgeWidth: { type: "number", description: "Ponte" },
        templeLength: { type: "number", description: "Haste" },
      },
      required: [],
    },
  },
];

// ------------------------------------------
// Tool Execution Router
// ------------------------------------------

export interface ToolContext {
  storeId: string;
  conversationId: string;
  phone: string;
}

export async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  context: ToolContext
): Promise<string> {
  switch (toolName) {
    case "search_products":
      return executeSearchProducts(toolInput, context);

    case "create_quote":
      return executeCreateQuote(toolInput, context);

    case "get_customer_profile":
      return executeCustomerProfile(toolInput, context);

    case "analyze_prescription":
      return executeAnalyzePrescription(toolInput, context);

    case "track_order":
      return executeTrackOrder(toolInput, context);

    case "escalate_to_human":
      return executeEscalateToHuman(toolInput, context);

    case "face_measurement":
      return executeFaceMeasurement(toolInput, context);

    case "recommend_frames":
      return executeRecommendFrames(toolInput, context);

    case "calculate_lens_calibration":
      return executeCalculateLens(toolInput, context);

    default:
      return JSON.stringify({
        error: `Unknown tool: ${toolName}`,
      });
  }
}
