"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
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

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#0F172A]/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-sm rounded-2xl bg-white border border-[#E2E8F0] shadow-[0_24px_48px_-12px_rgba(15,23,42,0.35)] overflow-hidden pointer-events-auto"
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

              {/* Image */}
              <div className="relative w-full aspect-square bg-white">
                {product.images[0] && !imgError && (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 672px) 100vw, 672px"
                    className="object-contain p-6"
                    onError={() => setImgError(true)}
                  />
                )}
              </div>

              {/* Info */}
              <div className="px-5 py-4 flex flex-col gap-1.5 border-t border-[#F1F5F9]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#94A3B8] font-mono uppercase tracking-wider">
                    {product.sku}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
                  <span className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wide">
                    {product.brand}
                  </span>
                </div>
                <h2 className="text-base font-bold text-[#0F172A] leading-snug">
                  {product.name}
                </h2>
                <span className="text-xl font-extrabold text-[#0F172A] tabular-nums mt-1.5">
                  {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(product.price)}
                </span>
                <div className="mt-5 pt-4 border-t border-[#F1F5F9]">
                  <AddToCartButton product={product} />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
