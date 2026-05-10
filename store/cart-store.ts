"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/product";
import type { CartItem } from "@/types/cart";

const MAX_CART_ITEMS = 50;

type CartState = {
  items: CartItem[];
  isDrawerOpen: boolean;

  add: (product: Product, cantidad?: number) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, cantidad: number) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;

  subtotal: () => number;
  itemCount: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      add: (product, cantidad = 1) => {
        const { items } = get();
        const existing = items.find((i) => i.id === product.id);

        if (existing) {
          set({
            items: items.map((i) =>
              i.id === product.id
                ? { ...i, cantidad: i.cantidad + cantidad }
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
                nombre: product.nombre,
                precio: product.precio,
                imagen: product.imagenes[0],
                cantidad,
              },
            ],
          });
        }
      },

      remove: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),

      setQuantity: (id, cantidad) => {
        if (cantidad <= 0) {
          get().remove(id);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, cantidad } : i
          ),
        });
      },

      clear: () => set({ items: [] }),

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),

      subtotal: () =>
        get().items.reduce((acc, i) => acc + i.precio * i.cantidad, 0),

      itemCount: () =>
        get().items.reduce((acc, i) => acc + i.cantidad, 0),
    }),
    {
      name: "grasser-cart-v1",
      // No persistir el estado del drawer
      partialize: (state) => ({ items: state.items }),
    }
  )
);
