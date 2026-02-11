// ============================================
// OCCHIALE - WhatsApp Validation Schemas
// Zod schemas for webhook payloads and messages
// ============================================

import { z } from "zod";

// === Webhook Payload ===

export const evolutionMessageKeySchema = z.object({
  remoteJid: z.string(),
  fromMe: z.boolean(),
  id: z.string(),
  participant: z.string().optional(),
});

export const evolutionWebhookDataSchema = z.object({
  key: evolutionMessageKeySchema,
  pushName: z.string().optional(),
  message: z
    .object({
      conversation: z.string().optional(),
      extendedTextMessage: z
        .object({
          text: z.string(),
        })
        .optional(),
      imageMessage: z
        .object({
          url: z.string(),
          mimetype: z.string(),
          caption: z.string().optional(),
        })
        .optional(),
      audioMessage: z
        .object({
          url: z.string(),
          mimetype: z.string(),
          seconds: z.number(),
        })
        .optional(),
      documentMessage: z
        .object({
          url: z.string(),
          mimetype: z.string(),
          title: z.string().optional(),
          fileName: z.string().optional(),
        })
        .optional(),
      stickerMessage: z
        .object({
          url: z.string(),
          mimetype: z.string(),
        })
        .optional(),
    })
    .optional(),
  messageType: z.string().optional(),
  messageTimestamp: z.number(),
});

export const evolutionWebhookPayloadSchema = z.object({
  event: z.string(),
  instance: z.string(),
  data: evolutionWebhookDataSchema,
  destination: z.string().optional(),
  date_time: z.string().optional(),
  server_url: z.string().optional(),
  apikey: z.string().optional(),
});

// === AI Chat Request ===

export const aiChatRequestSchema = z.object({
  conversationId: z.string().uuid(),
  messageText: z.string().optional(),
  mediaUrl: z.string().url().optional(),
  mediaType: z.enum(["image", "audio", "document", "sticker"]).optional(),
  storeId: z.string().uuid(),
  instanceName: z.string(),
  phone: z.string(),
});

// === Manual Message (dashboard) ===

export const sendManualMessageSchema = z.object({
  conversationId: z.string().uuid(),
  text: z.string().min(1).max(4096),
});

// === Toggle AI Active ===

export const toggleAiActiveSchema = z.object({
  conversationId: z.string().uuid(),
  isAiActive: z.boolean(),
});

// Types
export type EvolutionWebhookPayload = z.infer<
  typeof evolutionWebhookPayloadSchema
>;
export type AiChatRequest = z.infer<typeof aiChatRequestSchema>;
export type SendManualMessage = z.infer<typeof sendManualMessageSchema>;
export type ToggleAiActive = z.infer<typeof toggleAiActiveSchema>;
