"use server";

import { createServiceRoleClient } from "@/lib/supabase/admin";
import { findOrCreateCustomer } from "@/lib/supabase/queries/customers";
import {
    createOrder,
    decrementStock
} from "@/lib/supabase/queries/orders";
import { generateOrderNumber } from "@/lib/utils/format";
import { revalidatePath } from "next/cache";
import { ensureServiceOrder } from "@/lib/orders/service-order-utils";

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
            items: params.items
        });

        // 4. Update order as POS, Confirmed and Paid
        const { error: updateError } = await supabase
            .from("orders")
            .update({
                status: "confirmed",
                payment_status: "paid",
                source: "pos"
            })
            .eq("id", orderId);

        if (updateError) throw updateError;

        // 5. Trigger OS if needed
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
