import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { ProductCatalog } from "@/components/product/ProductCatalog";
import { ProductGridSkeleton } from "@/components/product/ProductGridSkeleton";
import { SectionHeader } from "@/components/common/SectionHeader";
import { OffersSection } from "@/components/product/OffersSection";
import { CatalogError } from "@/components/product/CatalogError";
import { getProducts, getCategories } from "@/lib/sheets/products";
import { queryProducts } from "@/utils/query-products";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Todos los productos de Distribuidora Graser: cables, luminarias, herramientas, componentes y más.",
};

type Props = {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
};

async function CatalogSection({
  category,
  q,
  page,
}: {
  category?: string;
  q?: string;
  page: number;
}) {
  let products, categories;
  try {
    [products, categories] = await Promise.all([getProducts(), getCategories()]);
  } catch {
    return (
      <Container>
        <CatalogError />
      </Container>
    );
  }

  const offerProducts = products.filter((p) => p.offer);
  const result = queryProducts(products, { category, q, page });
  const showOffers = !category && !q && offerProducts.length > 0;

  return (
    <>
      {showOffers && <OffersSection products={offerProducts} />}

      <Container>
        <div className={showOffers ? "pt-10" : ""}>
          {/* Header */}
          <div className="mb-8">
            <SectionHeader
              title={category ?? "Catálogo"}
              subtitle={`${result.total} productos disponibles`}
            />
          </div>

          {/* Catalog: toolbar (categoría + búsqueda) + grid + pagination */}
          <ProductCatalog
            products={result.items}
            total={result.total}
            totalPages={result.totalPages}
            page={result.page}
            query={q ?? ""}
            category={category}
            categories={categories}
          />
        </div>
      </Container>
    </>
  );
}

export default async function ProductsPage({ searchParams }: Props) {
  const { category, q, page } = await searchParams;
  const pageNum = Number(page) || 1;

  return (
    <div className="pt-24 pb-16 overflow-x-hidden">
      <Suspense
        key={category ?? "all"}
        fallback={
          <Container>
            <div className="mb-8 flex flex-col gap-2">
              <div className="h-8 w-48 rounded bg-[#F1F5F9] animate-pulse" />
              <div className="h-4 w-40 rounded bg-[#F1F5F9] animate-pulse" />
            </div>
            <div className="mb-8 flex flex-col sm:flex-row gap-2">
              <div className="h-11 sm:w-64 lg:w-72 rounded-lg bg-[#F1F5F9] animate-pulse" />
              <div className="h-11 flex-1 rounded-lg bg-[#F1F5F9] animate-pulse" />
            </div>
            <ProductGridSkeleton />
          </Container>
        }
      >
        <CatalogSection category={category} q={q} page={pageNum} />
      </Suspense>
    </div>
  );
}
