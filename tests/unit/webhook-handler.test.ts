/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/webhooks/pagarme/route";
import { NextRequest } from "next/server";
import { verifyPagarmeSignature } from "@/lib/pagarme/webhook";
import {
    updateOrderPayment,
    getOrderByPaymentId,
    restoreStock
} from "@/lib/supabase/queries/orders";
import { sendOrderPaidNotification, sendPaymentFailedNotification } from "@/lib/evolution/notifications";

// Mock dependencies
vi.mock("@/lib/pagarme/webhook", () => ({
    verifyPagarmeSignature: vi.fn(),
}));

vi.mock("@/lib/supabase/queries/orders", () => ({
    updateOrderPayment: vi.fn(),
    getOrderByPaymentId: vi.fn(),
    restoreStock: vi.fn(),
}));

vi.mock("@/lib/evolution/notifications", () => ({
    sendOrderPaidNotification: vi.fn(),
    sendPaymentFailedNotification: vi.fn(),
}));

describe("PagarMe Webhook Handler", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.PAGARME_WEBHOOK_SECRET = "test-secret";
    });

    const createRequest = (body: any, signature: string = "valid-sig") => {
        return new NextRequest("https://example.com/api/webhooks/pagarme", {
            method: "POST",
            headers: { "x-hub-signature": signature },
            body: JSON.stringify(body),
        });
    };

    it("should mark order as paid and notify on order.paid event", async () => {
        (verifyPagarmeSignature as any).mockReturnValue(true);
        const mockOrder = {
            id: "order-123",
            order_number: "1001",
            customers: { name: "John Doe", phone: "5511999999999" },
            stores: { name: "Ótica Teste", whatsapp_number: "5511888888888" },
        };
        (getOrderByPaymentId as any).mockResolvedValue(mockOrder);

        const event = {
            type: "order.paid",
            id: "ev_123",
            data: { id: "or_123", status: "paid" },
        };

        const request = createRequest(event);
        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(updateOrderPayment).toHaveBeenCalledWith("or_123", {
            paymentStatus: "paid",
            status: "confirmed",
        });
        expect(sendOrderPaidNotification).toHaveBeenCalled();
    });

    it("should restore stock and notify on order.payment_failed event", async () => {
        (verifyPagarmeSignature as any).mockReturnValue(true);
        const mockOrder = {
            id: "order-123",
            order_number: "1001",
            customers: { name: "John Doe", phone: "5511999999999" },
            stores: { name: "Ótica Teste", whatsapp_number: "5511888888888" },
            order_items: [{ product_id: "prod-1", quantity: 1 }],
        };
        (getOrderByPaymentId as any).mockResolvedValue(mockOrder);

        const event = {
            type: "order.payment_failed",
            id: "ev_456",
            data: { id: "or_123", status: "failed" },
        };

        const request = createRequest(event);
        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(updateOrderPayment).toHaveBeenCalledWith("or_123", {
            paymentStatus: "failed",
        });
        expect(restoreStock).toHaveBeenCalled();
        expect(sendPaymentFailedNotification).toHaveBeenCalled();
    });

    it("should return 401 for invalid signature", async () => {
        (verifyPagarmeSignature as any).mockReturnValue(false);

        const request = createRequest({ type: "any" }, "invalid");
        const response = await POST(request);

        expect(response.status).toBe(401);
    });
});
