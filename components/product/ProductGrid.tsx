import { Package } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types/product";

type Props = {
  products: Product[];
  onSelect?: (product: Product) => void;
  /** Modo selección: cada card muestra un selector de cantidad local. */
  selectable?: boolean;
  quantities?: Map<string, number>;
  onQuantityChange?: (product: Product, quantity: number) => void;
};

export function ProductGrid({
  products,
  onSelect,
  selectable = false,
  quantities,
  onQuantityChange,
}: Props) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC]">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white border border-[#E2E8F0] shadow-sm">
          <Package className="w-6 h-6 text-[#94A3B8]" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-[#0F172A]">No hay productos disponibles</p>
          <p className="text-sm text-[#64748B]">Probá con otra categoría o término de búsqueda.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          index={i}
          onSelect={onSelect}
          selectable={selectable}
          quantity={quantities?.get(product.id) ?? 0}
          onQuantityChange={onQuantityChange}
        />
      ))}
    </div>
  );
}
