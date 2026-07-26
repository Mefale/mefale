import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/sheets/products";
import { SITE_URL, productUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let productEntries: MetadataRoute.Sitemap = [];

  try {
    const products = await getProducts();
    productEntries = products.map((p) => ({
      url: productUrl(p.sku),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // Si Sheets falla, devolvemos al menos las páginas principales.
  }

  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: "daily", priority: 0.9 },
    ...productEntries,
  ];
}
