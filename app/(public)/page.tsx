import { Container } from "@/components/layout/Container";
import { HeroSection } from "@/components/layout/HeroSection";
import { HomeCatalog } from "@/components/product/HomeCatalog";
import { getProducts, getCategories } from "@/lib/sheets/products";

export default async function HomePage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <>
      <HeroSection />

      <section id="catalogo" className="pb-16">
        <Container>
          <HomeCatalog products={products} categories={categories} />
        </Container>
      </section>
    </>
  );
}
