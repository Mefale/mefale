"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductModal } from "@/components/product/ProductModal";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp/build-message";
import { formatPrice } from "@/utils/format-price";
import type { Product } from "@/types/product";
import type { CartItem } from "@/types/cart";

type Props = {
  products: Product[];
};

function toCartItem(product: Product, quantity: number): CartItem {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    price: product.discountPrice ?? product.price,
    image: product.images[0],
    quantity,
    isOffer: product.offer || !!product.discountPrice,
  };
}

/**
 * Vista de una selección compartida: mismo grid/modal del catálogo, sin
 * toolbar ni paginación. El cliente elige la cantidad de cada producto y
 * envía la consulta por WhatsApp al número de la tienda.
 */
export function SelectionView({ products }: Props) {
  const [selected, setSelected] = useState<Product | null>(null);
  const [quantities, setQuantities] = useState<Map<string, number>>(new Map());
  const close = useCallback(() => setSelected(null), []);

  const handleQuantityChange = useCallback((product: Product, quantity: number) => {
    setQuantities((prev) => {
      const next = new Map(prev);
      if (quantity <= 0) next.delete(product.id);
      else next.set(product.id, quantity);
      return next;
    });
  }, []);

  const chosen = useMemo(
    () =>
      products
        .map((p) => ({ product: p, quantity: quantities.get(p.id) ?? 0 }))
        .filter((entry) => entry.quantity > 0),
    [products, quantities]
  );

  const units = chosen.reduce((acc, e) => acc + e.quantity, 0);
  const total = chosen.reduce(
    (acc, e) => acc + (e.product.discountPrice ?? e.product.price) * e.quantity,
    0
  );

  function handleSend() {
    if (chosen.length === 0) {
      toast.error("Elegí la cantidad de al menos un producto.");
      return;
    }
    const message = buildWhatsAppMessage(
      chosen.map((e) => toCartItem(e.product, e.quantity))
    );
    window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <ProductGrid
        products={products}
        onSelect={setSelected}
        selectable
        quantities={quantities}
        onQuantityChange={handleQuantityChange}
      />

      {/* Espacio para que la barra fija no tape la última fila */}
      <div className="h-24" />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E2E8F0] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#0F172A]">
              {chosen.length === 0
                ? "Sin productos seleccionados"
                : `${chosen.length} ${chosen.length === 1 ? "producto" : "productos"} · ${units} ${units === 1 ? "unidad" : "unidades"}`}
            </p>
            <p className="text-xs text-[#64748B] tabular-nums">
              Total estimado: {formatPrice(total)}
            </p>
          </div>

          <button
            onClick={handleSend}
            disabled={chosen.length === 0}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1A56DB] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#1A56DB]/20 transition-all hover:bg-[#1447C0] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#CBD5E1] disabled:shadow-none"
          >
            <Send className="w-4 h-4" />
            Enviar
          </button>
        </div>
      </div>

      <ProductModal product={selected} onClose={close} />
    </>
  );
}
