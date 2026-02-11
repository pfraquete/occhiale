// ============================================
// OCCHIALE - WhatsApp Monitor Page
// Dashboard page for managing WhatsApp conversations
// ============================================

import { createClient } from "@/lib/supabase/server";
import { getConversationsForStore } from "@/lib/supabase/queries/whatsapp";
import { WhatsAppMonitor } from "@/components/dashboard/whatsapp/whatsapp-monitor";
import { WhatsAppEmptyState } from "@/components/dashboard/whatsapp/whatsapp-empty-state";

export const metadata = {
  title: "WhatsApp | OCCHIALE Dashboard",
};

export default async function WhatsAppPage() {
  const supabase = await createClient();

  // Get current user's store
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: membership } = await supabase
    .from("store_members")
    .select("store_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) return null;

  const storeId = membership.store_id;

  // Fetch initial conversations
  const { conversations, total } = await getConversationsForStore(storeId, {
    limit: 50,
  });

  if (total === 0) {
    return <WhatsAppEmptyState />;
  }

  return (
    <WhatsAppMonitor
      storeId={storeId}
      initialConversations={conversations}
      totalConversations={total}
    />
  );
}
