"use client";

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useTransition,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, ArrowDownUp, ChevronDown } from "lucide-react";
import { CategoryCombobox } from "./CategoryCombobox";
import { BrandCombobox } from "./BrandCombobox";
import { ProductGrid } from "./ProductGrid";
import { ProductModal } from "./ProductModal";
import { Pagination } from "@/components/common/Pagination";
import type { Product } from "@/types/product";

type Props = {
  /** Solo la página actual (~40 productos), ya filtrada en el servidor. */
  products: Product[];
  total: number;
  totalPages: number;
  page: number;
  query: string;
  category?: string;
  categories: string[];
  brand?: string;
  brands: string[];
  sort?: string;
};

const NAVBAR_OFFSET = 72;

export function ProductCatalog({
  products,
  total,
  totalPages,
  page,
  query,
  category,
  categories,
  brand,
  brands,
  sort,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [selected, setSelected] = useState<Product | null>(null);
  const [term, setTerm] = useState(query);
  const topAnchorRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setSelected(null), []);

  // Mantener el input en sync si la URL cambia por fuera (back/forward, categoría).
  useEffect(() => {
    setTerm(query);
  }, [query]);

  const pushParams = useCallback(
    (next: { q?: string; page?: number; category?: string | null; brand?: string | null; sort?: string }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (next.category !== undefined) {
        if (next.category) params.set("category", next.category);
        else params.delete("category");
      }
      if (next.brand !== undefined) {
        if (next.brand) params.set("brand", next.brand);
        else params.delete("brand");
      }
      if (next.q !== undefined) {
        if (next.q) params.set("q", next.q);
        else params.delete("q");
      }
      if (next.sort !== undefined) {
        if (next.sort) params.set("sort", next.sort);
        else params.delete("sort");
      }
      if (next.page !== undefined) {
        if (next.page > 1) params.set("page", String(next.page));
        else params.delete("page");
      }

      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [router, pathname, searchParams]
  );

  // Búsqueda con debounce → navega actualizando la URL (server filtra + pagina).
  useEffect(() => {
    if (term === query) return;
    const id = setTimeout(() => pushParams({ q: term, page: 1 }), 350);
    return () => clearTimeout(id);
  }, [term, query, pushParams]);

  function scrollToTop() {
    const anchor = topAnchorRef.current;
    if (!anchor) return;
    const y = anchor.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  function handlePageChange(p: number) {
    pushParams({ page: p });
    scrollToTop();
  }

  return (
    <>
      {/* Ancla de scroll para el cambio de página */}
      <div ref={topAnchorRef} aria-hidden className="h-0" />

      {/* Toolbar: categoría + marca + búsqueda + orden */}
      <div className="mb-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-2.5 shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="sm:w-56 lg:w-64 shrink-0">
            <CategoryCombobox
              categories={categories}
              selected={category}
              onChange={(cat) => pushParams({ category: cat, page: 1 })}
            />
          </div>
          <div className="sm:w-48 lg:w-56 shrink-0">
            <BrandCombobox
              brands={brands}
              selected={brand}
              onChange={(b) => pushParams({ brand: b, page: 1 })}
            />
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar por nombre o código..."
              className="w-full bg-white border border-[#E2E8F0] shadow-sm rounded-lg pl-10 pr-10 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1A56DB] focus:ring-4 focus:ring-[#1A56DB]/10 transition-colors"
            />
            {term && (
              <button
                onClick={() => setTerm("")}
                aria-label="Limpiar búsqueda"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 -m-1 text-[#94A3B8] hover:text-[#0F172A] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {/* Ordenar por precio */}
          <div className="relative sm:w-52 shrink-0">
            <ArrowDownUp className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
            <select
              aria-label="Ordenar productos"
              value={sort ?? ""}
              onChange={(e) => pushParams({ sort: e.target.value, page: 1 })}
              className="w-full appearance-none bg-white border border-[#E2E8F0] shadow-sm rounded-lg pl-10 pr-8 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:border-[#1A56DB] focus:ring-4 focus:ring-[#1A56DB]/10 transition-colors cursor-pointer"
            >
              <option value="">Ordenar por</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
          </div>
        </div>
      </div>

      <p className="text-sm text-[#64748B] mb-5">
        {query ? (
          <>
            {total} resultado{total !== 1 ? "s" : ""} para{" "}
            <span className="font-semibold text-[#0F172A]">&ldquo;{query}&rdquo;</span>
          </>
        ) : (
          <>
            <span className="font-semibold text-[#0F172A] tabular-nums">{total}</span>{" "}
            producto{total !== 1 ? "s" : ""} disponible{total !== 1 ? "s" : ""}
          </>
        )}
      </p>

      <div
        className={
          isPending ? "opacity-60 transition-opacity" : "transition-opacity"
        }
      >
        <ProductGrid products={products} onSelect={setSelected} />
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <ProductModal product={selected} onClose={close} />
    </>
  );
}
