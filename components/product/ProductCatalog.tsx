"use client";

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useTransition,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { CategoryCombobox } from "./CategoryCombobox";
import { BrandCombobox } from "./BrandCombobox";
import { SortSelect } from "./SortSelect";
import { ProductGrid } from "./ProductGrid";
import { ProductModal } from "./ProductModal";
import { Pagination } from "@/components/common/Pagination";
import { cn } from "@/lib/utils";
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

/** Chip de filtro activo (categoría / marca / búsqueda). */
function FilterChip({
  label,
  value,
  onRemove,
  uppercase,
}: {
  label: string;
  value: string;
  onRemove: () => void;
  uppercase?: boolean;
}) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#DBEAFE] bg-[#EFF4FE] py-1 pl-3 pr-1.5 text-xs font-medium text-[#1A56DB]">
      <span className="shrink-0 text-[#64748B]">{label}:</span>
      <span className={cn("truncate", uppercase && "uppercase")}>{value}</span>
      <button
        onClick={onRemove}
        aria-label={`Quitar filtro ${label}: ${value}`}
        className="shrink-0 rounded-full p-0.5 text-[#1A56DB]/60 transition-colors hover:bg-white hover:text-[#1A56DB]"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

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

  const activeFilters = Boolean(category || brand || query);

  function clearFilters() {
    setTerm("");
    pushParams({ category: null, brand: null, q: "", page: 1 });
  }

  return (
    <>
      {/* Ancla de scroll para el cambio de página */}
      <div ref={topAnchorRef} aria-hidden className="h-0" />

      {/* Toolbar: búsqueda (fila 1) + filtros y orden (fila 2) + activos (fila 3) */}
      <div className="mb-6 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 shadow-[var(--shadow-card)] sm:p-4">
        {/* Fila 1 — búsqueda, la acción principal */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#94A3B8]" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Buscar por nombre o código..."
            aria-label="Buscar productos"
            className="w-full rounded-xl border border-[#E2E8F0] bg-white py-3 pl-11 pr-11 text-[15px] text-[#0F172A] shadow-sm transition-colors placeholder:text-[#94A3B8] focus:border-[#1A56DB] focus:outline-none focus:ring-4 focus:ring-[#1A56DB]/10"
          />
          {term && (
            <button
              onClick={() => setTerm("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-3.5 top-1/2 -m-1 -translate-y-1/2 p-1 text-[#94A3B8] transition-colors hover:text-[#0F172A]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Fila 2 — filtros a la izquierda, orden a la derecha (rol distinto) */}
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:min-w-0 sm:flex-1">
            <div className="min-w-0 sm:w-56 lg:w-64">
              <CategoryCombobox
                categories={categories}
                selected={category}
                onChange={(cat) => pushParams({ category: cat, page: 1 })}
              />
            </div>
            <div className="min-w-0 sm:w-48 lg:w-56">
              <BrandCombobox
                brands={brands}
                selected={brand}
                onChange={(b) => pushParams({ brand: b, page: 1 })}
              />
            </div>
          </div>

          {/* Separador: ordenar no es un filtro */}
          <div aria-hidden className="hidden h-6 w-px shrink-0 bg-[#E2E8F0] sm:block" />

          <div className="flex items-center gap-2 sm:shrink-0">
            <span className="hidden shrink-0 text-xs font-semibold uppercase tracking-wide text-[#94A3B8] lg:block">
              Ordenar
            </span>
            <div className="flex-1 sm:w-56 lg:w-64">
              <SortSelect
                value={sort ?? ""}
                onChange={(next) => pushParams({ sort: next, page: 1 })}
              />
            </div>
          </div>
        </div>

        {/* Fila 3 — filtros activos + total de resultados */}
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#E2E8F0] pt-3">
          {category && (
            <FilterChip
              label="Categoría"
              value={category}
              onRemove={() => pushParams({ category: null, page: 1 })}
            />
          )}
          {brand && (
            <FilterChip
              label="Marca"
              value={brand}
              uppercase
              onRemove={() => pushParams({ brand: null, page: 1 })}
            />
          )}
          {query && (
            <FilterChip
              label="Búsqueda"
              value={query}
              onRemove={() => {
                setTerm("");
                pushParams({ q: "", page: 1 });
              }}
            />
          )}
          {activeFilters && (
            <button
              onClick={clearFilters}
              className="rounded-full px-2 py-1 text-xs font-semibold text-[#64748B] transition-colors hover:bg-white hover:text-[#0F172A]"
            >
              Limpiar filtros
            </button>
          )}

          <span className="ml-auto shrink-0 text-sm text-[#64748B]">
            <span className="font-semibold tabular-nums text-[#0F172A]">{total}</span>{" "}
            {activeFilters
              ? `resultado${total !== 1 ? "s" : ""}`
              : `producto${total !== 1 ? "s" : ""}`}
          </span>
        </div>
      </div>

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
