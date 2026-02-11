// ============================================
// OCCHIALE - Evolution API Webhook Verification
// Validates incoming webhook requests from Evolution API
// ============================================

/**
 * Verify that a webhook request is from Evolution API.
 * Evolution API sends the configured API key in the "apikey" field
 * of the webhook payload, and optionally in headers.
 *
 * We verify by checking the apikey in the payload body matches
 * our configured EVOLUTION_API_KEY.
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

  // Constant-time comparison to prevent timing attacks
  if (payloadApiKey.length !== expectedKey.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < payloadApiKey.length; i++) {
    result |= payloadApiKey.charCodeAt(i) ^ expectedKey.charCodeAt(i);
  }

  return result === 0;
}
