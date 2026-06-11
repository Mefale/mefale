"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/product";
import type { CartItem } from "@/types/cart";

const MAX_CART_ITEMS = 50;

type CartState = {
  items: CartItem[];
  isDrawerOpen: boolean;
  discountPercentage: number;
  customerName: string;
  customerPhone: string;

  add: (product: Product, quantity?: number) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  setDiscountPercentage: (value: number) => void;
  setCustomerName: (value: string) => void;
  setCustomerPhone: (value: string) => void;

  subtotal: () => number;
  itemCount: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      discountPercentage: 0,
      customerName: "",
      customerPhone: "",

      add: (product, quantity = 1) => {
        const { items } = get();
        const existing = items.find((i) => i.id === product.id);

        if (existing) {
          set({
            items: items.map((i) =>
              i.id === product.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          });
        } else {
          if (items.length >= MAX_CART_ITEMS) return;
          set({
            items: [
              ...items,
              {
                id: product.id,
                sku: product.sku,
                name: product.name,
                price: product.discountPrice ?? product.price,
                image: product.images[0],
                quantity,
                isOffer: product.offer || !!product.discountPrice,
              },
            ],
          });
        }
      },

      remove: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),

      setQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().remove(id);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        });
      },

      clear: () => set({ items: [] }),

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),

      setDiscountPercentage: (value) => {
        const safe = Number.isFinite(value) ? value : 0;
        set({ discountPercentage: Math.max(0, Math.min(100, safe)) });
      },

      setCustomerName: (value) => set({ customerName: value }),
      setCustomerPhone: (value) => set({ customerPhone: value }),

      subtotal: () =>
        get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),

      itemCount: () =>
        get().items.reduce((acc, i) => acc + i.quantity, 0),
    }),
    {
      name: "grasser-cart-v1",
      // Don't persist drawer state
      partialize: (state) => ({
        items: state.items,
        customerName: state.customerName,
        customerPhone: state.customerPhone,
      }),
    }
  )
);
