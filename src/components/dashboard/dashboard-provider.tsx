"use client";

import { StoreContext, type StoreContextValue } from "@/hooks/use-store";

interface DashboardProviderProps {
  value: StoreContextValue;
  children: React.ReactNode;
}

export function DashboardProvider({ value, children }: DashboardProviderProps) {
  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}
