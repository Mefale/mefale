"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart, useCartHydrated } from "@/hooks/use-cart";
import type { Product } from "@/types/product";

type Props = {
  product: Product;
  className?: string;
};

export function AddToCartButton({ product, className }: Props) {
  const { add, remove, setQuantity, items } = useCart();
  const hydrated = useCartHydrated();

  const inCart = items.find((i) => i.id === product.id);
  const qty = inCart?.quantity ?? 0;

  function handleDecrease(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (qty <= 1) remove(product.id);
    else setQuantity(product.id, qty - 1);
  }

  function handleIncrease(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (qty === 0) {
      add(product);
    } else {
      setQuantity(product.id, qty + 1);
    }
  }

  if (!hydrated) {
    return <div className={cn("h-9 rounded-lg bg-[#F1F5F9] animate-pulse", className)} />;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border overflow-hidden transition-colors",
        qty > 0 ? "border-[#1A56DB] bg-[#1A56DB]" : "border-[#E2E8F0] bg-[#F8FAFC]",
        className
      )}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <button
        onClick={handleDecrease}
        aria-label="Reducir cantidad"
        disabled={qty === 0}
        className={cn(
          "px-3 py-2 transition-colors",
          qty > 0 ? "text-white hover:bg-white/15" : "text-[#CBD5E1] cursor-not-allowed"
        )}
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className={cn(
        "text-sm font-bold tabular-nums min-w-[1.5rem] text-center",
        qty > 0 ? "text-white" : "text-[#475569]"
      )}>
        {qty === 0 ? "Agregar" : qty}
      </span>
      <button
        onClick={handleIncrease}
        aria-label="Aumentar cantidad"
        className={cn(
          "px-3 py-2 transition-colors",
          qty > 0 ? "text-white hover:bg-white/15" : "text-[#475569] hover:text-[#0F172A] hover:bg-[#E2E8F0]"
        )}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
