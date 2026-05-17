import { Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { HeroSection } from "@/components/layout/HeroSection";
import { HomeCatalog } from "@/components/product/HomeCatalog";
import { ProductGridSkeleton } from "@/components/product/ProductGridSkeleton";
import { getProducts, getCategories } from "@/lib/sheets/products";

async function HomeCatalogSection() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return <HomeCatalog products={products} categories={categories} />;
}

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <section id="catalogo" className="pb-16">
        <Container>
          <Suspense
            fallback={
              <>
                <div className="mb-8 h-11 w-full rounded-lg bg-[#F1F5F9] animate-pulse" />
                <ProductGridSkeleton />
              </>
            }
          >
            <HomeCatalogSection />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
