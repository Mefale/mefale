import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { HeroSection } from "@/components/layout/HeroSection";
import { ProductCatalog } from "@/components/product/ProductCatalog";
import { OffersSection } from "@/components/product/OffersSection";
import { ProductGridSkeleton } from "@/components/product/ProductGridSkeleton";
import { getProducts, getCategories } from "@/lib/sheets/products";
import { queryProducts } from "@/utils/query-products";

type Props = {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
};

async function HomeCatalogSection({
  category,
  q,
  page,
}: {
  category?: string;
  q?: string;
  page: number;
}) {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const offerProducts = products.filter((p) => p.offer);
  const result = queryProducts(products, { category, q, page });
  const showOffers = !category && !q && offerProducts.length > 0;

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
          />
        </Container>
      </section>
    </>
  );
}

export default async function HomePage({ searchParams }: Props) {
  const { category, q, page } = await searchParams;
  const pageNum = Number(page) || 1;

  return (
    <>
      <HeroSection />

      <Suspense
        key={category ?? "all"}
        fallback={
          <section className="pb-16 pt-10">
            <Container>
              <div className="mb-8 flex flex-col sm:flex-row gap-2">
                <div className="h-11 sm:w-64 lg:w-72 rounded-lg bg-[#F1F5F9] animate-pulse" />
                <div className="h-11 flex-1 rounded-lg bg-[#F1F5F9] animate-pulse" />
              </div>
              <ProductGridSkeleton />
            </Container>
          </section>
        }
      >
        <HomeCatalogSection category={category} q={q} page={pageNum} />
      </Suspense>
    </>
  );
}
