"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Tables } from "@/shared/types/database";

type StoreRow = Tables<"stores">;

interface StoreContextValue {
  store: StoreRow;
  settings: {
    colors?: { primary?: string; secondary?: string };
    shipping?: { freeAbove?: number; defaultCost?: number };
    payments?: {
      pagarmeEnabled?: boolean;
      pixEnabled?: boolean;
      creditCardEnabled?: boolean;
      boletoEnabled?: boolean;
      maxInstallments?: number;
    };
    policies?: { exchange?: string; privacy?: string; terms?: string };
  };
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({
  store,
  children,
}: {
  store: StoreRow;
  children: ReactNode;
}) {
  const settings = (store.settings as StoreContextValue["settings"]) ?? {};

  return (
    <StoreContext.Provider value={{ store, settings }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return ctx;
}
