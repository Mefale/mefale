"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, MessageCircle, ShoppingCart, Tag } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { useCart, useCartHydrated } from "@/hooks/use-cart";
import { formatPrice } from "@/utils/format-price";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp/build-message";

const customerSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
});
type CustomerForm = z.infer<typeof customerSchema>;

export function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    remove,
    setQuantity,
    clear,
    subtotal,
    itemCount,
    discountPercentage,
    setDiscountPercentage,
    customerName,
    customerPhone,
    setCustomerName,
    setCustomerPhone,
  } = useCart();
  const hydrated = useCartHydrated();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [discountInput, setDiscountInput] = useState("");

  const { register, getValues, setValue } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
  });

  // Sync store → form cuando el store hidrata desde localStorage
  useEffect(() => {
    if (hydrated) {
      setValue("name", customerName);
      setValue("phone", customerPhone);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const handleImgError = (itemId: string) => {
    setImgErrors(prev => new Set([...prev, itemId]));
  };

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
    const { name, phone } = getValues();
    setCustomerName(name ?? "");
    setCustomerPhone(phone ?? "");
    const effectiveDiscount = discountEnabled ? discountPercentage : 0;
    const message = buildWhatsAppMessage(items, { name }, effectiveDiscount);
    const url = buildWhatsAppUrl(message);
    window.open(url, "_blank", "noopener,noreferrer");

    // Fire-and-forget: registrar el pedido en Sheets sin bloquear
    fetch("/api/track-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: name ?? "",
        phone: phone ?? "-",
        items: items.map((i) => ({
          sku: i.sku,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
        total: subtotal() * (1 - effectiveDiscount / 100),
        discountPercentage: effectiveDiscount,
      }),
    }).catch(() => {});
  }

  function handleToggleDiscount(checked: boolean) {
    setDiscountEnabled(checked);
    if (!checked) {
      setDiscountPercentage(0);
      setDiscountInput("");
    }
  }

  function handleDiscountChange(raw: string) {
    setDiscountInput(raw);
    const parsed = Number(raw);
    setDiscountPercentage(Number.isFinite(parsed) ? parsed : 0);
  }

  const count = hydrated ? itemCount() : 0;
  const total = hydrated ? subtotal() : 0;
  const discountActive = discountEnabled && discountPercentage > 0;
  const discountedTotal = total * (1 - discountPercentage / 100);

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
            className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-sm"
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
              "bg-white border-l border-[#E2E8F0]",
              "shadow-[0_24px_48px_-12px_rgba(15,23,42,0.35)]"
            )}
            role="dialog"
            aria-modal
            aria-label="Carrito"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-md bg-[#0F172A]">
                  <ShoppingCart className="w-3.5 h-3.5 text-white" />
                </span>
                <h2 className="font-bold text-[#0F172A] text-sm">
                  Carrito
                </h2>
                {count > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#1A56DB] text-white font-semibold tabular-nums">
                    {count}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {hydrated && items.length > 0 && (
                  <button
                    onClick={clear}
                    aria-label="Vaciar carrito"
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#64748B] hover:text-[#DC2626] hover:bg-red-50 transition-colors"
                  >
                    Borrar todo
                  </button>
                )}
                <button
                  onClick={closeDrawer}
                  aria-label="Cerrar carrito"
                  className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
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
                <ul className="divide-y divide-[#F1F5F9]">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-3 p-4 hover:bg-[#F8FAFC] transition-colors">
                      {/* Image */}
                      <div className="relative w-16 h-16 rounded-lg bg-white border border-[#E2E8F0] overflow-hidden shrink-0">
                        {item.image && !imgErrors.has(item.id) && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="64px"
                            className="object-contain p-1"
                            onError={() => handleImgError(item.id)}
                          />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <p className="text-[10px] text-[#94A3B8] font-mono uppercase tracking-wider">
                                {item.sku}
                              </p>
                              {item.isOffer && (
                                <span className="bg-[#DC2626] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                                  OFERTA
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-[#0F172A] leading-snug line-clamp-2">
                              {item.name}
                            </p>
                          </div>
                          <button
                            onClick={() => remove(item.id)}
                            aria-label={`Eliminar ${item.name}`}
                            className="p-1 rounded text-[#94A3B8] hover:text-[#DC2626] transition-colors shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          {/* Quantity controls */}
                          <div className="flex items-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] overflow-hidden">
                            <button
                              onClick={() => setQuantity(item.id, item.quantity - 1)}
                              aria-label="Reducir cantidad"
                              className="px-2.5 py-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 py-1.5 text-sm font-semibold text-[#0F172A] tabular-nums min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => setQuantity(item.id, item.quantity + 1)}
                              aria-label="Aumentar cantidad"
                              className="px-2.5 py-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {discountActive ? (
                            <span className="flex items-baseline gap-1.5 tabular-nums">
                              <span className="text-xs text-[#94A3B8] line-through">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                              <span className="text-sm font-bold text-[#0F172A]">
                                {formatPrice(item.price * item.quantity * (1 - discountPercentage / 100))}
                              </span>
                            </span>
                          ) : (
                            <span className="text-sm font-bold text-[#0F172A] tabular-nums">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer — solo si hay items */}
            {hydrated && items.length > 0 && (
              <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3 flex flex-col gap-2">
                {/* Descuento */}
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={discountEnabled}
                      onChange={(e) => handleToggleDiscount(e.target.checked)}
                      className="w-4 h-4 rounded border-[#CBD5E1] text-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB]/30 cursor-pointer"
                    />
                    <Tag className="w-3.5 h-3.5 text-[#64748B]" />
                    <span className="text-sm font-medium text-[#0F172A]">Aplicar descuento</span>
                  </label>
                  {discountEnabled && (
                    <div className="flex items-center gap-2 pl-6">
                      <div className="relative">
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          max={100}
                          step={1}
                          value={discountInput}
                          onChange={(e) => handleDiscountChange(e.target.value)}
                          placeholder="0"
                          className="w-20 bg-white border border-[#E2E8F0] rounded-lg pl-3 pr-7 py-1.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1A56DB] focus:ring-4 focus:ring-[#1A56DB]/10 transition-colors tabular-nums"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#64748B] pointer-events-none">%</span>
                      </div>
                      <span className="text-xs text-[#64748B]">descuento global</span>
                    </div>
                  )}
                </div>

                {/* Subtotal */}
                {discountActive ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-[#64748B]">Subtotal</span>
                      <span className="text-sm text-[#94A3B8] line-through tabular-nums">
                        {formatPrice(total)}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-[#64748B]">Descuento ({discountPercentage}%)</span>
                      <span className="text-sm text-[#DC2626] tabular-nums">
                        −{formatPrice(total - discountedTotal)}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between pt-1 border-t border-[#E2E8F0]">
                      <span className="text-sm text-[#64748B]">Total con descuento</span>
                      <span className="text-xl font-extrabold text-[#0F172A] tabular-nums">
                        {formatPrice(discountedTotal)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-[#64748B]">Total estimado</span>
                    <span className="text-xl font-extrabold text-[#0F172A] tabular-nums">
                      {formatPrice(total)}
                    </span>
                  </div>
                )}

                {/* Datos opcionales */}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    {...register("name")}
                    placeholder="Tu nombre"
                    onBlur={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1A56DB] focus:ring-4 focus:ring-[#1A56DB]/10 transition-colors"
                  />
                  <input
                    {...register("phone")}
                    type="tel"
                    inputMode="tel"
                    placeholder="Tu teléfono"
                    onBlur={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1A56DB] focus:ring-4 focus:ring-[#1A56DB]/10 transition-colors"
                  />
                </div>

                {/* WhatsApp CTA */}
                <div className="rounded-lg bg-white border border-[#E2E8F0] px-3 py-1.5 text-[11px] text-[#64748B] text-center leading-snug">
                  Para iniciar la compra enviá tu pedido por WhatsApp. Un vendedor te confirma precio y disponibilidad.
                </div>

                <button
                  onClick={handleWhatsApp}
                  className={cn(
                    "w-full flex items-center justify-center gap-2",
                    "bg-[#1A56DB] hover:bg-[#1447C0] active:scale-[0.98]",
                    "text-white font-semibold text-sm",
                    "py-2.5 px-4 rounded-xl shadow-md shadow-[#1A56DB]/20",
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
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[#F1F5F9] border border-[#E2E8F0]">
        <ShoppingCart className="w-7 h-7 text-[#94A3B8]" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-[#0F172A]">El carrito está vacío</p>
        <p className="text-xs text-[#64748B]">
          Agregá productos del catálogo para armar tu consulta.
        </p>
      </div>
      <Link
        href="/products"
        onClick={onClose}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F172A] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1A56DB] transition-colors"
      >
        Ver catálogo →
      </Link>
    </div>
  );
}
