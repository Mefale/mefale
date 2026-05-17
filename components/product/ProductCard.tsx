"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/utils/format-price";
import type { Product } from "@/types/product";

type Props = {
  product: Product;
  index?: number;
  onSelect?: (product: Product) => void;
};

export function ProductCard({ product, index = 0, onSelect }: Props) {
  const mainImage = product.images[0];
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: "easeOut" }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect?.(product)}
        onKeyDown={(e) => e.key === "Enter" && onSelect?.(product)}
        className={cn(
          "group flex flex-col rounded-xl border border-[#E2E8F0] bg-white overflow-hidden cursor-pointer",
          "shadow-[var(--shadow-card)]",
          "hover:border-[#1A56DB]/40 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5",
          "transition-all duration-300"
        )}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] bg-white overflow-hidden">
          {mainImage && !imgError && (
            <Image
              src={mainImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 15vw"
              className="object-contain p-3"
              onError={() => setImgError(true)}
            />
          )}
          {product.featured && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-[#D97706] text-white border-transparent text-[10px] px-2 py-0.5 shadow-sm">
                Destacado
              </Badge>
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] flex items-center justify-center">
              <Badge variant="destructive" className="text-xs">Sin stock</Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1.5 p-3 border-t border-[#F1F5F9]">
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="inline-block max-w-full truncate text-[9px] text-[#64748B] font-mono uppercase tracking-wider bg-[#F1F5F9] rounded px-1.5 py-0.5">
                {product.sku}
              </span>
              {product.brand && (
                <span className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wide truncate">
                  {product.brand}
                </span>
              )}
            </div>
            <h3 className="text-xs font-semibold text-[#0F172A] leading-snug line-clamp-2 group-hover:text-[#1A56DB] transition-colors">
              {product.name}
            </h3>
          </div>

          <div className="mt-auto pt-1">
            <span className="block text-[10px] font-medium text-[#64748B]">
              Precio distribuidor
            </span>
            <span className="text-base font-bold text-[#0F172A] tabular-nums">
              {formatPrice(product.price)}
            </span>
          </div>

          <AddToCartButton product={product} />
        </div>
      </div>
    </motion.div>
  );
}
