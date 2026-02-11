// ============================================
// OCCHIALE - WhatsApp Database Queries
// CRUD operations for conversations and messages
// Uses service role client (called from webhooks/API routes)
// ============================================

import { createServiceRoleClient } from "@/lib/supabase/admin";
import { sanitizePostgrestFilter } from "@/lib/utils/sanitize";
import type { AgentState } from "@/lib/types/domain";

// ------------------------------------------
// Conversations
// ------------------------------------------

/**
 * Find an existing conversation or create a new one.
 * Matches by store_id + phone number.
 */
export async function findOrCreateConversation(
  storeId: string,
  phone: string,
  customerName?: string
) {
  const supabase = createServiceRoleClient();

  // Try to find existing active conversation
  // FIX: .single() → .maybeSingle() to avoid throwing when no rows found
  const { data: existing } = await supabase
    .from("whatsapp_conversations")
    .select("*")
    .eq("store_id", storeId)
    .eq("phone", phone)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    // Update last_message_at
    await supabase
      .from("whatsapp_conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", existing.id);

    return existing;
  }

  // Try to find customer by phone
  // FIX: .single() → .maybeSingle() to avoid throwing when no rows found
  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("store_id", storeId)
    .eq("phone", phone)
    .limit(1)
    .maybeSingle();

  // Create new conversation
  const { data: conversation, error } = await supabase
    .from("whatsapp_conversations")
    .insert({
      store_id: storeId,
      customer_id: customer?.id ?? null,
      phone,
      agent_state: "greeting",
      is_ai_active: true,
      sentiment: "neutral",
      last_message_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create conversation: ${error.message}`);
  }

  return conversation;
}

/**
 * Get a conversation by ID.
 */
export async function getConversationById(conversationId: string) {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("whatsapp_conversations")
    .select("*, customers(id, name, email, phone)")
    .eq("id", conversationId)
    .single();

  if (error) {
    throw new Error(`Failed to get conversation: ${error.message}`);
  }

  return data;
}

/**
 * Get conversations for a store (for dashboard list).
 */
export async function getConversationsForStore(
  storeId: string,
  options?: {
    limit?: number;
    offset?: number;
    isAiActive?: boolean;
    search?: string;
  }
) {
  const supabase = createServiceRoleClient();
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;

  let query = supabase
    .from("whatsapp_conversations")
    .select("*, customers(id, name, email, phone)", { count: "exact" })
    .eq("store_id", storeId)
    .order("last_message_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (options?.isAiActive !== undefined) {
    query = query.eq("is_ai_active", options.isAiActive);
  }

  // FIX: Sanitize search input to prevent PostgREST filter injection
  if (options?.search) {
    const safeSearch = sanitizePostgrestFilter(options.search);
    if (safeSearch) {
      query = query.or(
        `phone.ilike.%${safeSearch}%,customers.name.ilike.%${safeSearch}%`
      );
    }
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to get conversations: ${error.message}`);
  }

  return { conversations: data ?? [], total: count ?? 0 };
}

/**
 * Update conversation state.
 */
export async function updateConversationState(
  conversationId: string,
  updates: {
    agentState?: AgentState;
    isAiActive?: boolean;
    sentiment?: "positive" | "neutral" | "negative";
    customerId?: string;
  }
) {
  const supabase = createServiceRoleClient();

  // FIX: Use !== undefined instead of && (truthy check) for agentState
  // so that falsy-like values are not accidentally skipped
  const { error } = await supabase
    .from("whatsapp_conversations")
    .update({
      ...(updates.agentState !== undefined && {
        agent_state: updates.agentState,
      }),
      ...(updates.isAiActive !== undefined && {
        is_ai_active: updates.isAiActive,
      }),
      ...(updates.sentiment !== undefined && {
        sentiment: updates.sentiment,
      }),
      ...(updates.customerId !== undefined && {
        customer_id: updates.customerId,
      }),
    })
    .eq("id", conversationId);

  if (error) {
    throw new Error(`Failed to update conversation state: ${error.message}`);
  }
}

// ------------------------------------------
// Messages
// ------------------------------------------

/**
 * Save a message to the database.
 * DB columns: role (customer|assistant|system), content, media_url, media_type, tool_calls
 */
export async function saveMessage(message: {
  conversationId: string;
  role: "customer" | "assistant" | "system";
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  toolCalls?: Record<string, unknown>[];
}) {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("whatsapp_messages")
    .insert({
      conversation_id: message.conversationId,
      role: message.role,
      content: message.content,
      media_url: message.mediaUrl ?? null,
      media_type: message.mediaType ?? null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tool_calls: (message.toolCalls ?? null) as any,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save message: ${error.message}`);
  }

  // Update conversation last_message_at
  await supabase
    .from("whatsapp_conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", message.conversationId);

  return data;
}

/**
 * Get message history for a conversation (for AI context window).
 * Returns the last N messages ordered by creation time.
 */
export async function getConversationHistory(
  conversationId: string,
  limit = 20
) {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("whatsapp_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to get conversation history: ${error.message}`);
  }

  // Return in chronological order (oldest first)
  return (data ?? []).reverse();
}

/**
 * Get messages for dashboard display (paginated).
 */
export async function getMessagesForConversation(
  conversationId: string,
  options?: { limit?: number; before?: string }
) {
  const supabase = createServiceRoleClient();
  const limit = options?.limit ?? 50;

  let query = supabase
    .from("whatsapp_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (options?.before) {
    query = query.lt("created_at", options.before);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get messages: ${error.message}`);
  }

  // Return in chronological order
  return (data ?? []).reverse();
}
