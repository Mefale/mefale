import { Container } from "@/components/layout/Container";
import { ProductCatalog } from "@/components/product/ProductCatalog";
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
  searchParams: Promise<{ categoria?: string }>;
};

export default async function ProductosPage({ searchParams }: Props) {
  const { categoria } = await searchParams;
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  const filtered = categoria
    ? products.filter((p) => p.category === categoria)
    : products;

  return (
    <div className="pt-24 pb-16">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <SectionHeader
            title={categoria ?? "Catálogo"}
            subtitle={`${filtered.length} productos disponibles`}
          />
        </div>

        {/* Category filter */}
        <div className="mb-8">
          <CategoryCombobox categories={categories} selected={categoria} />
        </div>

        {/* Catalog: search + grid + pagination */}
        <ProductCatalog products={filtered} />
      </Container>
    </div>
  );
}
