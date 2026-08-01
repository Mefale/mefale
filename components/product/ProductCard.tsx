"use client";

import Image from "next/image";
import { useState } from "react";
import { m } from "framer-motion";
import { Zap, Star } from "lucide-react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { QuantityStepper } from "./QuantityStepper";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/utils/format-price";
import { discountPercent } from "@/utils/discount-percent";
import type { Product } from "@/types/product";

type Props = {
  product: Product;
  index?: number;
  onSelect?: (product: Product) => void;
  /** Modo selección: reemplaza el control de carrito por un selector de cantidad local. */
  selectable?: boolean;
  quantity?: number;
  onQuantityChange?: (product: Product, quantity: number) => void;
};

export function ProductCard({
  product,
  index = 0,
  onSelect,
  selectable = false,
  quantity = 0,
  onQuantityChange,
}: Props) {
  const mainImage = product.images[0];
  const [imgError, setImgError] = useState(false);
  const pct = discountPercent(product);

  return (
    <m.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: "easeOut" }}
      className="h-full"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect?.(product)}
        onKeyDown={(e) => e.key === "Enter" && onSelect?.(product)}
        className={cn(
          "group flex h-full flex-col rounded-xl border border-[#E2E8F0] bg-white overflow-hidden cursor-pointer",
          "shadow-[var(--shadow-card)]",
          "hover:border-[#1A56DB]/40 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5",
          "transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A56DB] focus-visible:ring-offset-2",
          selectable && quantity > 0 && "border-[#1A56DB] ring-2 ring-[#1A56DB]/25"
        )}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] bg-[#F8FAFC] overflow-hidden">
          {mainImage && !imgError && (
            <Image
              src={mainImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-contain p-3 mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-[1.05]"
              onError={() => setImgError(true)}
            />
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col items-start gap-1 pointer-events-none">
            {product.offer && (
              <span className="flex items-center gap-1 rounded-md bg-[#DC2626] px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider leading-none text-white shadow-sm">
                <Zap className="h-2.5 w-2.5" strokeWidth={2.5} fill="currentColor" />
                {pct ? `-${pct}%` : "Oferta"}
              </span>
            )}
            {product.featured && (
              <span className="flex items-center gap-1 rounded-md bg-[#D97706] px-2 py-1 text-[10px] font-bold uppercase tracking-wider leading-none text-white shadow-sm">
                <Star className="h-2.5 w-2.5" strokeWidth={2.5} fill="currentColor" />
                Destacado
              </span>
            )}
          </div>

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] flex items-center justify-center">
              <span className="rounded-md bg-[#0F172A] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                Sin stock
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-1.5 p-3 border-t border-[#F1F5F9]">
          {/* Brand + SKU */}
          <div className="flex items-center justify-between gap-2 min-w-0">
            {product.brand ? (
              <span className="truncate text-[10px] font-semibold text-[#1A56DB] uppercase tracking-wider">
                {product.brand}
              </span>
            ) : (
              <span />
            )}
            <span className="shrink-0 truncate max-w-[55%] text-[9px] text-[#64748B] font-mono uppercase tracking-wider bg-[#F1F5F9] rounded px-1.5 py-0.5">
              {product.sku}
            </span>
          </div>

          <h3 className="text-xs font-semibold text-[#0F172A] leading-snug line-clamp-2 min-h-[2.4em] group-hover:text-[#1A56DB] transition-colors">
            {product.name}
          </h3>

          {/* Price */}
          <div className="mt-auto pt-1.5">
            {product.discountPrice ? (
              <div className="flex flex-col">
                <span className="text-xs text-[#94A3B8] line-through tabular-nums leading-tight">
                  {formatPrice(product.price)}
                </span>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-base font-extrabold text-[#0F172A] tabular-nums leading-tight">
                    {formatPrice(product.discountPrice)}
                  </span>
                  {pct && (
                    <span className="text-[10px] font-bold text-[#16A34A]">
                      {pct}% OFF
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-base font-extrabold text-[#0F172A] tabular-nums leading-tight">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {selectable ? (
            <QuantityStepper
              quantity={quantity}
              onChange={(q) => onQuantityChange?.(product, q)}
              className="mt-1.5"
            />
          ) : (
            <AddToCartButton product={product} className="mt-1.5" />
          )}
        </div>
      </div>
    </m.div>
  );
}
