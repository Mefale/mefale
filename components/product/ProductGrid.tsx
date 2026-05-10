import { ProductCard } from "./ProductCard";
import type { Product } from "@/types/product";

type Props = {
  products: Product[];
  onSelect?: (product: Product) => void;
};

export function ProductGrid({ products, onSelect }: Props) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="text-4xl opacity-20">📦</div>
        <p className="text-[#6B7280]">No hay productos disponibles.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} index={i} onSelect={onSelect} />
      ))}
    </div>
  );
}
