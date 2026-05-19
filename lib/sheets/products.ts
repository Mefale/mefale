import { unstable_cache } from "next/cache";
import { getSheetsClient } from "./client";
import type { Product } from "@/types/product";

// Columns: A=SKU, B=Category, C=Name/Description, D=Price
const RANGE = "A2:D";

function getImageUrl(sku: string): string {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloud) return "";
  return `https://res.cloudinary.com/${cloud}/image/upload/mefale/products/${sku}.jpg`;
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
  const [sku, category, name, priceRaw] = row;
  if (!sku?.trim() || !name?.trim()) return null;

  const price = parsePrice(priceRaw ?? "");
  if (price <= 0) return null;

  const skuClean = sku.trim();

  return {
    id: skuClean.toLowerCase(),
    sku: skuClean,
    name: name.trim(),
    description: "",
    price,
    images: [getImageUrl(skuClean)],
    category: category?.trim() ?? "Uncategorized",
    brand: "",
    stock: 1,
    tags: [],
    featured: false,
    createdAt: "",
    updatedAt: "",
  };
}

export const getProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: RANGE,
    });

    const rows = res.data.values ?? [];
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
);

export const getCategories = unstable_cache(
  async (): Promise<string[]> => {
    const products = await getProducts();
    const seen = new Set<string>();
    return products
      .map((p) => p.category)
      .filter((c) => {
        if (!c || seen.has(c)) return false;
        seen.add(c);
        return true;
      });
  },
  ["categories"],
  { revalidate: 3600, tags: ["categories"] }
);
