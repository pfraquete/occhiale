// ============================================
// OCCHIALE - Evolution API v2 Types
// Types for WhatsApp integration via Evolution API
// ============================================

// === INSTANCE ===

export interface EvolutionInstance {
  instance: {
    instanceName: string;
    instanceId: string;
    status: "open" | "close" | "connecting";
  };
  hash: string;
}

export interface InstanceStatus {
  instanceName: string;
  state: "open" | "close" | "connecting";
}

export interface QRCodeResponse {
  pairingCode: string | null;
  code: string;
  base64: string;
  count: number;
}

// === WEBHOOK PAYLOAD ===

export interface EvolutionWebhookPayload {
  event: EvolutionWebhookEvent;
  instance: string;
  data: EvolutionWebhookData;
  destination: string;
  date_time: string;
  server_url: string;
  apikey: string;
}

export type EvolutionWebhookEvent =
  | "messages.upsert"
  | "messages.update"
  | "messages.delete"
  | "messages.set"
  | "send.message"
  | "connection.update"
  | "qrcode.updated"
  | "contacts.upsert"
  | "contacts.update"
  | "presence.update"
  | "chats.upsert"
  | "chats.update"
  | "chats.delete"
  | "groups.upsert"
  | "groups.update"
  | "group-participants.update"
  | "call";

export interface EvolutionWebhookData {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
    participant?: string;
  };
  pushName?: string;
  message?: {
    conversation?: string;
    extendedTextMessage?: {
      text: string;
    };
    imageMessage?: {
      url: string;
      mimetype: string;
      caption?: string;
      jpegThumbnail?: string;
    };
    audioMessage?: {
      url: string;
      mimetype: string;
      seconds: number;
    };
    documentMessage?: {
      url: string;
      mimetype: string;
      title?: string;
      fileName?: string;
    };
    stickerMessage?: {
      url: string;
      mimetype: string;
    };
  };
  messageType?:
    | "conversation"
    | "extendedTextMessage"
    | "imageMessage"
    | "audioMessage"
    | "documentMessage"
    | "stickerMessage"
    | "reactionMessage"
    | "protocolMessage";
  messageTimestamp: number;
  instanceId?: string;
  source?: string;
}

// === SEND MESSAGE ===

export interface SendTextPayload {
  number: string;
  text: string;
  delay?: number;
}

export interface SendImagePayload {
  number: string;
  mediatype: "image";
  mimetype: string;
  caption?: string;
  media: string; // URL or base64
}

export interface SendButtonPayload {
  number: string;
  title: string;
  description: string;
  footer?: string;
  buttons: Array<{
    type: "reply";
    buttonId: string;
    buttonText: { displayText: string };
  }>;
}

// === WEBHOOK CONFIG ===

export interface WebhookConfig {
  url: string;
  webhook_by_events: boolean;
  webhook_base64: boolean;
  events: EvolutionWebhookEvent[];
}

// === HELPERS ===

/**
 * Extract the phone number from a WhatsApp JID (remoteJid).
 * Format: "5511999999999@s.whatsapp.net" → "5511999999999"
 */
export function extractPhoneFromJid(jid: string): string {
  return jid.replace(/@s\.whatsapp\.net$/, "").replace(/@g\.us$/, "");
}

/**
 * Format a phone number to WhatsApp JID.
 * "5511999999999" → "5511999999999@s.whatsapp.net"
 */
export function formatPhoneToJid(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  return `${cleaned}@s.whatsapp.net`;
}

/**
 * Extract text content from a webhook message payload.
 */
export function extractMessageText(data: EvolutionWebhookData): string | null {
  if (!data.message) return null;

  return (
    data.message.conversation ??
    data.message.extendedTextMessage?.text ??
    data.message.imageMessage?.caption ??
    null
  );
}

/**
 * Extract media URL from a webhook message payload.
 */
export function extractMediaUrl(data: EvolutionWebhookData): string | null {
  if (!data.message) return null;

  return (
    data.message.imageMessage?.url ??
    data.message.audioMessage?.url ??
    data.message.documentMessage?.url ??
    data.message.stickerMessage?.url ??
    null
  );
}

/**
 * Determine the content type from a webhook message.
 */
export function getContentType(
  data: EvolutionWebhookData
): "text" | "image" | "audio" | "document" | "sticker" {
  if (!data.message) return "text";

  if (data.message.imageMessage) return "image";
  if (data.message.audioMessage) return "audio";
  if (data.message.documentMessage) return "document";
  if (data.message.stickerMessage) return "sticker";
  return "text";
}
