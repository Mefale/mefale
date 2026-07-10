import type { Product } from "@/types/product";

/** % de descuento entero (ej: 15) o null si no aplica. */
export function discountPercent(product: Product): number | null {
  if (!product.discountPrice || product.discountPrice >= product.price) return null;
  const pct = Math.round((1 - product.discountPrice / product.price) * 100);
  return pct > 0 ? pct : null;
}
