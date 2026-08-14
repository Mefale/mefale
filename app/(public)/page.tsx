import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { HeroSection } from "@/components/layout/HeroSection";
import { ProductCatalog } from "@/components/product/ProductCatalog";
import { OffersSection } from "@/components/product/OffersSection";
import { ProductGridSkeleton } from "@/components/product/ProductGridSkeleton";
import { CatalogError } from "@/components/product/CatalogError";
import { getProducts, getCategories, getBrands } from "@/lib/sheets/products";
import { queryProducts, type CatalogSort } from "@/utils/query-products";

type Props = {
  searchParams: Promise<{ category?: string; brand?: string; q?: string; page?: string; sort?: string }>;
};

async function HomeCatalogSection({
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
      <section className="pt-10 pb-16">
        <Container>
          <CatalogError />
        </Container>
      </section>
    );
  }

  const offerProducts = products.filter((p) => p.offer);
  const result = queryProducts(products, { category, brand, q, page, sort: sort as CatalogSort });
  const showOffers = !category && !brand && !q && offerProducts.length > 0;

  return (
    <>
      {showOffers && <OffersSection products={offerProducts} />}
      <section id="catalogo" className="pt-10 pb-16">
        <Container>
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
        </Container>
      </section>
    </>
  );
}

export default async function HomePage({ searchParams }: Props) {
  const { category, brand, q, page, sort } = await searchParams;
  const pageNum = Number(page) || 1;

  return (
    <>
      <HeroSection />

      <Suspense
        key={`${category ?? "all"}-${brand ?? "all"}`}
        fallback={
          <section className="pb-16 pt-10">
            <Container>
              <div className="mb-8 flex flex-col sm:flex-row gap-2">
                <div className="h-11 sm:w-56 lg:w-64 rounded-lg bg-[#F1F5F9] animate-pulse" />
                <div className="h-11 sm:w-48 lg:w-56 rounded-lg bg-[#F1F5F9] animate-pulse" />
                <div className="h-11 flex-1 rounded-lg bg-[#F1F5F9] animate-pulse" />
              </div>
              <ProductGridSkeleton />
            </Container>
          </section>
        }
      >
        <HomeCatalogSection category={category} brand={brand} q={q} page={pageNum} sort={sort} />
      </Suspense>
    </>
  );
}
