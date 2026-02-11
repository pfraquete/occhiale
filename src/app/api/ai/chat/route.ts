// ============================================
// OCCHIALE - AI Chat API Route
// POST: processes WhatsApp message through Claude AI
// Called internally by Evolution webhook handler
// ============================================

import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { processMessage } from "@/lib/ai/claude-client";
import { getEvolutionClient } from "@/lib/evolution/client";
import {
  getConversationById,
  getConversationHistory,
  saveMessage,
  updateConversationState,
} from "@/lib/supabase/queries/whatsapp";
import { aiChatRequestSchema } from "@/lib/validations/whatsapp";

/**
 * Internal API route for AI message processing.
 * Called by the Evolution webhook handler (fire-and-forget).
 *
 * Flow:
 * 1. Load conversation + history
 * 2. Load store context
 * 3. Process through Claude AI (with tool use loop)
 * 4. Save AI response to DB
 * 5. Send response via Evolution API
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify internal auth
    const internalKey = request.headers.get("x-internal-key");
    if (internalKey !== process.env.EVOLUTION_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse and validate body
    const body = await request.json();
    const parsed = aiChatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const {
      conversationId,
      messageText,
      mediaUrl,
      mediaType,
      storeId,
      instanceName,
      phone,
    } = parsed.data;

    // 3. Load conversation
    const conversation = await getConversationById(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // 4. Check if AI is still active (might have been toggled off)
    if (!conversation.is_ai_active) {
      return NextResponse.json(
        { message: "AI is not active for this conversation" },
        { status: 200 }
      );
    }

    // 5. Load store context
    const supabase = createServiceRoleClient();
    const { data: store } = await supabase
      .from("stores")
      .select("name, slug, settings, whatsapp_number")
      .eq("id", storeId)
      .single();

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // 6. Load conversation history (last 20 messages for context)
    const history = await getConversationHistory(conversationId, 20);

    // 7. Get product categories for this store
    const { data: categories } = await supabase
      .from("products")
      .select("category")
      .eq("store_id", storeId)
      .eq("is_active", true);

    const uniqueCategories = [
      ...new Set(categories?.map((c) => c.category) ?? []),
    ];

    // 8. Process through Claude AI
    const result = await processMessage({
      conversationId,
      storeId,
      phone,
      storeName: store.name,
      storeSlug: store.slug,
      storeCategories: uniqueCategories,
      whatsappNumber: store.whatsapp_number ?? undefined,
      messageText: messageText ?? undefined,
      mediaUrl: mediaUrl ?? undefined,
      mediaType: mediaType ?? undefined,
      history: history.map((msg) => ({
        role: msg.role as "customer" | "assistant" | "system",
        content: msg.content,
        media_url: msg.media_url,
        media_type: msg.media_type,
        tool_calls: msg.tool_calls as Record<string, unknown>[] | null,
      })),
    });

    // 9. Save AI response to DB
    await saveMessage({
      conversationId,
      role: "assistant",
      content: result.responseText,
      toolCalls: result.toolsUsed.length > 0 ? result.toolsUsed : undefined,
    });

    // 10. Update conversation state if needed
    if (result.agentState) {
      await updateConversationState(conversationId, {
        agentState: result.agentState as "human_takeover",
        isAiActive: result.agentState === "human_takeover" ? false : undefined,
      });
    }

    // 11. Send response via Evolution API
    try {
      const evolution = getEvolutionClient();
      await evolution.sendText(instanceName, phone, result.responseText);
    } catch (sendError) {
      console.error("Failed to send WhatsApp message:", sendError);
      // Message is saved in DB, so the dashboard can still see it
      // The evolution send failure is logged but doesn't fail the request
    }

    return NextResponse.json({
      success: true,
      responseLength: result.responseText.length,
      toolsUsed: result.toolsUsed.length,
    });
  } catch (error) {
    console.error("AI chat processing error:", error);
    return NextResponse.json(
      { error: "AI processing failed" },
      { status: 500 }
    );
  }
}
