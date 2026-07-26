"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, MessageCircle, ShoppingCart, ArrowLeft } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { toast } from "sonner";
import { useCart, useCartHydrated } from "@/hooks/use-cart";
import { formatPrice } from "@/utils/format-price";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp/build-message";
import { trackOrder } from "@/lib/orders/track-order";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";

const customerSchema = z.object({
  name: z.string().optional(),
});
type CustomerForm = z.infer<typeof customerSchema>;

export default function CartPage() {
  const { items, remove, setQuantity, subtotal, clear } = useCart();
  const hydrated = useCartHydrated();
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const { register, getValues } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
  });

  const handleImgError = (itemId: string) => {
    setImgErrors(prev => new Set([...prev, itemId]));
  };

  function handleWhatsApp() {
    const { name } = getValues();
    const message = buildWhatsAppMessage(items, { name });
    window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");

    // Registrar el pedido en Sheets (igual que el drawer). Antes esta vista NO
    // registraba nada, así que los pedidos desde /cart se perdían.
    trackOrder({
      customerName: name ?? "",
      phone: "-",
      items: items.map((i) => ({
        sku: i.sku,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
      total: subtotal(),
      discountPercentage: 0,
    }).then((ok) => {
      if (!ok) {
        toast.error("No pudimos registrar tu pedido", {
          description: "Enviá igual el mensaje de WhatsApp y te confirmamos.",
        });
      }
    });
  }

  if (!hydrated) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <Container>
          <div className="h-64 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full border-[3px] border-[#E2E8F0] border-t-[#1A56DB] animate-spin" />
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
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-[#F1F5F9] border border-[#E2E8F0]">
              <ShoppingCart className="w-9 h-9 text-[#94A3B8]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F172A]">El carrito está vacío</h1>
              <p className="text-[#64748B] text-sm mt-1">
                Agregá productos del catálogo para armar tu consulta.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-[#0F172A] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1A56DB] transition-colors"
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
            href="/products"
            className="p-2 rounded-lg border border-[#E2E8F0] bg-white text-[#475569] hover:text-[#0F172A] hover:border-[#CBD5E1] transition-colors"
            aria-label="Volver al catálogo"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Tu carrito</h1>
          <span className="text-sm text-[#64748B]">({items.length} {items.length === 1 ? "producto" : "productos"})</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-sm hover:border-[#CBD5E1] transition-colors"
              >
                <div className="relative w-20 h-20 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] overflow-hidden shrink-0">
                  {item.image && !imgErrors.has(item.id) && (
                    <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" onError={() => handleImgError(item.id)} />
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] text-[#94A3B8] font-mono uppercase tracking-wider">{item.sku}</p>
                      <p className="text-sm font-semibold text-[#0F172A] leading-snug">{item.name}</p>
                    </div>
                    <button
                      onClick={() => remove(item.id)}
                      aria-label={`Eliminar ${item.name}`}
                      className="p-1 rounded text-[#94A3B8] hover:text-[#DC2626] transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] overflow-hidden">
                      <button
                        onClick={() => setQuantity(item.id, item.quantity - 1)}
                        aria-label="Reducir"
                        className="px-3 py-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 py-2 text-sm font-semibold text-[#0F172A] tabular-nums min-w-[2.5rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(item.id, item.quantity + 1)}
                        aria-label="Aumentar"
                        className="px-3 py-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-[#0F172A] tabular-nums">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={clear}
              className="self-start text-xs font-medium text-[#64748B] hover:text-[#DC2626] transition-colors mt-1"
            >
              Vaciar carrito
            </button>
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 flex flex-col gap-4 p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-sm">
              <h2 className="font-bold text-[#0F172A] flex items-center gap-2.5">
                <span className="h-5 w-1.5 rounded-full bg-[#1A56DB]" />
                Resumen
              </h2>

              <div className="flex items-baseline justify-between border-t border-[#F1F5F9] pt-4">
                <span className="text-sm text-[#64748B]">Total estimado</span>
                <span className="text-2xl font-extrabold text-[#0F172A] tabular-nums">
                  {formatPrice(subtotal())}
                </span>
              </div>

              {/* Datos opcionales */}
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-[#64748B]">Datos opcionales</p>
                <input
                  {...register("name")}
                  placeholder="Tu nombre"
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1A56DB] focus:ring-4 focus:ring-[#1A56DB]/10 transition-colors"
                />
              </div>

              <button
                onClick={handleWhatsApp}
                className={cn(
                  "w-full flex items-center justify-center gap-2",
                  "bg-[#1A56DB] hover:bg-[#1447C0] active:scale-[0.98]",
                  "text-white font-semibold text-sm",
                  "py-3 px-4 rounded-xl shadow-md shadow-[#1A56DB]/20 transition-all duration-150"
                )}
              >
                <MessageCircle className="w-4 h-4" />
                Consultar por WhatsApp
              </button>

              <p className="text-center text-[10px] text-[#94A3B8]">
                El precio final lo confirma el vendedor por WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
