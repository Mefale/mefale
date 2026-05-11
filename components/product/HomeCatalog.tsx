"use client";

import { useState } from "react";
import { CategoryCombobox } from "./CategoryCombobox";
import { ProductCatalog } from "./ProductCatalog";
import type { Product } from "@/types/product";

type Props = {
  products: Product[];
  categories: string[];
};

export function HomeCatalog({ products, categories }: Props) {
  const [category, setCategory] = useState<string | undefined>(undefined);

  const filtered = category
    ? products.filter((p) => p.category === category)
    : products;

  return (
    <div>
      <div className="mb-8">
        <CategoryCombobox
          categories={categories}
          selected={category}
          onChange={(cat) => setCategory(cat ?? undefined)}
        />
      </div>
      <ProductCatalog key={category ?? "all"} products={filtered} />
    </div>
  );
}
