"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Flame, Zap } from "lucide-react";
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
        <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 border border-amber-200 rounded-2xl px-6 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5 bg-[#DC2626] text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-sm">
                <Zap className="w-3.5 h-3.5" strokeWidth={2.5} />
                OFERTAS
              </span>
              <p className="text-sm text-[#64748B]">
                Productos seleccionados con precio especial
              </p>
            </div>

            {totalPages > 1 && (
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <span className="text-sm text-[#64748B] tabular-nums">
                  {page + 1} / {totalPages}
                </span>
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
          "group flex flex-col rounded-xl border border-[#E2E8F0] bg-white overflow-hidden cursor-pointer",
          "shadow-[var(--shadow-card)]",
          "hover:border-[#DC2626]/40 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5",
          "transition-all duration-300"
        )}
      >
        {/* Image with badge */}
        <div className="relative aspect-[4/3] bg-amber-50/60 overflow-hidden">
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
          <div className="absolute top-2 left-2 pointer-events-none">
            <span className="bg-[#DC2626] text-white text-[10px] font-extrabold px-2 py-1 rounded-md shadow-md flex items-center gap-1">
              <Flame className="w-3 h-3" strokeWidth={2.5} />
              OFERTA
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2 p-3 border-t border-[#F1F5F9]">
          <span className="inline-block self-start text-[9px] text-[#64748B] font-mono uppercase tracking-wider bg-[#F1F5F9] rounded px-1.5 py-0.5">
            {product.sku}
          </span>

          <h3 className="text-xs font-semibold text-[#0F172A] leading-snug line-clamp-2 group-hover:text-[#DC2626] transition-colors">
            {product.name}
          </h3>

          <div className="mt-auto">
            <span className="text-lg font-extrabold text-[#DC2626] tabular-nums">
              {formatPrice(product.discountPrice ?? product.price)}
            </span>
          </div>

          <AddToCartButton product={product} />
        </div>
      </div>
    </motion.div>
  );
}
