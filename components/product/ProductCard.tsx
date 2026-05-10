"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
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
  const mainImage = product.imagenes[0];

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
          "group flex flex-col rounded-xl border border-[#D1D5DB] bg-white shadow-sm overflow-hidden cursor-pointer",
          "hover:border-[#111827] hover:shadow-md hover:shadow-black/10",
          "transition-all duration-300"
        )}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] bg-[#F1F3F5] overflow-hidden">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={product.nombre}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#6B7280]">
              <ShoppingCart className="w-8 h-8 opacity-30" />
            </div>
          )}
          {product.destacado && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-[#1A56DB]/20 text-[#1A56DB] border-[#1A56DB]/30 text-[10px] px-2 py-0.5">
                Destacado
              </Badge>
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-[#FFFFFF]/70 flex items-center justify-center">
              <Badge variant="destructive" className="text-xs">Sin stock</Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1.5 p-3">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[9px] text-[#6B7280] font-mono uppercase tracking-wider">
              {product.sku}
            </span>
            <h3 className="text-xs font-medium text-[#111827] leading-snug line-clamp-2 group-hover:text-[#1A56DB] transition-colors">
              {product.nombre}
            </h3>
          </div>

          <div className="flex items-center justify-between mt-auto pt-0.5">
            <span className="text-sm font-semibold text-[#111827] tabular-nums">
              {formatPrice(product.precio)}
            </span>
            <span className="text-[10px] text-[#6B7280]">{product.marca}</span>
          </div>

          <AddToCartButton product={product} />
        </div>
      </div>
    </motion.div>
  );
}
