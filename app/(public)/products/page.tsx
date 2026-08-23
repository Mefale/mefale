import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { ProductCatalog } from "@/components/product/ProductCatalog";
import { ProductGridSkeleton } from "@/components/product/ProductGridSkeleton";
import { SectionHeader } from "@/components/common/SectionHeader";
import { OffersSection } from "@/components/product/OffersSection";
import { CatalogError } from "@/components/product/CatalogError";
import { getProducts, getCategories, getBrands } from "@/lib/sheets/products";
import { queryProducts, type CatalogSort } from "@/utils/query-products";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Todos los productos de Distribuidora Graser: cables, luminarias, herramientas, componentes y más.",
};

type Props = {
  searchParams: Promise<{ category?: string; brand?: string; q?: string; page?: string; sort?: string }>;
};

async function CatalogSection({
  category,
  brand,
  q,
  page,
  sort,
}: {
  category?: string;
  brand?: string;
  q?: string;
  page: number;
  sort?: string;
}) {
  let products, categories, brands;
  try {
    [products, categories, brands] = await Promise.all([
      getProducts(),
      getCategories(),
      getBrands(),
    ]);
  } catch {
    return (
      <Container>
        <CatalogError />
      </Container>
    );
  }

  const offerProducts = products.filter((p) => p.offer);
  const result = queryProducts(products, { category, brand, q, page, sort: sort as CatalogSort });
  const showOffers = !category && !brand && !q && offerProducts.length > 0;

  return (
    <>
      {showOffers && <OffersSection products={offerProducts} />}

      <Container>
        <div className={showOffers ? "pt-10" : ""}>
          {/* Header */}
          <div className="mb-8">
            {/* El total se muestra en la toolbar, junto a los filtros que lo producen. */}
            <SectionHeader
              title={category ?? "Catálogo"}
              subtitle="Filtrá por categoría o marca, o buscá por nombre y código."
            />
          </div>

          {/* Catalog: toolbar (categoría + marca + búsqueda) + grid + pagination */}
          <ProductCatalog
            products={result.items}
            total={result.total}
            totalPages={result.totalPages}
            page={result.page}
            query={q ?? ""}
            category={category}
            categories={categories}
            brand={brand}
            brands={brands}
            sort={sort}
          />
        </div>
      </Container>
    </>
  );
}

export default async function ProductsPage({ searchParams }: Props) {
  const { category, brand, q, page, sort } = await searchParams;
  const pageNum = Number(page) || 1;

  return (
    <div className="pt-24 pb-16 overflow-x-hidden">
      <Suspense
        fallback={
          <Container>
            <div className="mb-8 flex flex-col gap-2">
              <div className="h-8 w-48 rounded bg-[#F1F5F9] animate-pulse" />
              <div className="h-4 w-40 rounded bg-[#F1F5F9] animate-pulse" />
            </div>
            <div className="mb-6 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 sm:p-4">
              <div className="h-12 w-full rounded-xl bg-[#F1F5F9] animate-pulse" />
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-1">
                  <div className="h-11 rounded-lg bg-[#F1F5F9] animate-pulse sm:w-56 lg:w-64" />
                  <div className="h-11 rounded-lg bg-[#F1F5F9] animate-pulse sm:w-48 lg:w-56" />
                </div>
                <div className="h-11 rounded-lg bg-[#F1F5F9] animate-pulse sm:w-48" />
              </div>
              <div className="mt-3 flex border-t border-[#E2E8F0] pt-3">
                <div className="ml-auto h-5 w-28 rounded bg-[#F1F5F9] animate-pulse" />
              </div>
            </div>
            <ProductGridSkeleton />
          </Container>
        }
      >
        <CatalogSection category={category} brand={brand} q={q} page={pageNum} sort={sort} />
      </Suspense>
    </div>
  );
}
