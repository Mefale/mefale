import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getSheetsClient } from "./client";
import type { Product } from "@/types/product";

// Columns: A=SKU, B=Category, C=Name/Description, D=Price, E=DiscountPrice, F=Offer, G=ImageUrl
const RANGE = "A2:G";

function parseImageUrl(raw: string | undefined): string | undefined {
  const trimmed = raw?.trim();
  if (!trimmed) return undefined;
  try {
    const u = new URL(trimmed);
    return u.protocol === "http:" || u.protocol === "https:" ? trimmed : undefined;
  } catch {
    return undefined;
  }
}

function parsePrice(raw: string): number {
  // Sheets puede devolver "1200.50" (formato US numérico) o "$1.200,50" (texto AR).
  // Si hay coma, asumimos formato AR: punto = miles, coma = decimal.
  // Si no hay coma, asumimos que el punto es decimal (caso por defecto de Sheets).
  const clean = raw.replace(/[$ ]/g, "");
  if (!clean) return 0;
  const normalized = clean.includes(",")
    ? clean.replace(/\./g, "").replace(",", ".")
    : clean;
  const n = parseFloat(normalized);
  return isNaN(n) ? 0 : n;
}

function rowToProduct(row: string[]): Product | null {
  const [sku, category, name, priceRaw, discountPriceCol, offerCol, imageUrlCol] = row;
  if (!sku?.trim() || !name?.trim()) return null;

  const price = parsePrice(priceRaw ?? "");
  if (price <= 0) return null;

  const skuClean = sku.trim();

  const discountPriceRaw = discountPriceCol?.trim();
  const discountPrice =
    discountPriceRaw ? parsePrice(discountPriceRaw) : undefined;

  const imageUrl = parseImageUrl(imageUrlCol);

  return {
    id: skuClean.toLowerCase(),
    sku: skuClean,
    name: name.trim(),
    description: "",
    price,
    discountPrice: discountPrice && discountPrice > 0 && discountPrice < price
      ? discountPrice
      : undefined,
    images: imageUrl ? [imageUrl] : [],
    category: category?.trim() ?? "Uncategorized",
    brand: "",
    stock: 1,
    tags: [],
    featured: false,
    offer: offerCol?.trim().toLowerCase() === "x",
    createdAt: "",
    updatedAt: "",
  };
}

async function fetchSheetRows(): Promise<string[][]> {
  const sheets = getSheetsClient();
  const MAX_ATTEMPTS = 3;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await sheets.spreadsheets.values.get(
        { spreadsheetId: process.env.GOOGLE_SHEETS_ID, range: RANGE },
        { timeout: 8000 }
      );
      return res.data.values ?? [];
    } catch (err) {
      console.error(
        `[getProducts] intento ${attempt}/${MAX_ATTEMPTS} falló:`,
        err
      );
      if (attempt < MAX_ATTEMPTS) {
        // Backoff simple para fallos transitorios (429 / timeout / red).
        await new Promise((r) => setTimeout(r, attempt * 500));
      }
    }
  }

  // IMPORTANTE: lanzar, NO devolver []. Si devolviéramos un array vacío,
  // unstable_cache cachearía "0 productos" hasta 1h y el catálogo quedaría
  // vacío intermitentemente. Al lanzar, el cache no se envenena y se reintenta
  // en el próximo request.
  throw new Error("No se pudieron obtener los productos de Google Sheets");
}

// cache() dedupea llamadas concurrentes dentro del mismo request (p.ej. getProducts()
// y getCategories() en el mismo Promise.all, o generateMetadata + página en /products/[sku]).
// unstable_cache por sí solo NO deduplica llamadas concurrentes en frío, solo evita
// llamadas repetidas una vez que ya hay un valor cacheado entre requests.
export const getProducts = cache(
  unstable_cache(
    async (): Promise<Product[]> => {
      const rows = await fetchSheetRows();
      const seen = new Set<string>();
      return rows
        .map(rowToProduct)
        .filter((p): p is Product => {
          if (p === null) return false;
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });
    },
    ["products"],
    { revalidate: 3600, tags: ["products"] }
  )
);

// Busca un producto por SKU (case-insensitive). Deriva de getProducts (cacheado),
// así la ficha individual no golpea Sheets en cada request.
export async function getProductBySku(sku: string): Promise<Product | undefined> {
  const target = sku.trim().toLowerCase();
  const products = await getProducts();
  return products.find((p) => p.sku.toLowerCase() === target || p.id === target);
}

// NO envolver en unstable_cache: llamar a otra función cacheada (getProducts)
// dentro de unstable_cache falla en producción y devuelve vacío. Como getProducts
// ya está cacheado, derivamos las categorías directo de su resultado.
export async function getCategories(): Promise<string[]> {
  const products = await getProducts();
  const seen = new Set<string>();
  return products
    .map((p) => p.category)
    .filter((c) => {
      if (!c || seen.has(c)) return false;
      seen.add(c);
      return true;
    });
}
