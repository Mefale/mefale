import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { ProductCatalog } from "@/components/product/ProductCatalog";
import { ProductGridSkeleton } from "@/components/product/ProductGridSkeleton";
import { SectionHeader } from "@/components/common/SectionHeader";
import { CategoryCombobox } from "@/components/product/CategoryCombobox";
import { getProducts, getCategories } from "@/lib/sheets/products";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Todos los productos de Distribuidora Graser: cables, luminarias, herramientas, componentes y más.",
};

type Props = {
  searchParams: Promise<{ category?: string }>;
};

async function CatalogSection({ category }: { category?: string }) {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const filtered = category
    ? products.filter((p) => p.category === category)
    : products;

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <SectionHeader
          title={category ?? "Catálogo"}
          subtitle={`${filtered.length} productos disponibles`}
        />
      </div>

      {/* Category filter */}
      <div className="mb-8">
        <CategoryCombobox categories={categories} selected={category} />
      </div>

      {/* Catalog: search + grid + pagination */}
      <ProductCatalog products={filtered} />
    </>
  );
}

export default async function ProductsPage({ searchParams }: Props) {
  const { category } = await searchParams;

  return (
    <div className="pt-24 pb-16">
      <Container>
        <Suspense
          key={category ?? "all"}
          fallback={
            <>
              <div className="mb-8 flex flex-col gap-2">
                <div className="h-8 w-48 rounded bg-[#F1F5F9] animate-pulse" />
                <div className="h-4 w-40 rounded bg-[#F1F5F9] animate-pulse" />
              </div>
              <div className="mb-8 h-11 w-full rounded-lg bg-[#F1F5F9] animate-pulse" />
              <ProductGridSkeleton />
            </>
          }
        >
          <CatalogSection category={category} />
        </Suspense>
      </Container>
    </div>
  );
}
