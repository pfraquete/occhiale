"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  name: string;
  price: number; // cents
  image?: string;
  quantity: number;
  brand?: string;
  lensConfig?: Record<string, unknown>;
}

interface CartState {
  storeId: string | null;
  storeSlug: string | null;
  items: CartItem[];

  // Actions
  addItem: (storeId: string, storeSlug: string, item: CartItem) => boolean;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Computed
  itemCount: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      storeId: null,
      storeSlug: null,
      items: [],

      addItem: (storeId, storeSlug, item) => {
        const state = get();

        // If adding from a different store, clear cart first
        if (state.storeId && state.storeId !== storeId) {
          // Return false to signal the caller should confirm
          return false;
        }

        set((s) => {
          const existing = s.items.find((i) => i.productId === item.productId);

          if (existing) {
            return {
              storeId,
              storeSlug,
              items: s.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }

          return {
            storeId,
            storeSlug,
            items: [...s.items, item],
          };
        });
        return true;
      },

      removeItem: (productId) => {
        set((s) => {
          const newItems = s.items.filter((i) => i.productId !== productId);
          return {
            items: newItems,
            ...(newItems.length === 0
              ? { storeId: null, storeSlug: null }
              : {}),
          };
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((s) => ({
          items: s.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => {
        set({ items: [], storeId: null, storeSlug: null });
      },

      itemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      subtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: "occhiale-cart",
    }
  )
);
