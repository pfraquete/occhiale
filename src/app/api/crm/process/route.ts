import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/client";
import {
  orderConfirmationEmail,
  abandonedCartEmail,
} from "@/lib/email/templates";

/**
 * CRM Automation Processor — Cron Job
 * Runs every hour via Vercel Cron to process pending CRM automations.
 *
 * Supported triggers:
 * - post_purchase: Send thank-you after order
 * - abandoned_cart: Remind about abandoned carts
 * - birthday: Send birthday greetings
 * - inactivity: Re-engage inactive customers
 * - prescription_expiring: Remind about expiring prescriptions
 */
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const expected = `Bearer ${cronSecret}`;
    const expectedBuf = Buffer.from(expected);
    const receivedBuf = Buffer.from(authHeader ?? "");

    if (
      expectedBuf.length !== receivedBuf.length ||
      !crypto.timingSafeEqual(expectedBuf, receivedBuf)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = createServiceRoleClient();
  const results: Record<string, number> = {};

  try {
    // 1. Process post_purchase automations
    const postPurchaseCount = await processPostPurchase(supabase);
    results.post_purchase = postPurchaseCount;

    // 2. Process abandoned_cart automations
    const abandonedCount = await processAbandonedCarts(supabase);
    results.abandoned_cart = abandonedCount;

    // 3. Process birthday automations
    const birthdayCount = await processBirthdays(supabase);
    results.birthday = birthdayCount;

    // 4. Process inactivity automations
    const inactivityCount = await processInactivity(supabase);
    results.inactivity = inactivityCount;

    return NextResponse.json({
      success: true,
      processed: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("CRM processing error:", error);
    return NextResponse.json(
      { error: "CRM processing failed" },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processPostPurchase(supabase: any): Promise<number> {
  // Find active post_purchase automations
  const { data: automations } = await supabase
    .from("crm_automations")
    .select("*, stores(name, slug)")
    .eq("trigger_type", "post_purchase")
    .eq("is_active", true);

  if (!automations?.length) return 0;

  let processed = 0;

  for (const automation of automations) {
    // Find orders completed in the delay window that haven't been emailed yet
    const delayMs = automation.delay_hours * 60 * 60 * 1000;
    const cutoffTime = new Date(Date.now() - delayMs).toISOString();
    const windowStart = new Date(
      Date.now() - delayMs - 60 * 60 * 1000
    ).toISOString();

    const { data: orders } = await supabase
      .from("orders")
      .select(
        "id, order_number, total, customer_name, customer_email, items, shipping_cost"
      )
      .eq("store_id", automation.store_id)
      .eq("status", "paid")
      .gte("created_at", windowStart)
      .lte("created_at", cutoffTime)
      .limit(50);

    if (!orders?.length) continue;

    for (const order of orders) {
      if (!order.customer_email) continue;

      if (automation.action_type === "email") {
        const items =
          (order.items as Array<{
            name: string;
            quantity: number;
            price: number;
          }>) ?? [];
        const email = orderConfirmationEmail({
          customerName: order.customer_name ?? "Cliente",
          orderId: order.id,
          orderNumber: order.order_number,
          items,
          subtotal: order.total - (order.shipping_cost ?? 0),
          shipping: order.shipping_cost ?? 0,
          total: order.total,
          paymentMethod: "Pagar.me",
          storeName: automation.stores?.name ?? "Loja",
          storeSlug: automation.stores?.slug ?? "",
        });

        await sendEmail({
          to: order.customer_email,
          subject: email.subject,
          html: email.html,
          text: email.text,
        });

        processed++;
      }
    }
  }

  return processed;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processAbandonedCarts(supabase: any): Promise<number> {
  const { data: automations } = await supabase
    .from("crm_automations")
    .select("*, stores(name, slug)")
    .eq("trigger_type", "abandoned_cart")
    .eq("is_active", true);

  if (!automations?.length) return 0;

  let processed = 0;

  for (const automation of automations) {
    // Find WhatsApp conversations with cart context that went inactive
    const delayMs = Math.max(automation.delay_hours, 1) * 60 * 60 * 1000;
    const cutoffTime = new Date(Date.now() - delayMs).toISOString();

    const { data: conversations } = await supabase
      .from("whatsapp_conversations")
      .select("id, phone, customer_name")
      .eq("store_id", automation.store_id)
      .eq("agent_state", "quoting")
      .lte("last_message_at", cutoffTime)
      .limit(20);

    if (!conversations?.length) continue;

    for (const conv of conversations) {
      if (
        automation.action_type === "whatsapp_message" &&
        automation.template
      ) {
        // Send WhatsApp message via Evolution API
        try {
          const { getEvolutionClient } = await import("@/lib/evolution/client");
          const evolution = getEvolutionClient();
          const message = automation.template
            .replace("{{nome}}", conv.customer_name ?? "")
            .replace("{{loja}}", automation.stores?.name ?? "");

          await evolution.sendText(
            automation.stores?.slug ?? "default",
            conv.phone,
            message
          );
          processed++;
        } catch {
          console.error("Failed to send abandoned cart WhatsApp");
        }
      } else if (automation.action_type === "email") {
        // Would need customer email from profile
        const email = abandonedCartEmail({
          customerName: conv.customer_name ?? "Cliente",
          storeName: automation.stores?.name ?? "Loja",
          storeSlug: automation.stores?.slug ?? "",
          itemCount: 1,
        });

        // We'd need the customer's email here — skip if not available
        // TODO: Send email when customer email is available
        void email;
      }
    }
  }

  return processed;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processBirthdays(supabase: any): Promise<number> {
  const { data: automations } = await supabase
    .from("crm_automations")
    .select("*, stores(name, slug)")
    .eq("trigger_type", "birthday")
    .eq("is_active", true);

  if (!automations?.length) return 0;

  let processed = 0;
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  for (const automation of automations) {
    // Find customers with birthday today
    const { data: customers } = await supabase
      .from("customers")
      .select("id, name, phone, email")
      .eq("store_id", automation.store_id)
      .not("birth_date", "is", null)
      .limit(100);

    if (!customers?.length) continue;

    for (const customer of customers) {
      // Check if birthday matches today (month/day)
      // birth_date is stored as date type
      const birthDate = new Date(customer.birth_date);
      if (birthDate.getMonth() + 1 !== month || birthDate.getDate() !== day)
        continue;

      if (
        automation.action_type === "whatsapp_message" &&
        automation.template &&
        customer.phone
      ) {
        try {
          const { getEvolutionClient } = await import("@/lib/evolution/client");
          const evolution = getEvolutionClient();
          const message = automation.template
            .replace("{{nome}}", customer.name ?? "")
            .replace("{{loja}}", automation.stores?.name ?? "");

          await evolution.sendText(
            automation.stores?.slug ?? "default",
            customer.phone,
            message
          );
          processed++;
        } catch {
          console.error("Failed to send birthday WhatsApp");
        }
      }
    }
  }

  return processed;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processInactivity(supabase: any): Promise<number> {
  const { data: automations } = await supabase
    .from("crm_automations")
    .select("*, stores(name, slug)")
    .eq("trigger_type", "inactivity")
    .eq("is_active", true);

  if (!automations?.length) return 0;

  let processed = 0;

  for (const automation of automations) {
    const inactiveDays = Math.max(automation.delay_hours / 24, 30);
    const cutoffDate = new Date(
      Date.now() - inactiveDays * 24 * 60 * 60 * 1000
    ).toISOString();

    // Find customers who haven't ordered since cutoff
    const { data: inactiveCustomers } = await supabase
      .from("customers")
      .select("id, name, phone, email")
      .eq("store_id", automation.store_id)
      .lte("last_order_at", cutoffDate)
      .not("last_order_at", "is", null)
      .limit(50);

    if (!inactiveCustomers?.length) continue;

    for (const customer of inactiveCustomers) {
      if (
        automation.action_type === "whatsapp_message" &&
        automation.template &&
        customer.phone
      ) {
        try {
          const { getEvolutionClient } = await import("@/lib/evolution/client");
          const evolution = getEvolutionClient();
          const message = automation.template
            .replace("{{nome}}", customer.name ?? "")
            .replace("{{loja}}", automation.stores?.name ?? "");

          await evolution.sendText(
            automation.stores?.slug ?? "default",
            customer.phone,
            message
          );
          processed++;
        } catch {
          console.error("Failed to send inactivity WhatsApp");
        }
      }
    }
  }

  return processed;
}
