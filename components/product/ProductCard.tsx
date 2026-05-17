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
          "shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
          "hover:border-[#1A56DB]/40 hover:shadow-[0_4px_6px_rgba(15,23,42,0.05),0_10px_24px_rgba(15,23,42,0.08)] hover:-translate-y-0.5",
          "transition-all duration-300"
        )}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] bg-[#F1F5F9] overflow-hidden">
          {mainImage && !imgError && (
            <Image
              src={mainImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 15vw"
              className="object-cover group-hover:scale-[1.05] transition-transform duration-500"
              onError={() => setImgError(true)}
            />
          )}
          {product.featured && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-[#1A56DB] text-white border-transparent text-[10px] px-2 py-0.5 shadow-sm">
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
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[9px] text-[#94A3B8] font-mono uppercase tracking-wider">
              {product.sku}
            </span>
            <h3 className="text-xs font-semibold text-[#0F172A] leading-snug line-clamp-2 group-hover:text-[#1A56DB] transition-colors">
              {product.name}
            </h3>
          </div>

          <div className="flex items-baseline justify-between gap-2 mt-auto pt-1">
            <span className="text-sm font-bold text-[#0F172A] tabular-nums">
              {formatPrice(product.price)}
            </span>
            <span className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wide truncate">
              {product.brand}
            </span>
          </div>

          <AddToCartButton product={product} />
        </div>
      </div>
    </motion.div>
  );
}
