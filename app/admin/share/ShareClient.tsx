"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, X, Plus, Trash2, MessageCircle, Copy, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/utils/format-price";
import {
  buildProductShareMessage,
  buildWhatsAppUrlForNumber,
} from "@/lib/whatsapp/build-message";
import type { Product } from "@/types/product";

const DEFAULT_INTRO = "¡Hola! Te paso estas opciones:";

interface Props {
  products: Product[];
}

export default function ShareClient({ products }: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product[]>([]);
  const [phone, setPhone] = useState("");
  const [intro, setIntro] = useState(DEFAULT_INTRO);

  // Resultados del buscador: por nombre/SKU, excluyendo los ya elegidos.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const chosen = new Set(selected.map((p) => p.id));
    return products
      .filter(
        (p) =>
          !chosen.has(p.id) &&
          (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [query, products, selected]);

  const message = useMemo(
    () =>
      buildProductShareMessage(
        selected.map((p) => ({
          sku: p.sku,
          name: p.name,
          price: p.price,
          discountPrice: p.discountPrice,
        })),
        intro
      ),
    [selected, intro]
  );

  function addProduct(product: Product) {
    setSelected((prev) =>
      prev.some((p) => p.id === product.id) ? prev : [...prev, product]
    );
    setQuery("");
  }

  function removeProduct(id: string) {
    setSelected((prev) => prev.filter((p) => p.id !== id));
  }

  function handleSend() {
    if (selected.length === 0) {
      toast.error("Agregá al menos un producto.");
      return;
    }
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 8) {
      toast.error("Ingresá un número de WhatsApp válido", {
        description: "Con código de país, ej: 5493571234567.",
      });
      return;
    }
    const url = buildWhatsAppUrlForNumber(message, phone);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function handleCopy() {
    if (selected.length === 0) {
      toast.error("Agregá al menos un producto.");
      return;
    }
    try {
      await navigator.clipboard.writeText(message);
      toast.success("Mensaje copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar el mensaje.");
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Columna izquierda: buscar + seleccionados */}
      <div className="flex flex-col gap-5">
        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar producto por nombre o código…"
            className="w-full bg-white border border-[#E2E8F0] shadow-sm rounded-lg pl-10 pr-10 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1A56DB] focus:ring-4 focus:ring-[#1A56DB]/10 transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 -m-1 text-[#94A3B8] hover:text-[#0F172A] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Dropdown de resultados */}
          {results.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full max-h-72 overflow-y-auto rounded-lg border border-[#E2E8F0] bg-white shadow-lg">
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => addProduct(p)}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-[#F1F5F9] transition-colors"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-[#0F172A]">{p.name}</span>
                      <span className="block text-[11px] font-mono uppercase tracking-wider text-[#94A3B8]">
                        {p.sku}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-semibold text-[#0F172A] tabular-nums">
                        {formatPrice(p.discountPrice ?? p.price)}
                      </span>
                      <Plus className="w-4 h-4 text-[#1A56DB]" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Seleccionados */}
        <div>
          <p className="text-sm font-medium text-[#0F172A] mb-2">
            Seleccionados{" "}
            <span className="text-[#94A3B8] tabular-nums">({selected.length})</span>
          </p>

          {selected.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#E2E8F0] px-4 py-10 text-center text-sm text-[#94A3B8]">
              Agregá productos para compartir.
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {selected.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-[#0F172A]">{p.name}</span>
                    <span className="block text-[11px] font-mono uppercase tracking-wider text-[#94A3B8]">
                      {p.sku}
                    </span>
                  </span>
                  <span className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold text-[#0F172A] tabular-nums">
                      {formatPrice(p.discountPrice ?? p.price)}
                    </span>
                    <button
                      onClick={() => removeProduct(p.id)}
                      aria-label={`Quitar ${p.name}`}
                      className="p-1 rounded text-[#94A3B8] hover:text-[#DC2626] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Columna derecha: mensaje + envío */}
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="share-intro" className="block text-sm font-medium text-[#0F172A] mb-1.5">
            Mensaje de saludo
          </label>
          <textarea
            id="share-intro"
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            rows={2}
            className="w-full bg-white border border-[#E2E8F0] shadow-sm rounded-lg px-3 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1A56DB] focus:ring-4 focus:ring-[#1A56DB]/10 transition-colors resize-none"
          />
        </div>

        <div>
          <label htmlFor="share-phone" className="block text-sm font-medium text-[#0F172A] mb-1.5">
            WhatsApp del cliente
          </label>
          <input
            id="share-phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ej: 5493571234567"
            className="w-full bg-white border border-[#E2E8F0] shadow-sm rounded-lg px-3 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1A56DB] focus:ring-4 focus:ring-[#1A56DB]/10 transition-colors"
          />
          <p className="mt-1 text-xs text-[#94A3B8]">
            Con código de país, sin espacios ni el signo +.
          </p>
        </div>

        <div>
          <p className="block text-sm font-medium text-[#0F172A] mb-1.5">Vista previa</p>
          <textarea
            readOnly
            value={message}
            rows={8}
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm text-[#475569] font-mono resize-none"
          />
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2.5 text-xs text-blue-800">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            WhatsApp muestra la tarjeta con foto de un solo link por mensaje. Los
            demás llegan igual como links clickeables (cada uno abre su ficha).
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleSend}
            className="flex-1 flex items-center justify-center gap-2 bg-[#1A56DB] hover:bg-[#1447C0] active:scale-[0.99] text-white font-semibold text-sm py-2.5 px-4 rounded-lg shadow-md shadow-[#1A56DB]/20 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            Enviar por WhatsApp
          </button>
          <button
            onClick={handleCopy}
            className={cn(
              "flex items-center justify-center gap-2 text-sm font-medium py-2.5 px-4 rounded-lg border transition-colors",
              "border-[#E2E8F0] bg-white text-[#475569] hover:text-[#0F172A] hover:border-[#CBD5E1]"
            )}
          >
            <Copy className="w-4 h-4" />
            Copiar mensaje
          </button>
        </div>
      </div>
    </div>
  );
}
