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
    return <div className={cn("h-8 rounded-lg bg-[#F1F3F5] animate-pulse", className)} />;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border overflow-hidden transition-colors",
        qty > 0 ? "border-[#1A56DB]/30 bg-[#1A56DB]/10" : "border-[#D1D5DB]/60 bg-[#F1F3F5]",
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
          qty > 0 ? "text-[#1A56DB] hover:bg-[#1A56DB]/20" : "text-[#D1D5DB] cursor-not-allowed"
        )}
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className={cn(
        "text-sm font-semibold tabular-nums min-w-[1.5rem] text-center",
        qty > 0 ? "text-[#1A56DB]" : "text-[#6B7280]"
      )}>
        {qty}
      </span>
      <button
        onClick={handleIncrease}
        aria-label="Aumentar cantidad"
        className={cn(
          "px-3 py-2 transition-colors",
          qty > 0 ? "text-[#1A56DB] hover:bg-[#1A56DB]/20" : "text-[#6B7280] hover:text-[#111827] hover:bg-[#D1D5DB]/60"
        )}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
