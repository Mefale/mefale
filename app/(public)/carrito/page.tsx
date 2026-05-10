"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, MessageCircle, ShoppingCart, ArrowLeft } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { useCart, useCartHydrated } from "@/hooks/use-cart";
import { formatPrice } from "@/utils/format-price";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp/build-message";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";

const customerSchema = z.object({
  nombre: z.string().optional(),
});
type CustomerForm = z.infer<typeof customerSchema>;

export default function CarritoPage() {
  const { items, remove, setQuantity, subtotal, clear } = useCart();
  const hydrated = useCartHydrated();
  const { register, getValues } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
  });

  function handleWhatsApp() {
    const { nombre } = getValues();
    const message = buildWhatsAppMessage(items, { nombre });
    window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
  }

  if (!hydrated) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <Container>
          <div className="h-64 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-[#1A56DB] border-t-transparent animate-spin" />
          </div>
        </Container>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <Container>
          <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
            <div className="p-6 rounded-2xl bg-[#F8F9FA] border border-[#D1D5DB]/60">
              <ShoppingCart className="w-10 h-10 text-[#6B7280]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#111827]">El carrito está vacío</h1>
              <p className="text-[#6B7280] text-sm mt-1">
                Agregá productos del catálogo para armar tu consulta.
              </p>
            </div>
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 text-sm text-[#1A56DB] hover:text-[#1447C0] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Ver catálogo
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <Container>
        <div className="mb-8 flex items-center gap-3">
          <Link
            href="/productos"
            className="p-2 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F1F3F5] transition-colors"
            aria-label="Volver al catálogo"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-bold text-[#111827]">Tu carrito</h1>
          <span className="text-sm text-[#6B7280]">({items.length} {items.length === 1 ? "producto" : "productos"})</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 rounded-xl bg-[#F8F9FA] border border-[#D1D5DB]/60"
              >
                <div className="relative w-20 h-20 rounded-lg bg-[#F1F3F5] overflow-hidden shrink-0">
                  {item.imagen ? (
                    <Image src={item.imagen} alt={item.nombre} fill sizes="80px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-[#6B7280] opacity-30" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] text-[#6B7280] font-mono uppercase tracking-wider">{item.sku}</p>
                      <p className="text-sm font-medium text-[#111827] leading-snug">{item.nombre}</p>
                    </div>
                    <button
                      onClick={() => remove(item.id)}
                      aria-label={`Eliminar ${item.nombre}`}
                      className="p-1 rounded text-[#6B7280] hover:text-[#EF4444] transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center rounded-lg border border-[#D1D5DB]/60 bg-[#F1F3F5] overflow-hidden">
                      <button
                        onClick={() => setQuantity(item.id, item.cantidad - 1)}
                        aria-label="Reducir"
                        className="px-3 py-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#D1D5DB]/60 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 py-2 text-sm text-[#111827] tabular-nums min-w-[2.5rem] text-center">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => setQuantity(item.id, item.cantidad + 1)}
                        aria-label="Aumentar"
                        className="px-3 py-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#D1D5DB]/60 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-[#111827] tabular-nums">
                      {formatPrice(item.precio * item.cantidad)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={clear}
              className="self-start text-xs text-[#6B7280] hover:text-[#EF4444] transition-colors mt-1"
            >
              Vaciar carrito
            </button>
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 flex flex-col gap-4 p-5 rounded-xl bg-[#F8F9FA] border border-[#D1D5DB]/60">
              <h2 className="font-semibold text-[#111827]">Resumen</h2>

              <div className="flex items-center justify-between text-sm border-t border-[#D1D5DB]/40 pt-3">
                <span className="text-[#6B7280]">Total estimado</span>
                <span className="text-xl font-bold text-[#111827] tabular-nums">
                  {formatPrice(subtotal())}
                </span>
              </div>

              {/* Datos opcionales */}
              <div className="flex flex-col gap-2">
                <p className="text-xs text-[#6B7280]">Datos opcionales</p>
                <input
                  {...register("nombre")}
                  placeholder="Tu nombre"
                  className="w-full bg-[#F1F3F5] border border-[#D1D5DB]/60 rounded-lg px-3 py-2.5 text-sm text-[#111827] placeholder:text-[#6B7280]/60 focus:outline-none focus:border-[#1A56DB]/60 transition-colors"
                />
              </div>

              <button
                onClick={handleWhatsApp}
                className={cn(
                  "w-full flex items-center justify-center gap-2",
                  "bg-[#1A56DB] hover:bg-[#1447C0] active:scale-[0.98]",
                  "text-[#FFFFFF] font-semibold text-sm",
                  "py-3 px-4 rounded-xl transition-all duration-150"
                )}
              >
                <MessageCircle className="w-4 h-4" />
                Consultar por WhatsApp
              </button>

              <p className="text-center text-[10px] text-[#6B7280]/70">
                El precio final lo confirma el vendedor por WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
