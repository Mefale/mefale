"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { ProductModal } from "@/components/product/ProductModal";
import { formatPrice } from "@/utils/format-price";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

const PAGE_SIZE = 4;

interface Props {
  products: Product[];
}

export function OffersSection({ products }: Props) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const pageItems = products.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <>
      <Container>
        <section className="bg-[#FAF9F7] border border-[#E8E4DC] border-l-4 border-l-[#DC2626] rounded-2xl px-6 py-8 shadow-[0_0_0_1px_rgba(220,38,38,0.07),0_4px_24px_-4px_rgba(220,38,38,0.12)]">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg sm:text-xl font-bold text-[#0F172A]">
                  Ofertas vigentes
                </h2>
                <span className="text-[11px] font-semibold text-[#DC2626] bg-[#FFF1F2] border border-[#FECDD3] px-2 py-0.5 rounded-full">
                  {products.length} {products.length === 1 ? "nueva" : "nuevas"}
                </span>
              </div>
              <p className="text-sm text-[#64748B]">
                Precios especiales · cantidades limitadas
              </p>
            </div>

            {totalPages > 1 && (
              <div className="hidden sm:flex items-center gap-1.5 shrink-0 pt-1">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white text-[#475569] hover:border-[#1A56DB] hover:text-[#1A56DB] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white text-[#475569] hover:border-[#1A56DB] hover:text-[#1A56DB] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Página siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile: horizontal scroll */}
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 sm:hidden [scrollbar-width:thin] [scrollbar-color:#E2E8F0_transparent]">
            {products.map((product, index) => (
              <OfferCard
                key={product.id}
                product={product}
                index={index}
                onSelect={setSelectedProduct}
              />
            ))}
          </div>

          {/* Desktop: paginated grid */}
          <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {pageItems.map((product, index) => (
              <OfferCard
                key={product.id}
                product={product}
                index={index}
                onSelect={setSelectedProduct}
              />
            ))}
          </div>
        </section>
      </Container>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}

function OfferCard({
  product,
  index,
  onSelect,
}: {
  product: Product;
  index: number;
  onSelect: (p: Product) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const mainImage = product.images[0];
  const discount = product.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : null;
  const savings = product.discountPrice
    ? product.price - product.discountPrice
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
      className="snap-start flex-shrink-0 w-48 sm:w-auto"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(product)}
        onKeyDown={(e) => e.key === "Enter" && onSelect(product)}
        className={cn(
          "group flex flex-col rounded-xl border border-[#E2E8F0] bg-[#FFFAF9] overflow-hidden cursor-pointer",
          "shadow-[var(--shadow-card)]",
          "hover:border-[#DC2626]/30 hover:shadow-[0_4px_16px_-4px_rgba(220,38,38,0.18)] hover:-translate-y-0.5",
          "transition-all duration-300"
        )}
      >
        {/* Image with ribbon */}
        <div className="relative aspect-[4/3] bg-[#F8FAFC] overflow-hidden">
          {mainImage && !imgError && (
            <Image
              src={mainImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-3"
              onError={() => setImgError(true)}
            />
          )}
          {discount && (
            <div className="absolute top-3 -left-7 w-28 text-center bg-[#DC2626] text-white text-[10px] font-bold py-1 rotate-[-45deg] shadow-sm pointer-events-none">
              -{discount}% OFF
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2 p-3 border-t border-[#F1F5F9]">
          <span className="inline-block self-start text-[9px] text-[#64748B] font-mono uppercase tracking-wider bg-[#F1F5F9] rounded px-1.5 py-0.5">
            {product.sku}
          </span>

          <h3 className="text-xs font-semibold text-[#0F172A] leading-snug line-clamp-2 group-hover:text-[#1A56DB] transition-colors">
            {product.name}
          </h3>

          <div className="mt-auto flex flex-col gap-0.5">
            {product.discountPrice && savings ? (
              <>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs text-[#94A3B8] line-through tabular-nums">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-[10px] font-bold text-[#16A34A] bg-[#F0FDF4] border border-[#BBF7D0] px-1.5 py-0.5 rounded tabular-nums">
                    -{formatPrice(savings)}
                  </span>
                </div>
                <span className="text-base font-bold text-[#0F172A] tabular-nums">
                  {formatPrice(product.discountPrice)}
                </span>
              </>
            ) : (
              <span className="text-base font-bold text-[#0F172A] tabular-nums">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <AddToCartButton product={product} />
        </div>
      </div>
    </motion.div>
  );
}
