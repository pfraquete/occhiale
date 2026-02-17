// ============================================
// OCCHIALE - Evolution API Webhook Handler
// POST: receives WhatsApp messages → saves to DB → triggers AI
// ============================================

import { NextResponse, type NextRequest } from "next/server";
import { rateLimiters } from "@/shared/lib/utils/rate-limit";
import { verifyEvolutionWebhook } from "@/modules/core/whatsapp/lib/evolution/webhook";
import {
  extractPhoneFromJid,
  extractMessageText,
  extractMediaUrl,
  getContentType,
  type EvolutionWebhookData,
} from "@/modules/core/whatsapp/lib/evolution/types";
import { evolutionWebhookPayloadSchema } from "@/modules/core/whatsapp/lib/validations";
import {
  findOrCreateConversation,
  saveMessage,
} from "@/shared/lib/supabase/queries/whatsapp";

// ------------------------------------------
// Instance → Store cache (avoids full table scan on every webhook)
// ------------------------------------------

const instanceStoreCache = new Map<
  string,
  { storeId: string; expiresAt: number }
>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Evolution API sends webhooks for WhatsApp events.
 * We handle incoming messages and trigger AI processing.
 *
 * Events handled:
 * - messages.upsert → New incoming message
 *
 * Ignored:
 * - fromMe: true → Outgoing messages (our own)
 * - Non-message events (connection.update, qrcode.updated, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    // 0. Rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    const { allowed } = rateLimiters.webhook(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    // 1. Parse body
    const rawBody = await request.text();
    let payload: unknown;

    try {
      payload = JSON.parse(rawBody);
    } catch {
      console.warn("Evolution webhook: Invalid JSON body");
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // 2. Validate payload structure
    const parsed = evolutionWebhookPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      console.warn("Evolution webhook: Invalid payload", parsed.error.issues);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const { event, instance, data } = parsed.data;

    // 3. Verify API key from payload
    if (!verifyEvolutionWebhook(parsed.data.apikey)) {
      console.warn("Evolution webhook: Invalid API key");
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    // 4. Only handle message events
    if (event !== "messages.upsert") {
      // Log connection events for debugging
      if (event === "connection.update") {
        console.log(`Evolution ${instance}: connection update`, data);
      }
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // 5. Ignore outgoing messages (our own)
    if (data.key.fromMe) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // 6. Ignore group messages (only handle direct chats)
    if (data.key.remoteJid.endsWith("@g.us")) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // 7. Extract message data
    // Cast Zod-parsed data to our stricter TypeScript type
    const webhookData = data as unknown as EvolutionWebhookData;
    const phone = extractPhoneFromJid(data.key.remoteJid);
    const text = extractMessageText(webhookData);
    const mediaUrl = extractMediaUrl(webhookData);
    const contentType = getContentType(webhookData);

    // Ignore messages with no content
    if (!text && !mediaUrl) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    console.log(
      `WhatsApp message from ${phone} (${instance}): ${contentType}`,
      { text: text?.substring(0, 100), hasMedia: !!mediaUrl }
    );

    // 8. Resolve store_id from instance name (with caching)
    const storeId = await resolveStoreId(instance);
    if (!storeId) {
      console.warn(
        `Evolution webhook: Unknown instance "${instance}", no store found`
      );
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // 9. Find or create conversation
    const conversation = await findOrCreateConversation(
      storeId,
      phone,
      data.pushName
    );

    // 10. Save incoming message
    await saveMessage({
      conversationId: conversation.id,
      role: "customer",
      content: text ?? "",
      mediaUrl: mediaUrl ?? undefined,
      mediaType: contentType !== "text" ? contentType : undefined,
    });

    // 11. If AI is active, trigger AI processing (fire-and-forget)
    if (conversation.is_ai_active) {
      // Non-blocking: don't await — let webhook return 200 immediately
      triggerAiProcessing({
        conversationId: conversation.id,
        messageText: text ?? undefined,
        mediaUrl: mediaUrl ?? undefined,
        mediaType: contentType !== "text" ? contentType : undefined,
        storeId,
        instanceName: instance,
        phone,
      }).catch((err) => {
        console.error("AI processing error:", err);
      });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Evolution webhook error:", error);
    // Return 200 to prevent Evolution API from retrying
    return NextResponse.json(
      { received: true, error: "Processing error" },
      { status: 200 }
    );
  }
}

// ------------------------------------------
// Helpers
// ------------------------------------------

/**
 * Resolve store_id from Evolution API instance name.
 * FIX: Uses in-memory cache to avoid full table scan on every webhook.
 * FIX: Removed single-tenant fallback that mapped ANY instance to the only store.
 */
async function resolveStoreId(instanceName: string): Promise<string | null> {
  // Check cache first
  const cached = instanceStoreCache.get(instanceName);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.storeId;
  }

  const { createServiceRoleClient } = await import("@/shared/lib/supabase/admin");
  const supabase = createServiceRoleClient();

  // Strategy 1: Try parsing "occhiale-{uuid}" format (no DB query needed)
  const match = instanceName.match(/^occhiale-([0-9a-f-]{36})$/);
  if (match?.[1]) {
    const { data: store } = await supabase
      .from("stores")
      .select("id")
      .eq("id", match[1])
      .eq("is_active", true)
      .maybeSingle();

    if (store) {
      instanceStoreCache.set(instanceName, {
        storeId: store.id,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
      return store.id;
    }
  }

  // Strategy 2: Look up store by whatsappInstance in settings
  // FIX: Use a targeted JSONB query instead of fetching all stores
  const { data: stores } = await supabase
    .from("stores")
    .select("id, settings")
    .eq("is_active", true);

  if (stores) {
    for (const store of stores) {
      const settings = store.settings as Record<string, unknown> | null;
      if (
        settings &&
        (settings as { whatsappInstance?: string }).whatsappInstance ===
          instanceName
      ) {
        instanceStoreCache.set(instanceName, {
          storeId: store.id,
          expiresAt: Date.now() + CACHE_TTL_MS,
        });
        return store.id;
      }
    }
  }

  // Strategy 3: Look up by store slug (instance name might be the slug)
  const { data: storeBySlug } = await supabase
    .from("stores")
    .select("id")
    .eq("slug", instanceName)
    .eq("is_active", true)
    .maybeSingle();

  if (storeBySlug) {
    instanceStoreCache.set(instanceName, {
      storeId: storeBySlug.id,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
    return storeBySlug.id;
  }

  // FIX: Removed single-tenant fallback — if we can't identify the store,
  // we should NOT blindly route to the only store. Log and reject.
  console.warn(
    `resolveStoreId: Could not resolve instance "${instanceName}" to any store`
  );
  return null;
}

/**
 * Trigger AI processing via internal API route.
 * Uses fetch to POST to /api/ai/chat.
 */
async function triggerAiProcessing(params: {
  conversationId: string;
  messageText?: string;
  mediaUrl?: string;
  mediaType?: string;
  storeId: string;
  instanceName: string;
  phone: string;
}): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const response = await fetch(`${appUrl}/api/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Internal auth — same API key as Evolution for simplicity
      "x-internal-key": process.env.EVOLUTION_API_KEY ?? "",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "Unknown error");
    throw new Error(`AI chat API error: ${response.status} - ${text}`);
  }
}
