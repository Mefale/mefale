"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart-store";

export function useCart() {
  return useCartStore();
}

// Evita mismatch SSR/CSR con el store persistido
export function useCartHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
