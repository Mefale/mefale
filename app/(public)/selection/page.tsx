import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { getProducts } from "@/lib/sheets/products";
import { parseSelectionParam, SITE_NAME } from "@/lib/site";
import { CatalogError } from "@/components/product/CatalogError";
import { SelectionView } from "./SelectionView";
import type { Product } from "@/types/product";

type Props = {
  searchParams: Promise<{ p?: string }>;
};

/** Resuelve los SKU del link contra el catálogo, preservando el orden. */
async function resolveSelection(p?: string): Promise<Product[]> {
  const skus = parseSelectionParam(p);
  if (skus.length === 0) return [];

  const products = await getProducts();
  const bySku = new Map(products.map((prod) => [prod.sku.toLowerCase(), prod]));

  return skus
    .map((sku) => bySku.get(sku.toLowerCase()))
    .filter((prod): prod is Product => prod !== undefined);
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { p } = await searchParams;

  let products: Product[] = [];
  try {
    products = await resolveSelection(p);
  } catch {
    // Si Sheets falla, devolvemos metadata genérica.
  }

  if (products.length === 0) {
    return {
      title: "Selección de productos",
      // Links privados armados para un cliente puntual: no indexar.
      robots: { index: false, follow: false },
    };
  }

  const title = `${products.length} ${products.length === 1 ? "producto seleccionado" : "productos seleccionados"} para vos`;
  const names = products.slice(0, 3).map((prod) => prod.name).join(", ");
  const description =
    products.length > 3
      ? `${names} y ${products.length - 3} más. Mirá las opciones que preparamos en ${SITE_NAME}.`
      : `${names}. Mirá las opciones que preparamos en ${SITE_NAME}.`;
  const image = products.map((prod) => prod.images[0]).find(Boolean);

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      type: "website",
      title,
      description,
      images: image ? [{ url: image, alt: title }] : undefined,
    },
  };
}

export default async function SelectionPage({ searchParams }: Props) {
  const { p } = await searchParams;

  let products: Product[];
  try {
    products = await resolveSelection(p);
  } catch {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <Container>
          <CatalogError />
        </Container>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <Container>
          <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-[#F1F5F9] border border-[#E2E8F0]">
              <PackageSearch className="w-9 h-9 text-[#94A3B8]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F172A]">
                No encontramos esta selección
              </h1>
              <p className="text-[#64748B] text-sm mt-1">
                El link puede estar incompleto o los productos ya no están disponibles.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-[#0F172A] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1A56DB] transition-colors"
            >
              Ver el catálogo completo
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <Container>
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Productos seleccionados
          </h1>
          <p className="mt-1.5 text-sm text-[#64748B]">
            {products.length} {products.length === 1 ? "producto" : "productos"} ·
            Agregá los que te interesen y consultanos por WhatsApp.
          </p>
        </div>

        <SelectionView products={products} />
      </Container>
    </div>
  );
}
