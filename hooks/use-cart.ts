"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart-store";

export function useCart() {
  return useCartStore();
}

// Selectores puntuales: a diferencia de useCart(), no re-renderizan en cada
// mutación no relacionada del store (abrir el drawer, tipear en el checkout,
// etc.). Importante para AddToCartButton, que se monta una vez por cada
// card visible en la grilla (hasta 40+ instancias).
export function useCartItemQuantity(id: string) {
  return useCartStore((s) => s.items.find((i) => i.id === id)?.quantity ?? 0);
}

export function useCartItemCount() {
  return useCartStore((s) => s.items.reduce((acc, i) => acc + i.quantity, 0));
}

export function useCartActions() {
  const add = useCartStore((s) => s.add);
  const remove = useCartStore((s) => s.remove);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const openDrawer = useCartStore((s) => s.openDrawer);
  return { add, remove, setQuantity, openDrawer };
}

// Avoid SSR/CSR mismatch with persisted store
export function useCartHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
