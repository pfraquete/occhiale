import { describe, it, expect, beforeEach, vi } from "vitest";
import { rateLimit, rateLimiters } from "@/lib/utils/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    // Reset the internal store by calling with a unique key prefix per test
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should allow requests within the limit", () => {
    const key = `test-allow-${Date.now()}`;
    const config = { maxRequests: 3, windowSeconds: 60 };

    const r1 = rateLimit(key, config);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = rateLimit(key, config);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = rateLimit(key, config);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("should block requests exceeding the limit", () => {
    const key = `test-block-${Date.now()}`;
    const config = { maxRequests: 2, windowSeconds: 60 };

    rateLimit(key, config);
    rateLimit(key, config);

    const r3 = rateLimit(key, config);
    expect(r3.allowed).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it("should reset after the window expires", () => {
    const key = `test-reset-${Date.now()}`;
    const config = { maxRequests: 1, windowSeconds: 10 };

    const r1 = rateLimit(key, config);
    expect(r1.allowed).toBe(true);

    const r2 = rateLimit(key, config);
    expect(r2.allowed).toBe(false);

    // Advance time past the window
    vi.advanceTimersByTime(11_000);

    const r3 = rateLimit(key, config);
    expect(r3.allowed).toBe(true);
  });

  it("should return correct resetAt timestamp", () => {
    const key = `test-resetat-${Date.now()}`;
    const config = { maxRequests: 1, windowSeconds: 60 };

    const now = Date.now();
    const r1 = rateLimit(key, config);
    expect(r1.allowed).toBe(true);
    // resetAt should be approximately now + 60s
    expect(r1.resetAt).toBeGreaterThanOrEqual(now + 59_000);
    expect(r1.resetAt).toBeLessThanOrEqual(now + 61_000);
  });

  it("should track different keys independently", () => {
    const config = { maxRequests: 1, windowSeconds: 60 };

    const r1 = rateLimit(`user-a-${Date.now()}`, config);
    expect(r1.allowed).toBe(true);

    const r2 = rateLimit(`user-b-${Date.now()}`, config);
    expect(r2.allowed).toBe(true);
  });
});

describe("rateLimiters", () => {
  it("checkout should have 10 req/min limit", () => {
    const key = `checkout-test-${Date.now()}`;
    // Call 10 times — all should pass
    for (let i = 0; i < 10; i++) {
      const r = rateLimiters.checkout(key);
      expect(r.allowed).toBe(true);
    }
    // 11th should fail
    const r11 = rateLimiters.checkout(key);
    expect(r11.allowed).toBe(false);
  });

  it("aiChat should have 30 req/min limit", () => {
    const key = `aichat-test-${Date.now()}`;
    for (let i = 0; i < 30; i++) {
      const r = rateLimiters.aiChat(key);
      expect(r.allowed).toBe(true);
    }
    const r31 = rateLimiters.aiChat(key);
    expect(r31.allowed).toBe(false);
  });

  it("webhook should have 200 req/min limit", () => {
    const key = `webhook-test-${Date.now()}`;
    for (let i = 0; i < 200; i++) {
      rateLimiters.webhook(key);
    }
    const r201 = rateLimiters.webhook(key);
    expect(r201.allowed).toBe(false);
  });

  it("auth should have 10 req/min limit", () => {
    const key = `auth-test-${Date.now()}`;
    for (let i = 0; i < 10; i++) {
      rateLimiters.auth(key);
    }
    const r11 = rateLimiters.auth(key);
    expect(r11.allowed).toBe(false);
  });
});
