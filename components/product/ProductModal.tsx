"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Zap } from "lucide-react";
import { AnimatePresence, m } from "framer-motion";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { formatPrice } from "@/utils/format-price";
import { discountPercent } from "@/utils/discount-percent";
import type { Product } from "@/types/product";

type Props = {
  product: Product | null;
  onClose: () => void;
};

export function ProductModal({ product, onClose }: Props) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [product]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pct = product ? discountPercent(product) : null;

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <m.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#0F172A]/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <m.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-md max-h-[90dvh] flex flex-col rounded-2xl bg-white border border-[#E2E8F0] shadow-[var(--shadow-panel)] overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-white/80 backdrop-blur-sm text-[#475569] hover:text-[#0F172A] hover:bg-white shadow-sm transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="overflow-y-auto">
                {/* Image */}
                <div className="relative w-full aspect-[4/3] bg-[#F8FAFC]">
                  {product.images[0] && !imgError && (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 672px) 100vw, 672px"
                      className="object-contain p-6 mix-blend-multiply"
                      onError={() => setImgError(true)}
                    />
                  )}
                  {product.offer && (
                    <span className="absolute top-3 left-3 flex items-center gap-1 rounded-md bg-[#DC2626] px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider leading-none text-white shadow-sm">
                      <Zap className="h-2.5 w-2.5" strokeWidth={2.5} fill="currentColor" />
                      {pct ? `-${pct}%` : "Oferta"}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="px-5 py-4 flex flex-col gap-2 border-t border-[#F1F5F9]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-[#64748B] font-mono uppercase tracking-wider bg-[#F1F5F9] rounded px-1.5 py-0.5">
                      {product.sku}
                    </span>
                    {product.brand && (
                      <span className="text-[10px] font-semibold text-[#1A56DB] uppercase tracking-wider">
                        {product.brand}
                      </span>
                    )}
                    {product.category && (
                      <span className="text-[10px] font-medium text-[#64748B] uppercase tracking-wide border border-[#E2E8F0] rounded-full px-2 py-0.5">
                        {product.category}
                      </span>
                    )}
                  </div>

                  <h2 className="text-lg font-bold text-[#0F172A] leading-snug">
                    {product.name}
                  </h2>

                  {product.description && (
                    <p className="text-sm text-[#475569] leading-relaxed">
                      {product.description}
                    </p>
                  )}

                  {/* Precio */}
                  <div className="mt-2">
                    {product.discountPrice ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-[#94A3B8] line-through tabular-nums">
                          {formatPrice(product.price)}
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-extrabold text-[#0F172A] tabular-nums">
                            {formatPrice(product.discountPrice)}
                          </span>
                          {pct && (
                            <span className="text-xs font-bold text-[#16A34A]">
                              {pct}% OFF
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-2xl font-extrabold text-[#0F172A] tabular-nums">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 pt-4 border-t border-[#F1F5F9]">
                    <AddToCartButton product={product} />
                    {/* Link a la ficha completa (/products/[sku]) oculto por ahora.
                        La página existe y es compartible por URL; falta decidir
                        dónde ubicar el acceso visible. */}
                  </div>
                </div>
              </div>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
