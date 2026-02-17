// ============================================
// OCCHIALE - In-Memory Sliding Window Rate Limiter
// Suitable for Vercel serverless (per-instance limiting)
// For distributed rate limiting, use Upstash Redis
// ============================================

interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in seconds */
  windowSeconds: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, entry] of store.entries()) {
    const cutoff = now - windowMs;
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

/**
 * Check if a request should be rate limited.
 *
 * @param key - Unique identifier (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Object with `allowed` boolean and `remaining` count
 */
export function rateLimit(
  key: string,
  config: RateLimitConfig
): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  // Periodic cleanup
  cleanup(windowMs);

  // Get or create entry
  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  const cutoff = now - windowMs;
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  // Check limit
  if (entry.timestamps.length >= config.maxRequests) {
    const oldestInWindow = entry.timestamps[0] ?? now;
    return {
      allowed: false,
      remaining: 0,
      resetAt: oldestInWindow + windowMs,
    };
  }

  // Allow and record
  entry.timestamps.push(now);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.timestamps.length,
    resetAt: now + windowMs,
  };
}

/**
 * Pre-configured rate limiters for common use cases.
 */
export const rateLimiters = {
  /** Checkout: 10 requests per minute per IP */
  checkout: (ip: string) =>
    rateLimit(`checkout:${ip}`, { maxRequests: 10, windowSeconds: 60 }),

  /** AI Chat: 30 requests per minute per store */
  aiChat: (storeId: string) =>
    rateLimit(`ai-chat:${storeId}`, { maxRequests: 30, windowSeconds: 60 }),

  /** Meilisearch sync: 5 requests per minute */
  meilisearchSync: (ip: string) =>
    rateLimit(`meili-sync:${ip}`, { maxRequests: 5, windowSeconds: 60 }),

  /** Webhook: 200 requests per minute per IP */
  webhook: (ip: string) =>
    rateLimit(`webhook:${ip}`, { maxRequests: 200, windowSeconds: 60 }),

  /** Auth: 10 requests per minute per IP */
  auth: (ip: string) =>
    rateLimit(`auth:${ip}`, { maxRequests: 10, windowSeconds: 60 }),

  /** AI Product Recognition: 10 requests per minute per IP */
  aiProductRecognition: (ip: string) =>
    rateLimit(`ai-product:${ip}`, { maxRequests: 10, windowSeconds: 60 }),

  /** AI Face Measurement: 20 requests per minute per IP */
  aiFaceMeasurement: (ip: string) =>
    rateLimit(`ai-face:${ip}`, { maxRequests: 20, windowSeconds: 60 }),

  /** AI Frame Matching: 20 requests per minute per IP */
  aiFrameMatch: (ip: string) =>
    rateLimit(`ai-match:${ip}`, { maxRequests: 20, windowSeconds: 60 }),

  /** AI Lens Calibration: 20 requests per minute per IP */
  aiLensCalibration: (ip: string) =>
    rateLimit(`ai-lens:${ip}`, { maxRequests: 20, windowSeconds: 60 }),
};
