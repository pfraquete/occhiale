/**
 * Integration tests for checkout flow.
 * Tests validation, stock decrement logic, and error handling.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// We test the orders module's stock logic directly
// since the checkout route depends on external services (Pagar.me)

const mockRpc = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/shared/lib/supabase/admin", () => ({
  createServiceRoleClient: vi.fn(() => ({
    rpc: mockRpc,
    from: mockFrom,
  })),
}));

import { decrementStock, restoreStock } from "@/shared/lib/supabase/queries/orders";

describe("decrementStock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call decrement_stock RPC for each item", async () => {
    mockRpc.mockResolvedValue({ data: true, error: null });

    const items = [
      { productId: "prod-1", quantity: 2 },
      { productId: "prod-2", quantity: 1 },
    ];

    const result = await decrementStock(items);

    expect(mockRpc).toHaveBeenCalledTimes(2);
    expect(mockRpc).toHaveBeenCalledWith("decrement_stock", {
      p_product_id: "prod-1",
      p_quantity: 2,
    });
    expect(mockRpc).toHaveBeenCalledWith("decrement_stock", {
      p_product_id: "prod-2",
      p_quantity: 1,
    });
    expect(result.insufficientStock).toHaveLength(0);
  });

  it("should track insufficient stock items", async () => {
    // First item succeeds, second fails
    mockRpc
      .mockResolvedValueOnce({ data: true, error: null })
      .mockResolvedValueOnce({ data: false, error: null });

    const items = [
      { productId: "prod-1", quantity: 1 },
      { productId: "prod-2", quantity: 100 },
    ];

    const result = await decrementStock(items);

    expect(result.insufficientStock).toContain("prod-2");
    expect(result.insufficientStock).not.toContain("prod-1");
  });

  it("should handle empty items array", async () => {
    const result = await decrementStock([]);
    expect(result.insufficientStock).toHaveLength(0);
    expect(mockRpc).not.toHaveBeenCalled();
  });
});

describe("restoreStock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call restore_stock RPC for each item", async () => {
    mockRpc.mockResolvedValue({ data: null, error: null });

    const items = [
      { productId: "prod-1", quantity: 2 },
      { productId: "prod-2", quantity: 1 },
    ];

    await restoreStock(items);

    expect(mockRpc).toHaveBeenCalledTimes(2);
    expect(mockRpc).toHaveBeenCalledWith("restore_stock", {
      p_product_id: "prod-1",
      p_quantity: 2,
    });
    expect(mockRpc).toHaveBeenCalledWith("restore_stock", {
      p_product_id: "prod-2",
      p_quantity: 1,
    });
  });
});
