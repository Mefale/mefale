"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart-store";

export function useCart() {
  return useCartStore();
}

// Avoid SSR/CSR mismatch with persisted store
export function useCartHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
