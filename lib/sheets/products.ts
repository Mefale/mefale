import { unstable_cache } from "next/cache";
import { getSheetsClient } from "./client";
import type { Product } from "@/types/product";

// Columns: A=SKU, B=Categoria, C=Nombre/Descripcion, D=Precio
const RANGE = "A2:D";

function getImageUrl(sku: string): string {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloud) return "";
  return `https://res.cloudinary.com/${cloud}/image/upload/mefale/products/${sku}.jpg`;
}

function parsePrice(raw: string): number {
  // Handles formats like "$1.200,50", "1200.50", "1,200"
  const cleaned = raw.replace(/[$ ]/g, "").replace(/\.(?=\d{3})/g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function rowToProduct(row: string[]): Product | null {
  const [sku, categoria, nombre, precioRaw] = row;
  if (!sku?.trim() || !nombre?.trim()) return null;

  const precio = parsePrice(precioRaw ?? "");
  if (precio <= 0) return null;

  const skuClean = sku.trim();

  return {
    id: skuClean.toLowerCase(),
    sku: skuClean,
    nombre: nombre.trim(),
    descripcion: "",
    precio,
    imagenes: [getImageUrl(skuClean)],
    categoria: categoria?.trim() ?? "Sin categoría",
    marca: "",
    stock: 1,
    etiquetas: [],
    destacado: false,
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
      .map((p) => p.categoria)
      .filter((c) => {
        if (!c || seen.has(c)) return false;
        seen.add(c);
        return true;
      });
  },
  ["categories"],
  { revalidate: 3600, tags: ["categories"] }
);
