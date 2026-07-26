"use server";

import { getProducts } from "@/lib/sheets/products";

export type CartPriceInfo = {
  sku: string;
  /** false si el producto ya no está en el catálogo. */
  exists: boolean;
  name: string;
  /** Precio vigente (con descuento aplicado si corresponde). */
  price: number;
  inStock: boolean;
};

/**
 * Devuelve el precio/nombre/stock VIGENTE de cada SKU del carrito.
 *
 * El carrito se persiste en localStorage con el precio congelado al momento de
 * agregar; si el dueño actualiza precios en Sheets, el carrito guardado quedaba
 * desactualizado indefinidamente. El cliente llama a esto al abrir el carrito
 * para reconciliar contra el catálogo (que ya está cacheado, así que es barato).
 */
export async function getCartPrices(skus: string[]): Promise<CartPriceInfo[]> {
  const products = await getProducts();
  const bySku = new Map(products.map((p) => [p.sku.toLowerCase(), p]));

  return skus.map((sku) => {
    const p = bySku.get(sku.toLowerCase());
    if (!p) {
      return { sku, exists: false, name: "", price: 0, inStock: false };
    }
    return {
      sku,
      exists: true,
      name: p.name,
      price: p.discountPrice ?? p.price,
      inStock: p.stock > 0,
    };
  });
}
