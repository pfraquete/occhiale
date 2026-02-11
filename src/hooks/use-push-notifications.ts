"use client";

import { useState, useEffect, useCallback } from "react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

// Module-level flag to track if subscription check has been performed
let _subscriptionChecked = false;

function getIsSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window &&
    VAPID_PUBLIC_KEY.length > 0
  );
}

interface UsePushNotificationsOptions {
  storeId: string | null;
}

export function usePushNotifications({ storeId }: UsePushNotificationsOptions) {
  const isSupported = getIsSupported();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check subscription status once via effect with external flag
  useEffect(() => {
    if (!isSupported || _subscriptionChecked) return;
    _subscriptionChecked = true;

    let cancelled = false;
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        if (!cancelled && sub !== null) {
          setIsSubscribed(true);
        }
      })
      .catch(() => {
        // Ignore errors during subscription check
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const permission: NotificationPermission =
    isSupported && typeof window !== "undefined"
      ? Notification.permission
      : "default";

  const subscribe = useCallback(async () => {
    if (!isSupported || !storeId) return false;

    setLoading(true);
    try {
      const perm = await Notification.requestPermission();

      if (perm !== "granted") {
        setLoading(false);
        return false;
      }

      const registration = await navigator.serviceWorker.ready;

      // Convert VAPID key to Uint8Array
      const padding = "=".repeat((4 - (VAPID_PUBLIC_KEY.length % 4)) % 4);
      const base64 = (VAPID_PUBLIC_KEY + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");
      const rawData = window.atob(base64);
      const applicationServerKey = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; i++) {
        applicationServerKey[i] = rawData.charCodeAt(i);
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // Send to server
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          storeId,
        }),
      });

      if (response.ok) {
        setIsSubscribed(true);
        setLoading(false);
        return true;
      }

      setLoading(false);
      return false;
    } catch {
      setLoading(false);
      return false;
    }
  }, [isSupported, storeId]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported || !storeId) return false;

    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remove from server
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });

      setIsSubscribed(false);
      setLoading(false);
      return true;
    } catch {
      setLoading(false);
      return false;
    }
  }, [isSupported, storeId]);

  return {
    isSupported,
    isSubscribed,
    permission,
    loading,
    subscribe,
    unsubscribe,
  };
}
