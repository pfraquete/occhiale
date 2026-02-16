// ============================================
// OCCHIALE - Pagar.me Webhook Handler
// POST: verifies HMAC-SHA256 → updates order status
// ============================================

import { NextResponse, type NextRequest } from "next/server";
import { verifyPagarmeSignature } from "@/lib/pagarme/webhook";
import {
  updateOrderPayment,
  getOrderByPaymentId,
  restoreStock
} from "@/lib/supabase/queries/orders";
import { sendOrderPaidNotification, sendPaymentFailedNotification } from "@/lib/evolution/notifications";
import type { PagarmeWebhookEvent } from "@/lib/pagarme/types";

/**
 * Pagar.me sends webhooks for payment events.
 * We verify the signature and update order status accordingly.
 *
 * Events handled:
 * - order.paid → payment_status='paid', status='confirmed' + notification
 * - charge.paid → payment_status='paid', status='confirmed' + notification
 * - order.payment_failed → payment_status='failed' + stock restoration
 * - charge.payment_failed → payment_status='failed' + stock restoration
 * - order.canceled → payment_status='canceled', status='canceled' + stock restoration
 * - charge.refunded → payment_status='refunded', status='refunded'
 * - charge.chargedback → payment_status='chargedback'
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Read raw body for signature verification
    const rawBody = await request.text();

    // 2. Get signature from header
    const signature = request.headers.get("x-hub-signature") ?? "";

    // 3. Verify HMAC-SHA256 signature
    const webhookSecret = process.env.PAGARME_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("Missing PAGARME_WEBHOOK_SECRET");
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      );
    }

    const isValid = verifyPagarmeSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      console.warn("Invalid Pagar.me webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 4. Parse event
    const event: PagarmeWebhookEvent = JSON.parse(rawBody);

    console.log(`Pagar.me webhook: ${event.type}`, {
      id: event.id,
      dataId: event.data?.id,
      status: event.data?.status,
    });

    // 5. Get the Pagar.me order/charge ID to find our order
    const pagarmeId = event.data?.id;
    if (!pagarmeId) {
      console.warn("Webhook event missing data.id");
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // 6. Find the order in our database
    const order = await getOrderByPaymentId(pagarmeId);
    if (!order) {
      console.warn(`Order not found for Pagar.me ID: ${pagarmeId}`);
      // Return 200 anyway to stop retries for non-existent orders
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // 7. Handle events
    switch (event.type) {
      case "order.paid":
      case "charge.paid":
        await updateOrderPayment(pagarmeId, {
          paymentStatus: "paid",
          status: "confirmed",
        });

        // Trigger notification
        if (order.customers && order.stores) {
          await sendOrderPaidNotification({
            whatsappNumber: order.stores.whatsapp_number ?? "",
            customerPhone: order.customers.phone ?? "",
            customerName: order.customers.name,
            orderNumber: order.order_number,
            storeName: order.stores.name,
          });
        }

        console.log(`Order ${pagarmeId} marked as paid and notified`);
        break;

      case "order.payment_failed":
      case "charge.payment_failed":
        await updateOrderPayment(pagarmeId, {
          paymentStatus: "failed",
        });

        // Restore stock
        if (order.order_items && order.order_items.length > 0) {
          await restoreStock(
            order.order_items.map((item: any) => ({
              productId: item.product_id,
              quantity: item.quantity,
            }))
          );
        }

        // Notify customer
        if (order.customers && order.stores) {
          await sendPaymentFailedNotification({
            whatsappNumber: order.stores.whatsapp_number ?? "",
            customerPhone: order.customers.phone ?? "",
            customerName: order.customers.name,
            orderNumber: order.order_number,
          });
        }

        console.log(`Order ${pagarmeId} payment failed - stock restored`);
        break;

      case "order.canceled":
        await updateOrderPayment(pagarmeId, {
          paymentStatus: "canceled",
          status: "canceled",
        });

        // Restore stock
        if (order.order_items && order.order_items.length > 0) {
          await restoreStock(
            order.order_items.map((item: any) => ({
              productId: item.product_id,
              quantity: item.quantity,
            }))
          );
        }
        console.log(`Order ${pagarmeId} canceled - stock restored`);
        break;

      case "charge.refunded":
        await updateOrderPayment(pagarmeId, {
          paymentStatus: "refunded",
          status: "refunded",
        });
        console.log(`Order ${pagarmeId} refunded`);
        break;

      case "charge.chargedback":
        await updateOrderPayment(pagarmeId, {
          paymentStatus: "chargedback",
        });
        console.log(`Order ${pagarmeId} chargedback`);
        break;

      case "charge.underpaid":
      case "charge.overpaid":
        // Log but don't change status — may need manual review
        console.warn(`Order ${pagarmeId} ${event.type}`, {
          amount: event.data?.amount,
        });
        break;

      default:
        console.log(`Unhandled webhook event: ${event.type}`);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Return 200 to prevent Pagar.me from retrying on our errors
    // (we log the error for investigation)
    return NextResponse.json(
      { received: true, error: "Processing error" },
      { status: 200 }
    );
  }
}
