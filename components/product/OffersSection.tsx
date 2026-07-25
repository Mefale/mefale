"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { m } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { ProductModal } from "@/components/product/ProductModal";
import { formatPrice } from "@/utils/format-price";
import { discountPercent } from "@/utils/discount-percent";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

const PAGE_SIZE = 5;

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
        <section className="relative overflow-hidden rounded-2xl border border-[#93B5FF] bg-gradient-to-br from-[#D4E4FF] via-[#E6EFFF] to-[#A9C6FF] px-6 py-7 sm:px-8 sm:py-8 shadow-[0_24px_54px_-26px_rgba(26,86,219,0.4)]">
          {/* Decorative background */}
          <div className="pointer-events-none absolute inset-0" style={{ transform: "translateZ(0)" }}>
            <div
              className="absolute inset-0 opacity-[0.1]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(26,86,219,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(26,86,219,0.28) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div
              className="absolute -top-32 -left-16 h-64 w-64 rounded-full bg-[#1D4ED8] opacity-[0.3] blur-[120px]"
              style={{ transform: "translateZ(0)", willChange: "transform" }}
            />
            <div
              className="absolute -bottom-28 -right-16 h-64 w-64 rounded-full bg-[#0284C7] opacity-[0.24] blur-[120px]"
              style={{ transform: "translateZ(0)", willChange: "transform" }}
            />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4F81FF] to-transparent" />
            <div className="absolute inset-x-8 top-0 h-10 bg-gradient-to-b from-white/60 to-transparent" />
          </div>

          {/* Header */}
          <div className="relative mb-6 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FEE2E2] text-[#DC2626] shadow-[0_8px_24px_-12px_rgba(220,38,38,0.35)] ring-1 ring-[#FECACA]">
                <Zap className="h-5 w-5" strokeWidth={2.5} fill="currentColor" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0F172A]">
                    Ofertas
                  </h2>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DC2626]/25 bg-[#FEE2E2] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#B91C1C]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#DC2626]" />
                    Tiempo limitado
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#64748B]">
                  Productos seleccionados con precio especial
                </p>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs font-medium text-[#64748B] tabular-nums">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#475569] transition-colors hover:border-[#1A56DB]/40 hover:bg-[#EFF4FE] hover:text-[#1A56DB] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#E2E8F0] disabled:hover:bg-white disabled:hover:text-[#475569]"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#475569] transition-colors hover:border-[#1A56DB]/40 hover:bg-[#EFF4FE] hover:text-[#1A56DB] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#E2E8F0] disabled:hover:bg-white disabled:hover:text-[#475569]"
                  aria-label="Página siguiente"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile: horizontal scroll */}
          <div className="relative flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 sm:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {products.map((product, index) => (
              <OfferCard
                key={product.id}
                product={product}
                index={index}
                onSelect={setSelectedProduct}
              />
            ))}
          </div>

          {/* Desktop: paginated flex centered */}
          <div className="relative hidden sm:flex sm:flex-wrap sm:justify-center gap-4">
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
  const pct = discountPercent(product);

  return (
    <m.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
      className="snap-start flex-shrink-0 w-44 sm:w-52"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(product)}
        onKeyDown={(e) => e.key === "Enter" && onSelect(product)}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white cursor-pointer",
          "shadow-[0_4px_12px_-2px_rgba(0,0,0,0.25)]",
          "transition-all duration-300",
          "hover:border-[#1A56DB]/60 hover:shadow-[0_12px_28px_-8px_rgba(26,86,219,0.35)] hover:-translate-y-1"
        )}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#F8FAFC]">
          {mainImage && !imgError && (
            <Image
              src={mainImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          )}

          {/* Offer badge */}
          <div className="absolute top-2 left-2 pointer-events-none">
            <span className="flex items-center gap-1 rounded-md bg-[#DC2626] px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider leading-none text-white shadow-md ring-1 ring-white/20">
              <Zap className="h-3 w-3" strokeWidth={2.5} fill="currentColor" />
              {pct ? `-${pct}%` : "Oferta"}
            </span>
          </div>

          {product.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[1px]">
              <span className="rounded bg-[#0F172A] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                Sin stock
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-2 border-t border-[#F1F5F9] p-3">
          <div className="flex items-center gap-1.5">
            <span className="inline-block max-w-full truncate rounded bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#64748B]">
              {product.sku}
            </span>
            {product.brand && (
              <span className="truncate text-[10px] font-medium uppercase tracking-wide text-[#94A3B8]">
                {product.brand}
              </span>
            )}
          </div>

          <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-[#0F172A] transition-colors group-hover:text-[#1A56DB]">
            {product.name}
          </h3>

          <div className="mt-auto pt-1">
            {product.discountPrice ? (
              <div className="flex flex-col gap-0.5">
                <span className="text-lg font-extrabold tabular-nums text-[#0F172A] leading-none">
                  {formatPrice(product.discountPrice)}
                </span>
                <span className="text-xs text-[#94A3B8] line-through tabular-nums">
                  {formatPrice(product.price)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-extrabold tabular-nums text-[#0F172A] leading-none">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <AddToCartButton product={product} />
        </div>
      </div>
    </m.div>
  );
}
