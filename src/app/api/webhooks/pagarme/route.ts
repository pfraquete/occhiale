// ============================================
// OCCHIALE - Pagar.me Webhook Handler
// POST: verifies HMAC-SHA256 → updates order status
// ============================================

import { NextResponse, type NextRequest } from "next/server";
import { verifyPagarmeSignature } from "@/lib/pagarme/webhook";
import { updateOrderPayment } from "@/lib/supabase/queries/orders";
import type { PagarmeWebhookEvent } from "@/lib/pagarme/types";

/**
 * Pagar.me sends webhooks for payment events.
 * We verify the signature and update order status accordingly.
 *
 * Events handled:
 * - order.paid → payment_status='paid', status='confirmed'
 * - charge.paid → payment_status='paid', status='confirmed'
 * - order.payment_failed → payment_status='failed'
 * - charge.payment_failed → payment_status='failed'
 * - order.canceled → payment_status='canceled', status='canceled'
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

    // 6. Handle events
    switch (event.type) {
      case "order.paid":
      case "charge.paid":
        await updateOrderPayment(pagarmeId, {
          paymentStatus: "paid",
          status: "confirmed",
        });
        console.log(`Order ${pagarmeId} marked as paid`);
        break;

      case "order.payment_failed":
      case "charge.payment_failed":
        await updateOrderPayment(pagarmeId, {
          paymentStatus: "failed",
        });
        console.log(`Order ${pagarmeId} payment failed`);
        break;

      case "order.canceled":
        await updateOrderPayment(pagarmeId, {
          paymentStatus: "canceled",
          status: "canceled",
        });
        console.log(`Order ${pagarmeId} canceled`);
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
