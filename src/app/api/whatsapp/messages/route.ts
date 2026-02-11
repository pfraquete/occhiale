// ============================================
// OCCHIALE - WhatsApp Messages API Route
// GET: fetches messages for a conversation
// Used by the dashboard chat panel (client component)
// ============================================

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMessagesForConversation } from "@/lib/supabase/queries/whatsapp";
import { createServiceRoleClient } from "@/lib/supabase/admin";

/**
 * GET /api/whatsapp/messages?conversationId=xxx&limit=50&before=xxx
 *
 * Auth: Requires authenticated user who is a member of the conversation's store.
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse query params
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");
    const limitStr = searchParams.get("limit");
    const before = searchParams.get("before") ?? undefined;

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId is required" },
        { status: 400 }
      );
    }

    const limit = limitStr ? Math.min(parseInt(limitStr, 10), 100) : 50;

    // 3. Verify user has access to this conversation's store
    const adminClient = createServiceRoleClient();
    const { data: conversation } = await adminClient
      .from("whatsapp_conversations")
      .select("store_id")
      .eq("id", conversationId)
      .single();

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Check store membership
    const { data: membership } = await supabase
      .from("store_members")
      .select("store_id")
      .eq("user_id", user.id)
      .eq("store_id", conversation.store_id)
      .limit(1)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 4. Fetch messages
    const messages = await getMessagesForConversation(conversationId, {
      limit,
      before,
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("WhatsApp messages API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
