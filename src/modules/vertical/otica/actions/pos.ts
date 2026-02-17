"use server";

import { createServiceRoleClient } from "@/shared/lib/supabase/admin";
import { findOrCreateCustomer } from "@/shared/lib/supabase/queries/customers";
import {
    createOrder,
    decrementStock
} from "@/shared/lib/supabase/queries/orders";
import { generateOrderNumber } from "@/shared/lib/utils/format";
import { revalidatePath } from "next/cache";
import { ensureServiceOrder } from "@/modules/vertical/otica/lib/orders/service-order-utils";
import { createFocusNFeClient, mapOrderToFocusNFe } from "@/modules/core/fiscal/lib/focus-nfe";

export async function createPOSOrderAction(params: {
    storeId: string;
    customerId?: string;
    customerData?: {
        name: string;
        email: string;
        phone?: string;
        cpf?: string;
    };
    items: {
        productId: string;
        quantity: number;
        unitPrice: number;
        lensConfig?: any;
    }[];
    paymentMethod: string;
    total: number;
    emitFiscal?: boolean;
}) {
    const supabase = createServiceRoleClient();

    try {
        // 1. Customer Handling
        let customerId = params.customerId;

        if (!customerId && params.customerData) {
            const customer = await findOrCreateCustomer({
                storeId: params.storeId,
                ...params.customerData,
                email: params.customerData.email || `${Date.now()}@pos.internal`,
            });
            customerId = customer.id;
        }

        if (!customerId) {
            return { success: false, error: "Cliente não identificado" };
        }

        // 2. Stock Management (Atomic)
        const stockItems = params.items.map(i => ({
            productId: i.productId,
            quantity: i.quantity
        }));

        const { insufficientStock } = await decrementStock(stockItems);
        if (insufficientStock.length > 0) {
            return { success: false, error: "Estoque insuficiente para alguns itens" };
        }

        // 3. Create Order
        const orderNumber = generateOrderNumber();
        const subtotal = params.items.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0);

        const { orderId } = await createOrder({
            storeId: params.storeId,
            customerId,
            orderNumber,
            subtotal,
            shippingCost: 0,
            discount: 0,
            total: params.total,
            paymentMethod: params.paymentMethod,
            shippingAddress: null,
            items: params.items,
            source: "pos"
        });

        // 4. Update order as POS, Confirmed and Paid
        // Use a safe update (try source first, if it fails, fallback)
        const { data: updatedOrder, error: updateError } = await supabase
            .from("orders")
            .update({
                status: "confirmed",
                payment_status: "paid",
                source: "pos"
            })
            .eq("id", orderId)
            .select("*, store:stores(*), customer:customers(*)")
            .single();

        if (updateError) throw updateError;

        // 5. Emit NFC-e if requested
        const fiscalSettings = updatedOrder.store?.fiscal_settings as Record<string, any>;
        if (params.emitFiscal && fiscalSettings?.token) {
            try {
                const focusClient = await createFocusNFeClient({
                    token: fiscalSettings.token
                });

                // Fetch full items
                const { data: orderItems } = await supabase
                    .from("order_items")
                    .select("*")
                    .eq("order_id", updatedOrder.id);

                const nfcData = mapOrderToFocusNFe(
                    updatedOrder,
                    updatedOrder.store,
                    orderItems || [],
                    updatedOrder.customer
                );

                const response = await focusClient.emitNFCe(nfcData);

                // Update real fiscal columns
                await supabase
                    .from("orders")
                    .update({
                        fiscal_status: "pending",
                        fiscal_key: response.ref // Initial reference
                    })
                    .eq("id", updatedOrder.id);

            } catch (e: any) {
                console.error("Fiscal error:", e);
                await supabase
                    .from("orders")
                    .update({ notes: `${updatedOrder.notes} | Fiscal Error: ${e.message}` })
                    .eq("id", updatedOrder.id);
            }
        }

        // 6. Trigger OS if needed
        await ensureServiceOrder(orderId);

        revalidatePath("/dashboard/pedidos");
        revalidatePath("/dashboard/ordens-servico");

        return {
            success: true,
            orderId,
            orderNumber
        };

    } catch (error) {
        console.error("POS Order Error:", error);
        return { success: false, error: "Falha ao processar venda no PDV" };
    }
}
