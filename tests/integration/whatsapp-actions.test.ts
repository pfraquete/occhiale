/**
 * Integration tests for WhatsApp server actions.
 * Tests auth checks and store ownership validation.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.hoisted ensures these are available when vi.mock factories run
const { mockGetUser, mockFrom, mockAdminFrom } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
  mockAdminFrom: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createServiceRoleClient: vi.fn(() => ({
    from: mockAdminFrom,
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import {
  toggleAiActiveAction,
  sendManualMessageAction,
} from "@/lib/actions/whatsapp";

describe("WhatsApp Actions - Auth Checks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("toggleAiActiveAction", () => {
    it("should reject unauthenticated users", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      const result = await toggleAiActiveAction("conv-123", true);
      expect(result.success).toBe(false);
      expect(result.error).toContain("autorizado");
    });

    it("should reject users without conversation access", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
      });

      // Admin client returns conversation
      mockAdminFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { store_id: "store-123" },
            }),
          }),
        }),
      });

      // User client returns no membership
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null }),
              }),
            }),
          }),
        }),
      });

      const result = await toggleAiActiveAction("conv-123", true);
      expect(result.success).toBe(false);
      expect(result.error).toContain("autorizado");
    });

    it("should reject empty conversation ID", async () => {
      const result = await toggleAiActiveAction("", true);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("sendManualMessageAction", () => {
    it("should reject unauthenticated users", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      const result = await sendManualMessageAction("conv-123", "Hello");
      expect(result.success).toBe(false);
      expect(result.error).toContain("autorizado");
    });

    it("should reject empty text", async () => {
      const result = await sendManualMessageAction("conv-123", "  ");
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject empty conversation ID", async () => {
      const result = await sendManualMessageAction("", "Hello");
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
