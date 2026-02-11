"use client";

import { createContext, useContext } from "react";

export interface StoreContextValue {
  storeId: string;
  storeName: string;
  storeSlug: string;
  storeLogo: string | null;
  userRole: "owner" | "admin" | "member";
  userName: string;
  userEmail: string;
}

export const StoreContext = createContext<StoreContextValue | null>(null);

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used within a DashboardProvider");
  }
  return ctx;
}
