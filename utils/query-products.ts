import type { Product } from "@/types/product";

export const CATALOG_PAGE_SIZE = 40;

export type CatalogQuery = {
  category?: string;
  q?: string;
  page: number;
};

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
  { category, q, page }: CatalogQuery
): CatalogResult {
  let list = category ? products.filter((p) => p.category === category) : products;

  const query = q?.toLowerCase().trim();
  if (query) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query)
    );
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
