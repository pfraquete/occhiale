"use client";

import { useEffect } from "react";

/**
 * Service Worker Registration Component
 * Registers the service worker for PWA functionality.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {
          // Service worker registered successfully
        })
        .catch(() => {
          // Service worker registration failed — non-critical
        });
    }
  }, []);

  return null;
}
