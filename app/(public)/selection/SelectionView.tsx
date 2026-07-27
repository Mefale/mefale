"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductModal } from "@/components/product/ProductModal";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/types/product";

type Props = {
  products: Product[];
};

/**
 * Vista de una selección compartida: mismo grid/modal del catálogo, sin
 * toolbar ni paginación, más un atajo para cargar todo al carrito.
 */
export function SelectionView({ products }: Props) {
  const [selected, setSelected] = useState<Product | null>(null);
  const { add, openDrawer } = useCart();
  const close = useCallback(() => setSelected(null), []);

  function handleAddAll() {
    const available = products.filter((p) => p.stock > 0);
    if (available.length === 0) {
      toast.error("No hay productos disponibles para agregar.");
      return;
    }
    available.forEach((p) => add(p));
    toast.success(
      available.length === 1
        ? "Producto agregado al carrito"
        : `${available.length} productos agregados al carrito`
    );
    openDrawer();
  }

  return (
    <>
      <div className="mb-6">
        <button
          onClick={handleAddAll}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1A56DB] hover:bg-[#1447C0] active:scale-[0.99] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#1A56DB]/20 transition-all"
        >
          <ShoppingCart className="w-4 h-4" />
          Agregar todo al carrito
        </button>
      </div>

      <ProductGrid products={products} onSelect={setSelected} />

      <ProductModal product={selected} onClose={close} />
    </>
  );
}
