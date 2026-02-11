import webpush from "web-push";
import { createServiceRoleClient } from "@/lib/supabase/admin";

// ------------------------------------------
// Configuration
// ------------------------------------------

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? "";
const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT ?? "mailto:contato@occhiale.com.br";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

// ------------------------------------------
// Types
// ------------------------------------------

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
}

interface PushSubscriptionRecord {
  id: string;
  user_id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// ------------------------------------------
// Send Functions
// ------------------------------------------

/**
 * Send push notification to all subscribers of a store.
 */
export async function sendPushToStore(
  storeId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn("VAPID keys not configured, skipping push notifications");
    return { sent: 0, failed: 0 };
  }

  const supabase = createServiceRoleClient();

  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("id, user_id, endpoint, keys")
    .eq("store_id", storeId);

  if (!subscriptions || subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;
  const staleIds: string[] = [];

  const jsonPayload = JSON.stringify(payload);

  for (const sub of subscriptions as PushSubscriptionRecord[]) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys,
        },
        jsonPayload,
        { TTL: 86400 } // 24 hours
      );
      sent++;
    } catch (error: unknown) {
      const statusCode =
        error && typeof error === "object" && "statusCode" in error
          ? (error as { statusCode: number }).statusCode
          : 0;

      // 404 or 410 means subscription is no longer valid
      if (statusCode === 404 || statusCode === 410) {
        staleIds.push(sub.id);
      }
      failed++;
    }
  }

  // Clean up stale subscriptions
  if (staleIds.length > 0) {
    await supabase.from("push_subscriptions").delete().in("id", staleIds);
  }

  return { sent, failed };
}

/**
 * Send push notification to a specific user in a store.
 */
export async function sendPushToUser(
  storeId: string,
  userId: string,
  payload: PushPayload
): Promise<boolean> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return false;
  }

  const supabase = createServiceRoleClient();

  const { data: sub } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, keys")
    .eq("store_id", storeId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!sub) return false;

  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: sub.keys as { p256dh: string; auth: string },
      },
      JSON.stringify(payload),
      { TTL: 86400 }
    );
    return true;
  } catch (error: unknown) {
    const statusCode =
      error && typeof error === "object" && "statusCode" in error
        ? (error as { statusCode: number }).statusCode
        : 0;

    if (statusCode === 404 || statusCode === 410) {
      await supabase.from("push_subscriptions").delete().eq("id", sub.id);
    }
    return false;
  }
}
