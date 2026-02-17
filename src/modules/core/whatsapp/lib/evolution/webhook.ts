// ============================================
// OCCHIALE - Evolution API Webhook Verification
// Validates incoming webhook requests from Evolution API
// ============================================

import crypto from "crypto";

/**
 * Verify that a webhook request is from Evolution API.
 * Evolution API sends the configured API key in the "apikey" field
 * of the webhook payload, and optionally in headers.
 *
 * We verify by checking the apikey in the payload body matches
 * our configured EVOLUTION_API_KEY.
 *
 * FIX: Uses crypto.timingSafeEqual with HMAC normalization to prevent
 * timing attacks. The previous implementation had an early-return on
 * length mismatch that leaked key length information.
 */
export function verifyEvolutionWebhook(
  payloadApiKey: string | undefined
): boolean {
  const expectedKey = process.env.EVOLUTION_API_KEY;

  if (!expectedKey) {
    console.error("Missing EVOLUTION_API_KEY environment variable");
    return false;
  }

  if (!payloadApiKey) {
    return false;
  }

  // Use HMAC to normalize both strings to fixed-length buffers,
  // then compare with timingSafeEqual. This prevents leaking
  // both the key length and content via timing side-channels.
  try {
    const hmacPayload = crypto
      .createHmac("sha256", "occhiale-webhook")
      .update(payloadApiKey)
      .digest();
    const hmacExpected = crypto
      .createHmac("sha256", "occhiale-webhook")
      .update(expectedKey)
      .digest();

    return crypto.timingSafeEqual(hmacPayload, hmacExpected);
  } catch {
    return false;
  }
}
