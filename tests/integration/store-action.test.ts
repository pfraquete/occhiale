/**
 * Integration tests for store creation action.
 * These tests mock Supabase but test the full action logic.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.hoisted ensures these are available when vi.mock factories run
const { mockFrom, mockRpc, mockGetUser } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockRpc: vi.fn(),
  mockGetUser: vi.fn(),
}));

vi.mock("@/shared/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
    rpc: mockRpc,
  }),
}));

vi.mock("@/shared/lib/supabase/admin", () => ({
  createServiceRoleClient: vi.fn(() => ({
    from: mockFrom,
    rpc: mockRpc,
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createStoreAction, checkSlugAvailability } from "@/modules/vertical/otica/actions/store";

describe("createStoreAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const result = await createStoreAction({
      name: "Test Store",
      slug: "test-store",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("autenticado");
  });

  it("should reject invalid store name (too short)", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    const result = await createStoreAction({
      name: "A",
      slug: "test-store",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should reject invalid slug (too short)", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    const result = await createStoreAction({
      name: "Test Store",
      slug: "ab",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should reject slug with invalid characters", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });

    const result = await createStoreAction({
      name: "Test Store",
      slug: "Test Store!@#",
    });

    expect(result.success).toBe(false);
  });
});

describe("checkSlugAvailability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return available for unused slug", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    });

    const result = await checkSlugAvailability("new-store");
    expect(result.available).toBe(true);
  });

  it("should return unavailable for taken slug", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: "existing-store" },
            error: null,
          }),
        }),
      }),
    });

    const result = await checkSlugAvailability("existing-store");
    expect(result.available).toBe(false);
  });

  it("should reject slugs shorter than 3 characters", async () => {
    const result = await checkSlugAvailability("ab");
    expect(result.available).toBe(false);
  });
});
