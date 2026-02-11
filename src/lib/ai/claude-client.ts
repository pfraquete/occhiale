// ============================================
// OCCHIALE - Claude AI Client
// Wrapper for Anthropic SDK with tool use loop
// ============================================

import Anthropic from "@anthropic-ai/sdk";
import { AI_TOOLS, executeTool, type ToolContext } from "./tools/index";
import { buildSystemPrompt } from "./system-prompt";

// ------------------------------------------
// Types
// ------------------------------------------

export interface ConversationMessage {
  role: "customer" | "assistant" | "system";
  content: string;
  media_url: string | null;
  media_type: string | null;
  tool_calls: Record<string, unknown>[] | null;
}

export interface ProcessMessageParams {
  conversationId: string;
  storeId: string;
  phone: string;
  storeName: string;
  storeSlug: string;
  storeCategories: string[];
  whatsappNumber?: string;
  messageText?: string;
  mediaUrl?: string;
  mediaType?: string;
  history: ConversationMessage[];
}

export interface ProcessMessageResult {
  responseText: string;
  toolsUsed: Record<string, unknown>[];
  agentState?: string;
}

// ------------------------------------------
// Constants
// ------------------------------------------

const MAX_TOOL_ITERATIONS = 5;
const MODEL = "claude-sonnet-4-20250514";
// FIX: Increased from 1024 to 2048 for more complete responses
const MAX_TOKENS = 2048;

// ------------------------------------------
// Client
// ------------------------------------------

let _anthropic: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (_anthropic) return _anthropic;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY environment variable");
  }

  _anthropic = new Anthropic({ apiKey });
  return _anthropic;
}

// ------------------------------------------
// Process Message
// ------------------------------------------

/**
 * Process an incoming WhatsApp message through Claude AI.
 * Handles the full tool use loop:
 * 1. Build messages from conversation history
 * 2. Call Claude with system prompt + tools
 * 3. If Claude wants to use a tool, execute it and loop
 * 4. Return final text response
 */
export async function processMessage(
  params: ProcessMessageParams
): Promise<ProcessMessageResult> {
  const client = getAnthropicClient();
  const toolsUsed: Record<string, unknown>[] = [];

  // Build system prompt
  const systemPrompt = buildSystemPrompt({
    storeName: params.storeName,
    storeSlug: params.storeSlug,
    categories: params.storeCategories,
    whatsappNumber: params.whatsappNumber,
  });

  // Build messages from conversation history
  const messages = buildMessagesFromHistory(params.history, {
    messageText: params.messageText,
    mediaUrl: params.mediaUrl,
    mediaType: params.mediaType,
  });

  const toolContext: ToolContext = {
    storeId: params.storeId,
    storeSlug: params.storeSlug,
    conversationId: params.conversationId,
    phone: params.phone,
  };

  // Tool use loop
  let currentMessages = messages;

  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: currentMessages,
      tools: AI_TOOLS,
    });

    // Check if Claude wants to use a tool
    if (response.stop_reason === "tool_use") {
      // Extract tool use blocks
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
      );

      if (toolUseBlocks.length === 0) break;

      // Add assistant response to messages
      currentMessages = [
        ...currentMessages,
        { role: "assistant" as const, content: response.content },
      ];

      // Execute each tool and add results
      for (const toolUse of toolUseBlocks) {
        console.log(
          `AI Tool: ${toolUse.name}`,
          JSON.stringify(toolUse.input).substring(0, 200)
        );

        const result = await executeTool(
          toolUse.name,
          toolUse.input as Record<string, unknown>,
          toolContext
        );

        // FIX: Safely parse JSON — tool results may not always be valid JSON
        let parsedOutput: unknown;
        try {
          parsedOutput = JSON.parse(result);
        } catch {
          parsedOutput = { raw: result };
        }

        toolsUsed.push({
          tool: toolUse.name,
          input: toolUse.input,
          output: parsedOutput,
        });

        currentMessages = [
          ...currentMessages,
          {
            role: "user" as const,
            content: [
              {
                type: "tool_result" as const,
                tool_use_id: toolUse.id,
                content: result,
              },
            ],
          },
        ];
      }

      // Continue loop — Claude will process tool results
      continue;
    }

    // Claude returned a text response (no more tools needed)
    const textBlocks = response.content.filter(
      (block): block is Anthropic.TextBlock => block.type === "text"
    );

    const responseText = textBlocks
      .map((block) => block.text)
      .join("\n")
      .trim();

    return {
      responseText:
        responseText ||
        "Desculpe, não consegui formular uma resposta. Posso ajudar de outra forma?",
      toolsUsed,
    };
  }

  // Max iterations reached
  return {
    responseText:
      "Desculpe, estou tendo dificuldade em processar sua solicitação. Vou transferir para um atendente humano.",
    toolsUsed,
    agentState: "human_takeover",
  };
}

