import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { verifyEvolutionWebhook } from "@/modules/core/whatsapp/lib/evolution/webhook";

describe("verifyEvolutionWebhook", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
    process.env.EVOLUTION_API_KEY = "test-secret-key-12345";
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it("should return true for matching key", () => {
    expect(verifyEvolutionWebhook("test-secret-key-12345")).toBe(true);
  });

  it("should return false for wrong key", () => {
    expect(verifyEvolutionWebhook("wrong-key")).toBe(false);
  });

  it("should return false for undefined payload key", () => {
    expect(verifyEvolutionWebhook(undefined)).toBe(false);
  });

  it("should return false for empty payload key", () => {
    expect(verifyEvolutionWebhook("")).toBe(false);
  });

  it("should return false when EVOLUTION_API_KEY is not set", () => {
    delete process.env.EVOLUTION_API_KEY;
    expect(verifyEvolutionWebhook("any-key")).toBe(false);
  });

  it("should return false for similar but different key (timing-safe)", () => {
    // Keys that differ by only one character
    expect(verifyEvolutionWebhook("test-secret-key-12346")).toBe(false);
  });

  it("should return false for key with extra characters", () => {
    expect(verifyEvolutionWebhook("test-secret-key-12345-extra")).toBe(false);
  });

  it("should return false for substring of key", () => {
    expect(verifyEvolutionWebhook("test-secret")).toBe(false);
  });

  it("should handle very long payload keys without crashing", () => {
    const longKey = "a".repeat(10000);
    expect(verifyEvolutionWebhook(longKey)).toBe(false);
  });
});
