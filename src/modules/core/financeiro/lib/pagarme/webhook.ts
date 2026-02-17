// ============================================
// OCCHIALE - Pagar.me Webhook Verification
// HMAC-SHA256 signature validation
// ============================================

import { createHmac, timingSafeEqual } from "crypto";

/**
 * Verify Pagar.me webhook signature.
 * Uses HMAC-SHA256 with timing-safe comparison to prevent timing attacks.
 *
 * @param rawBody - The raw request body as string
 * @param signature - The x-hub-signature header value
 * @param secret - The webhook secret key
 * @returns true if signature is valid
 */
export function verifyPagarmeSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  if (!signature || !secret) return false;

  const expectedSignature = createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  // Pagar.me sends: sha256=<hash>
  const receivedHash = signature.startsWith("sha256=")
    ? signature.slice(7)
    : signature;

  try {
    return timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(receivedHash, "hex")
    );
  } catch {
    return false;
  }
}
