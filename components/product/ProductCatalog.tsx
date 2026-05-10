"use client";

import { useState, useCallback, useMemo } from "react";
import { Search, X } from "lucide-react";
import { ProductGrid } from "./ProductGrid";
import { ProductModal } from "./ProductModal";
import { Pagination } from "@/components/common/Pagination";
import type { Product } from "@/types/product";

const PAGE_SIZE = 30;

type Props = {
  products: Product[];
};

export function ProductCatalog({ products }: Props) {
  const [selected, setSelected] = useState<Product | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const close = useCallback(() => setSelected(null), []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    );
  }, [products, query]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  function buildHref(p: number) { return "#"; }

  return (
    <>
      {/* Search */}
      <div className="relative w-full mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
        <input
          value={query}
          onChange={(e) => handleQuery(e.target.value)}
          placeholder="Buscar por nombre o código..."
          className="w-full bg-white border border-[#D1D5DB] shadow-sm rounded-lg pl-9 pr-9 py-2 text-sm text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:border-[#111827] focus:ring-2 focus:ring-black/5 transition-colors"
        />
        {query && (
          <button
            onClick={() => handleQuery("")}
            aria-label="Limpiar búsqueda"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#111827] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {query && (
        <p className="text-sm text-[#6B7280] mb-4">
          {filtered.length} resultado{filtered.length !== 1 ? "s" : ""} para{" "}
          <span className="text-[#111827]">"{query}"</span>
        </p>
      )}

      <ProductGrid products={paginated} onSelect={setSelected} />

      <Pagination
        page={page}
        totalPages={totalPages}
        buildHref={buildHref}
        onPageChange={setPage}
      />

      <ProductModal product={selected} onClose={close} />
    </>
  );
}
