// ============================================
// OCCHIALE - Pagar.me API v5 Client
// Typed fetch client with Basic Auth
// ============================================

import type { PagarmeOrderRequest, PagarmeOrderResponse } from "./types";

const PAGARME_BASE_URL = "https://api.pagar.me/core/v5";

class PagarmeClient {
  private secretKey: string;
  private authHeader: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
    // Pagar.me API v5 uses Basic Auth: base64(secretKey + ":")
    this.authHeader = `Basic ${Buffer.from(`${this.secretKey}:`).toString("base64")}`;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${PAGARME_BASE_URL}${path}`;

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: this.authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Pagar.me API error:", {
        status: response.status,
        url,
        body: data,
      });
      throw new PagarmeError(
        data.message || `Pagar.me API error: ${response.status}`,
        response.status,
        data
      );
    }

    return data as T;
  }

  /**
   * Create an order with charges.
   * POST /orders
   */
  async createOrder(order: PagarmeOrderRequest): Promise<PagarmeOrderResponse> {
    return this.request<PagarmeOrderResponse>("POST", "/orders", order);
  }

  /**
   * Get order by ID.
   * GET /orders/:id
   */
  async getOrder(orderId: string): Promise<PagarmeOrderResponse> {
    return this.request<PagarmeOrderResponse>("GET", `/orders/${orderId}`);
  }

  /**
   * Get charge by ID.
   * GET /charges/:id
   */
  async getCharge(chargeId: string) {
    return this.request("GET", `/charges/${chargeId}`);
  }
}

export class PagarmeError extends Error {
  status: number;
  responseBody: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "PagarmeError";
    this.status = status;
    this.responseBody = body;
  }
}

/**
 * Create a Pagar.me client instance.
 * Uses PAGARME_SECRET_KEY from environment.
 */
export function createPagarmeClient(): PagarmeClient {
  const secretKey = process.env.PAGARME_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing PAGARME_SECRET_KEY environment variable");
  }
  return new PagarmeClient(secretKey);
}
