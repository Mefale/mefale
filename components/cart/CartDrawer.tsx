"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, MessageCircle, ShoppingCart } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { useCart, useCartHydrated } from "@/hooks/use-cart";
import { formatPrice } from "@/utils/format-price";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp/build-message";

const customerSchema = z.object({
  nombre: z.string().optional(),
});
type CustomerForm = z.infer<typeof customerSchema>;

export function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, remove, setQuantity, clear, subtotal, itemCount } = useCart();
  const hydrated = useCartHydrated();
  const overlayRef = useRef<HTMLDivElement>(null);

  const { register, getValues } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
  });

  // Lock scroll when open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isDrawerOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeDrawer]);

  function handleWhatsApp() {
    const { nombre } = getValues();
    const message = buildWhatsAppMessage(items, { nombre });
    const url = buildWhatsAppUrl(message);
    window.open(url, "_blank", "noopener,noreferrer");
    // No vaciamos el carrito — el usuario puede volver
  }

  const count = hydrated ? itemCount() : 0;
  const total = hydrated ? subtotal() : 0;

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={closeDrawer}
            aria-hidden
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className={cn(
              "fixed top-0 right-0 bottom-0 z-50",
              "w-full sm:w-[420px]",
              "flex flex-col",
              "bg-[#F8F9FA] border-l border-[#D1D5DB]/60",
              "shadow-2xl shadow-black/40"
            )}
            role="dialog"
            aria-modal
            aria-label="Carrito"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D1D5DB]/60">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[#1A56DB]" />
                <h2 className="font-semibold text-[#111827] text-sm">
                  Carrito
                </h2>
                {count > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#1A56DB]/15 text-[#1A56DB] border border-[#1A56DB]/20 tabular-nums">
                    {count}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {hydrated && items.length > 0 && (
                  <button
                    onClick={clear}
                    aria-label="Vaciar carrito"
                    className="px-2.5 py-1.5 rounded-lg text-xs text-[#6B7280] hover:text-[#EF4444] hover:bg-red-50 transition-colors"
                  >
                    Borrar todo
                  </button>
                )}
                <button
                  onClick={closeDrawer}
                  aria-label="Cerrar carrito"
                  className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F1F3F5] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {!hydrated || items.length === 0 ? (
                <CartEmpty onClose={closeDrawer} />
              ) : (
                <ul className="divide-y divide-[#D1D5DB]/40">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-3 p-4">
                      {/* Image */}
                      <div className="relative w-16 h-16 rounded-lg bg-[#F1F3F5] overflow-hidden shrink-0">
                        {item.imagen ? (
                          <Image
                            src={item.imagen}
                            alt={item.nombre}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 text-[#6B7280] opacity-40" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[10px] text-[#6B7280] font-mono uppercase tracking-wider">
                              {item.sku}
                            </p>
                            <p className="text-sm text-[#111827] leading-snug line-clamp-2">
                              {item.nombre}
                            </p>
                          </div>
                          <button
                            onClick={() => remove(item.id)}
                            aria-label={`Eliminar ${item.nombre}`}
                            className="p-1 rounded text-[#6B7280] hover:text-[#EF4444] transition-colors shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          {/* Quantity controls */}
                          <div className="flex items-center rounded-lg border border-[#D1D5DB]/60 bg-[#F1F3F5] overflow-hidden">
                            <button
                              onClick={() => setQuantity(item.id, item.cantidad - 1)}
                              aria-label="Reducir cantidad"
                              className="px-2.5 py-1.5 text-[#6B7280] hover:text-[#111827] hover:bg-[#D1D5DB]/60 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 py-1.5 text-sm text-[#111827] tabular-nums min-w-[2rem] text-center">
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => setQuantity(item.id, item.cantidad + 1)}
                              aria-label="Aumentar cantidad"
                              className="px-2.5 py-1.5 text-[#6B7280] hover:text-[#111827] hover:bg-[#D1D5DB]/60 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-sm font-semibold text-[#111827] tabular-nums">
                            {formatPrice(item.precio * item.cantidad)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer — solo si hay items */}
            {hydrated && items.length > 0 && (
              <div className="border-t border-[#D1D5DB]/60 bg-[#F8F9FA] px-5 py-4 flex flex-col gap-3">
                {/* Subtotal */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280]">Total estimado</span>
                  <span className="text-lg font-bold text-[#111827] tabular-nums">
                    {formatPrice(total)}
                  </span>
                </div>

                {/* Datos opcionales */}
                <input
                  {...register("nombre")}
                  placeholder="Tu nombre (opcional)"
                  className="w-full bg-white border border-[#D1D5DB] rounded-lg px-3 py-2 text-sm text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:border-[#111827] transition-colors"
                />

                {/* WhatsApp CTA */}
                <div className="rounded-lg bg-[#F1F5F9] border border-[#D1D5DB] px-3 py-2.5 text-xs text-[#6B7280] text-center leading-relaxed">
                  Para iniciar la compra enviá tu pedido por WhatsApp. Un vendedor te confirma precio y disponibilidad.
                </div>

                <button
                  onClick={handleWhatsApp}
                  className={cn(
                    "w-full flex items-center justify-center gap-2",
                    "bg-[#1A56DB] hover:bg-[#1447C0] active:scale-[0.98]",
                    "text-[#FFFFFF] font-semibold text-sm",
                    "py-3 px-4 rounded-xl",
                    "transition-all duration-150"
                  )}
                >
                  <MessageCircle className="w-4 h-4" />
                  Enviar pedido por WhatsApp
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CartEmpty({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 py-20 px-6 text-center">
      <div className="p-5 rounded-2xl bg-[#F1F3F5] border border-[#D1D5DB]/60">
        <ShoppingCart className="w-8 h-8 text-[#6B7280]" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-[#111827]">El carrito está vacío</p>
        <p className="text-xs text-[#6B7280]">
          Agregá productos del catálogo para armar tu consulta.
        </p>
      </div>
      <Link
        href="/productos"
        onClick={onClose}
        className="text-sm text-[#1A56DB] hover:text-[#1447C0] transition-colors"
      >
        Ver catálogo →
      </Link>
    </div>
  );
}
