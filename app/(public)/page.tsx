import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { HeroSection } from "@/components/layout/HeroSection";
import { HomeCatalog } from "@/components/product/HomeCatalog";
import { OffersSection } from "@/components/product/OffersSection";
import { ProductGridSkeleton } from "@/components/product/ProductGridSkeleton";
import { getProducts, getCategories } from "@/lib/sheets/products";

async function HomeCatalogSection() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const offerProducts = products.filter((p) => p.offer);

  return (
    <>
      {offerProducts.length > 0 && <OffersSection products={offerProducts} />}
      <section id="catalogo" className="pt-10 pb-16">
        <Container>
          <HomeCatalog products={products} categories={categories} />
        </Container>
      </section>
    </>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <Suspense
        fallback={
          <section className="pb-16">
            <Container>
              <div className="mb-8 h-11 w-full rounded-lg bg-[#F1F5F9] animate-pulse" />
              <ProductGridSkeleton />
            </Container>
          </section>
        }
      >
        <HomeCatalogSection />
      </Suspense>
    </>
  );
}
