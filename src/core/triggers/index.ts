// ============================================================================
// Core Triggers - Event-Driven Automation Triggers
// ============================================================================
//
// Triggers listen for events and dispatch workflows.
// Events can come from:
// - Database changes (order created, customer updated)
// - Webhooks (payment received, WhatsApp message)
// - Schedules (daily reports, weekly digest)
// - Manual invocation (admin actions)
//
// Usage:
//   emitEvent('order.created', { orderId: '...', storeId: '...' });
//   registerTrigger('order.created', async (payload) => { ... });
// ============================================================================

export type EventPayload = Record<string, unknown>;

export type TriggerHandler = (payload: EventPayload) => Promise<void>;

interface RegisteredTrigger {
  eventType: string;
  handler: TriggerHandler;
  description?: string;
}

/**
 * Central event bus for the trigger system.
 */
class TriggerBus {
  private triggers: RegisteredTrigger[] = [];
  private eventLog: Array<{ eventType: string; payload: EventPayload; timestamp: string }> = [];

  /**
   * Register a trigger handler for an event type.
   * Multiple handlers can be registered for the same event.
   */
  on(eventType: string, handler: TriggerHandler, description?: string): void {
    this.triggers.push({ eventType, handler, description });
  }

  /**
   * Remove all handlers for an event type.
   */
  off(eventType: string): void {
    this.triggers = this.triggers.filter((t) => t.eventType !== eventType);
  }

  /**
   * Emit an event. All registered handlers for this event type will be called.
   * Handlers execute concurrently. Errors in individual handlers don't affect others.
   */
  async emit(eventType: string, payload: EventPayload): Promise<void> {
    this.eventLog.push({
      eventType,
      payload,
      timestamp: new Date().toISOString(),
    });

    // Keep last 1000 events in memory
    if (this.eventLog.length > 1000) {
      this.eventLog = this.eventLog.slice(-1000);
    }

    const handlers = this.triggers.filter((t) => t.eventType === eventType);

    await Promise.allSettled(
      handlers.map(async (trigger) => {
        try {
          await trigger.handler(payload);
        } catch (error) {
          console.error(
            `[Trigger:${eventType}] Handler failed:`,
            error instanceof Error ? error.message : error
          );
        }
      })
    );
  }

  /**
   * List all registered event types.
   */
  listEventTypes(): string[] {
    return [...new Set(this.triggers.map((t) => t.eventType))];
  }

  /**
   * Get recent event log (for debugging/monitoring).
   */
  getRecentEvents(limit: number = 50) {
    return this.eventLog.slice(-limit);
  }
}

export const triggerBus = new TriggerBus();

// ============================================================================
// STANDARD EVENT TYPES
// ============================================================================

export const EVENTS = {
  // Organization
  ORG_CREATED: "organization.created",
  ORG_UPDATED: "organization.updated",

  // Members
  MEMBER_INVITED: "member.invited",
  MEMBER_JOINED: "member.joined",
  MEMBER_REMOVED: "member.removed",

  // Orders
  ORDER_CREATED: "order.created",
  ORDER_UPDATED: "order.updated",
  ORDER_PAID: "order.paid",
  ORDER_SHIPPED: "order.shipped",
  ORDER_DELIVERED: "order.delivered",
  ORDER_CANCELLED: "order.cancelled",

  // Customers
  CUSTOMER_CREATED: "customer.created",
  CUSTOMER_UPDATED: "customer.updated",

  // Products
  PRODUCT_CREATED: "product.created",
  PRODUCT_UPDATED: "product.updated",
  PRODUCT_LOW_STOCK: "product.low_stock",
  PRODUCT_OUT_OF_STOCK: "product.out_of_stock",

  // WhatsApp
  WHATSAPP_MESSAGE_RECEIVED: "whatsapp.message_received",
  WHATSAPP_CONVERSATION_STARTED: "whatsapp.conversation_started",

  // Billing
  SUBSCRIPTION_CREATED: "subscription.created",
  SUBSCRIPTION_UPDATED: "subscription.updated",
  SUBSCRIPTION_CANCELLED: "subscription.cancelled",
  PAYMENT_RECEIVED: "payment.received",
  PAYMENT_FAILED: "payment.failed",

  // CRM
  CRM_AUTOMATION_TRIGGERED: "crm.automation_triggered",
  NPS_SUBMITTED: "crm.nps_submitted",

  // Webhooks
  WEBHOOK_RECEIVED: "webhook.received",
} as const;

export type StandardEvent = (typeof EVENTS)[keyof typeof EVENTS];
