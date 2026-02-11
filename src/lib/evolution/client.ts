// ============================================
// OCCHIALE - Evolution API v2 Client
// HTTP client for WhatsApp messaging via Evolution API
// ============================================

import type {
  EvolutionInstance,
  InstanceStatus,
  QRCodeResponse,
  SendTextPayload,
  SendImagePayload,
  WebhookConfig,
} from "./types";

export class EvolutionClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    // Remove trailing slash
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.apiKey = apiKey;
  }

  // ------------------------------------------
  // Internal fetch wrapper
  // ------------------------------------------

  private async request<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        apikey: this.apiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new EvolutionApiError(
        `Evolution API ${method} ${path}: ${response.status} - ${errorText}`,
        response.status
      );
    }

    // Some endpoints return empty body
    const text = await response.text();
    if (!text) return {} as T;

    return JSON.parse(text) as T;
  }

  // ------------------------------------------
  // Instance Management
  // ------------------------------------------

  /**
   * Create a new WhatsApp instance.
   * Each store gets its own instance.
   */
  async createInstance(
    instanceName: string,
    webhookUrl?: string
  ): Promise<EvolutionInstance> {
    return this.request<EvolutionInstance>("POST", "/instance/create", {
      instanceName,
      integration: "WHATSAPP-BAILEYS",
      qrcode: true,
      ...(webhookUrl && {
        webhook: {
          url: webhookUrl,
          webhook_by_events: false,
          webhook_base64: true,
          events: [
            "messages.upsert",
            "messages.update",
            "send.message",
            "connection.update",
            "qrcode.updated",
          ],
        },
      }),
    });
  }

  /**
   * Get instance connection status.
   */
  async getInstanceStatus(instanceName: string): Promise<InstanceStatus> {
    const result = await this.request<{ instance: InstanceStatus }>(
      "GET",
      `/instance/connectionState/${instanceName}`
    );
    return result.instance;
  }

  /**
   * Get QR code for connecting WhatsApp.
   */
  async getQRCode(instanceName: string): Promise<QRCodeResponse> {
    return this.request<QRCodeResponse>(
      "GET",
      `/instance/connect/${instanceName}`
    );
  }

  /**
   * Disconnect and delete an instance.
   */
  async deleteInstance(instanceName: string): Promise<void> {
    await this.request("DELETE", `/instance/delete/${instanceName}`);
  }

  /**
   * Logout (disconnect WhatsApp without deleting instance).
   */
  async logoutInstance(instanceName: string): Promise<void> {
    await this.request("DELETE", `/instance/logout/${instanceName}`);
  }

  /**
   * Restart an instance.
   */
  async restartInstance(instanceName: string): Promise<void> {
    await this.request("PUT", `/instance/restart/${instanceName}`);
  }

  // ------------------------------------------
  // Webhook Configuration
  // ------------------------------------------

  /**
   * Set webhook URL for an instance.
   */
  async setWebhook(instanceName: string, config: WebhookConfig): Promise<void> {
    await this.request("POST", `/webhook/set/${instanceName}`, config);
  }

  // ------------------------------------------
  // Messaging
  // ------------------------------------------

  /**
   * Send a text message.
   * @param instance Instance name
   * @param to Phone number with country code (e.g., "5511999999999")
   * @param text Message text
   */
  async sendText(instance: string, to: string, text: string): Promise<void> {
    const payload: SendTextPayload = {
      number: to,
      text,
      delay: 1000, // 1s delay for natural feel
    };

    await this.request("POST", `/message/sendText/${instance}`, payload);
  }

  /**
   * Send an image message.
   */
  async sendImage(
    instance: string,
    to: string,
    imageUrl: string,
    caption?: string
  ): Promise<void> {
    const payload: SendImagePayload = {
      number: to,
      mediatype: "image",
      mimetype: "image/jpeg",
      caption,
      media: imageUrl,
    };

    await this.request("POST", `/message/sendMedia/${instance}`, payload);
  }

  /**
   * Send a message with quick-reply buttons (max 3).
   */
  async sendButtons(
    instance: string,
    to: string,
    title: string,
    buttons: Array<{ id: string; text: string }>,
    description?: string
  ): Promise<void> {
    const payload = {
      number: to,
      title,
      description: description ?? "",
      buttons: buttons.slice(0, 3).map((btn) => ({
        type: "reply" as const,
        buttonId: btn.id,
        buttonText: { displayText: btn.text },
      })),
    };

    await this.request("POST", `/message/sendButtons/${instance}`, payload);
  }
}

// ------------------------------------------
// Custom Error
// ------------------------------------------

export class EvolutionApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "EvolutionApiError";
  }
}

// ------------------------------------------
// Singleton factory
// ------------------------------------------

let _client: EvolutionClient | null = null;

/**
 * Get the Evolution API client singleton.
 * Uses EVOLUTION_API_URL and EVOLUTION_API_KEY from env.
 */
export function getEvolutionClient(): EvolutionClient {
  if (_client) return _client;

  const baseUrl = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Missing EVOLUTION_API_URL or EVOLUTION_API_KEY environment variables"
    );
  }

  _client = new EvolutionClient(baseUrl, apiKey);
  return _client;
}
