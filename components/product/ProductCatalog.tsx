"use client";

import { useState, useCallback, useMemo } from "react";
import { Search, X } from "lucide-react";
import { ProductGrid } from "./ProductGrid";
import { ProductModal } from "./ProductModal";
import { Pagination } from "@/components/common/Pagination";
import type { Product } from "@/types/product";

const PAGE_SIZE = 40;

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
        p.name.toLowerCase().includes(q) ||
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
      {/* Search bar — sticky para catálogos largos */}
      <div className="sticky top-16 z-30 -mx-4 px-4 sm:mx-0 sm:px-0 py-3 mb-5 bg-white/95 backdrop-blur-sm border-b border-[#E2E8F0]">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
          <input
            value={query}
            onChange={(e) => handleQuery(e.target.value)}
            placeholder="Buscar por nombre o código..."
            className="w-full bg-white border border-[#E2E8F0] shadow-sm rounded-lg pl-10 pr-10 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1A56DB] focus:ring-4 focus:ring-[#1A56DB]/10 transition-colors"
          />
          {query && (
            <button
              onClick={() => handleQuery("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-[#64748B] mb-4">
        {query ? (
          <>
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""} para{" "}
            <span className="font-semibold text-[#0F172A]">&ldquo;{query}&rdquo;</span>
          </>
        ) : (
          <>
            <span className="font-semibold text-[#0F172A] tabular-nums">
              {filtered.length}
            </span>{" "}
            producto{filtered.length !== 1 ? "s" : ""} disponible
            {filtered.length !== 1 ? "s" : ""}
          </>
        )}
      </p>

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
