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

    default:
      return JSON.stringify({
        error: `Unknown tool: ${toolName}`,
      });
  }
}
