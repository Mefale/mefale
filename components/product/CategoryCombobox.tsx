"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Search, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  categories: string[];
  selected: string | undefined;
  onChange?: (cat: string | null) => void;
};

export function CategoryCombobox({ categories, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const isControlled = onChange !== undefined;

  const filtered = query.trim()
    ? categories.filter((c) => c.toLowerCase().includes(query.toLowerCase().trim()))
    : categories;

  function navigate(cat: string | null) {
    setOpen(false);
    setQuery("");
    if (isControlled) {
      onChange!(cat);
    } else {
      router.push(cat ? `/productos?categoria=${encodeURIComponent(cat)}` : "/productos");
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

  const label = selected ?? "Todas las categorías";

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-sm transition-colors",
          open
            ? "border-[#1A56DB] bg-white text-[#111827] shadow-sm ring-2 ring-[#1A56DB]/10"
            : "border-[#1A56DB]/40 bg-white text-[#6B7280] shadow-sm hover:text-[#111827] hover:border-[#1A56DB]/40"
        )}
      >
        <span className={cn("truncate", selected ? "text-[#111827]" : "")}>
          {label}
        </span>
        <ChevronDown
          className={cn("w-4 h-4 shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-1 w-full z-40 rounded-lg border border-[#1A56DB]/40 bg-white shadow-lg overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-[#1A56DB]/40">
            <Search className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar categoría..."
              className="flex-1 bg-transparent text-sm text-[#111827] placeholder:text-[#6B7280]/60 outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-[#6B7280] hover:text-[#111827]">
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
                    "w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-[#F1F3F5]",
                    !selected ? "text-[#1A56DB]" : "text-[#6B7280]"
                  )}
                >
                  <Check className={cn("w-3.5 h-3.5 shrink-0", !selected ? "opacity-100" : "opacity-0")} />
                  Todas las categorías
                </button>
              </li>
            )}

            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-sm text-[#6B7280] text-center">
                Sin resultados
              </li>
            ) : (
              filtered.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => navigate(cat)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-[#F1F3F5]",
                      selected === cat ? "text-[#1A56DB]" : "text-[#6B7280] hover:text-[#111827]"
                    )}
                  >
                    <Check
                      className={cn("w-3.5 h-3.5 shrink-0", selected === cat ? "opacity-100" : "opacity-0")}
                    />
                    {cat}
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