// ------------------------------------------
// Helpers
// ------------------------------------------

/**
 * Build Anthropic messages array from conversation history.
 * Maps inbound/outbound to user/assistant roles.
 * Includes the current (new) message at the end.
 */
function buildMessagesFromHistory(
  history: ConversationMessage[],
  currentMessage: {
    messageText?: string;
    mediaUrl?: string;
    mediaType?: string;
  }
): Anthropic.MessageParam[] {
  const messages: Anthropic.MessageParam[] = [];

  // Convert history to messages
  // DB roles: customer → user, assistant → assistant, system → ignored
  for (const msg of history) {
    if (msg.role === "system") continue;

    const anthropicRole: "user" | "assistant" =
      msg.role === "customer" ? "user" : "assistant";

    if (msg.content) {
      messages.push({
        role: anthropicRole,
        content: msg.content,
      });
    }
  }

  // Add current message
  if (currentMessage.mediaUrl && currentMessage.mediaType === "image") {
    // Image message — use vision
    const content: Anthropic.ContentBlockParam[] = [];

    content.push({
      type: "image",
      source: {
        type: "url",
        url: currentMessage.mediaUrl,
      },
    });

    if (currentMessage.messageText) {
      content.push({
        type: "text",
        text: currentMessage.messageText,
      });
    } else {
      content.push({
        type: "text",
        text: "O cliente enviou esta imagem. Analise o conteúdo e responda adequadamente. Se for uma receita médica, use a ferramenta analyze_prescription.",
      });
    }

    messages.push({ role: "user", content });
  } else if (currentMessage.messageText) {
    messages.push({
      role: "user",
      content: currentMessage.messageText,
    });
  }

  // Ensure messages alternate properly (merge consecutive same-role)
  return mergeConsecutiveMessages(messages);
}

/**
 * Merge consecutive messages from the same role.
 * Claude API requires alternating user/assistant messages.
 *
 * FIX: Preserves image content blocks when merging (previously dropped them).
 */
function mergeConsecutiveMessages(
  messages: Anthropic.MessageParam[]
): Anthropic.MessageParam[] {
  if (messages.length === 0) return [];

  const merged: Anthropic.MessageParam[] = [];

  for (const msg of messages) {
    const last = merged[merged.length - 1];

    if (last && last.role === msg.role) {
      // Merge content blocks — preserve all block types (text + image)
      const lastBlocks: Anthropic.ContentBlockParam[] =
        typeof last.content === "string"
          ? [{ type: "text" as const, text: last.content }]
          : (last.content as Anthropic.ContentBlockParam[]);

      const msgBlocks: Anthropic.ContentBlockParam[] =
        typeof msg.content === "string"
          ? [{ type: "text" as const, text: msg.content }]
          : (msg.content as Anthropic.ContentBlockParam[]);

      last.content = [...lastBlocks, ...msgBlocks];
    } else {
      merged.push({ ...msg });
    }
  }

  // Ensure first message is from user
  if (merged.length > 0 && merged[0]?.role !== "user") {
    merged.unshift({ role: "user", content: "Olá" });
  }

  return merged;
}
