import type { Product } from "@/types/product";

export const CATALOG_PAGE_SIZE = 40;

export type CatalogSort = "price-asc" | "price-desc";

export type CatalogQuery = {
  category?: string;
  brand?: string;
  q?: string;
  page: number;
  sort?: CatalogSort;
};

/** Precio efectivo (con descuento si aplica), usado para ordenar. */
function effectivePrice(p: { price: number; discountPrice?: number }): number {
  return p.discountPrice ?? p.price;
}

export type CatalogResult = {
  items: Product[];
  total: number;
  totalPages: number;
  page: number;
};

/**
 * Filtra por categoría + búsqueda y devuelve SOLO la página pedida.
 * Corre en el servidor: así al cliente cruzan ~40 productos en vez de miles.
 */
export function queryProducts(
  products: Product[],
  { category, brand, q, page, sort }: CatalogQuery
): CatalogResult {
  let list = category ? products.filter((p) => p.category === category) : products;
  if (brand) list = list.filter((p) => p.brand === brand);

  const query = q?.toLowerCase().trim();
  if (query) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query)
    );
  }

  if (sort === "price-asc" || sort === "price-desc") {
    // Copiar antes de ordenar: `list` puede ser el array cacheado de getProducts
    // y no debemos mutarlo.
    const dir = sort === "price-asc" ? 1 : -1;
    list = [...list].sort((a, b) => (effectivePrice(a) - effectivePrice(b)) * dir);
  }

  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
  const current = Math.min(Math.max(1, page), totalPages);
  const items = list.slice(
    (current - 1) * CATALOG_PAGE_SIZE,
    current * CATALOG_PAGE_SIZE
  );

  return { items, total, totalPages, page: current };
}
