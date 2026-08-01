"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  quantity: number;
  onChange: (quantity: number) => void;
  className?: string;
};

/**
 * Selector de cantidad sin estado propio, para usos que no van al carrito
 * (ej: la selección compartida en /selection).
 */
export function QuantityStepper({ quantity, onChange, className }: Props) {
  function stop(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border overflow-hidden transition-colors",
        quantity > 0 ? "border-[#1A56DB] bg-[#1A56DB]" : "border-[#E2E8F0] bg-[#F8FAFC]",
        className
      )}
      onClick={stop}
    >
      <button
        type="button"
        aria-label="Reducir cantidad"
        disabled={quantity === 0}
        onClick={(e) => {
          stop(e);
          onChange(Math.max(0, quantity - 1));
        }}
        className={cn(
          "px-3 py-2 transition-colors",
          quantity > 0 ? "text-white hover:bg-white/15" : "text-[#CBD5E1] cursor-not-allowed"
        )}
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span
        className={cn(
          "text-sm font-bold tabular-nums min-w-[1.5rem] text-center",
          quantity > 0 ? "text-white" : "text-[#475569]"
        )}
      >
        {quantity}
      </span>
      <button
        type="button"
        aria-label="Aumentar cantidad"
        onClick={(e) => {
          stop(e);
          onChange(quantity + 1);
        }}
        className={cn(
          "px-3 py-2 transition-colors",
          quantity > 0
            ? "text-white hover:bg-white/15"
            : "text-[#475569] hover:text-[#0F172A] hover:bg-[#E2E8F0]"
        )}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
