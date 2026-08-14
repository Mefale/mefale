"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Search, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  brands: string[];
  selected: string | undefined;
  onChange?: (brand: string | null) => void;
};

export function BrandCombobox({ brands, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const isControlled = onChange !== undefined;

  const filtered = query.trim()
    ? brands.filter((b) => b.toLowerCase().includes(query.toLowerCase().trim()))
    : brands;

  function navigate(brand: string | null) {
    setOpen(false);
    setQuery("");
    if (isControlled) {
      onChange!(brand);
    } else {
      router.push(brand ? `/products?brand=${encodeURIComponent(brand)}` : "/products");
    }
  }

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [close]);

  const label = selected ?? "Todas las marcas";

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg border text-sm font-medium transition-colors",
          open
            ? "border-[#1A56DB] bg-white text-[#0F172A] shadow-sm ring-4 ring-[#1A56DB]/10"
            : "border-[#E2E8F0] bg-white text-[#475569] shadow-sm hover:text-[#0F172A] hover:border-[#CBD5E1]"
        )}
      >
        <span className={cn("truncate", selected && "uppercase text-[#0F172A]")}>
          {label}
        </span>
        <ChevronDown
          className={cn("w-4 h-4 shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-2 w-full z-40 rounded-xl border border-[#E2E8F0] bg-white shadow-[0_16px_40px_-12px_rgba(15,23,42,0.18)] overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-[#F1F5F9]">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar marca..."
              className="flex-1 bg-transparent text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-[#94A3B8] hover:text-[#0F172A]">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Options list */}
          <ul className="max-h-64 overflow-y-auto py-1">
            {/* "Todas" option */}
            {!query.trim() && (
              <li>
                <button
                  onClick={() => navigate(null)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-left transition-colors hover:bg-[#F8FAFC]",
                    !selected ? "text-[#1A56DB]" : "text-[#475569]"
                  )}
                >
                  <Check className={cn("w-3.5 h-3.5 shrink-0", !selected ? "opacity-100" : "opacity-0")} />
                  Todas las marcas
                </button>
              </li>
            )}

            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-sm text-[#94A3B8] text-center">
                Sin resultados
              </li>
            ) : (
              filtered.map((brand) => (
                <li key={brand}>
                  <button
                    onClick={() => navigate(brand)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-left uppercase transition-colors hover:bg-[#F8FAFC]",
                      selected === brand ? "text-[#1A56DB]" : "text-[#475569] hover:text-[#0F172A]"
                    )}
                  >
                    <Check
                      className={cn("w-3.5 h-3.5 shrink-0", selected === brand ? "opacity-100" : "opacity-0")}
                    />
                    {brand}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
