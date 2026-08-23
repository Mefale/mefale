"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowDownUp, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "", label: "Relevancia" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
];

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function SortSelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

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

  const current = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];

  function select(next: string) {
    setOpen(false);
    onChange(next);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger */}
      <button
        id="catalog-sort"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border py-2.5 pl-3.5 pr-3 text-sm font-medium transition-colors",
          open
            ? "border-[#1A56DB] bg-white text-[#0F172A] shadow-sm ring-4 ring-[#1A56DB]/10"
            : value
              ? "border-[#DBEAFE] bg-white text-[#0F172A] shadow-sm hover:border-[#CBD5E1]"
              : "border-[#E2E8F0] bg-white text-[#475569] shadow-sm hover:border-[#CBD5E1] hover:text-[#0F172A] sm:border-transparent sm:bg-transparent sm:shadow-none sm:hover:border-[#E2E8F0] sm:hover:bg-white"
        )}
      >
        <ArrowDownUp className="h-4 w-4 shrink-0 text-[#94A3B8]" />
        <span className="flex-1 truncate text-left">{current.label}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-[#94A3B8] transition-transform", open && "rotate-180")} />
      </button>

      {/* Dropdown */}
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white py-1 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.18)]"
        >
          {OPTIONS.map((option) => (
            <li key={option.value || "relevance"}>
              <button
                role="option"
                aria-selected={option.value === value}
                onClick={() => select(option.value)}
                className={cn(
                  "flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm font-medium transition-colors hover:bg-[#F8FAFC]",
                  option.value === value ? "text-[#1A56DB]" : "text-[#475569] hover:text-[#0F172A]"
                )}
              >
                <Check
                  className={cn("h-3.5 w-3.5 shrink-0", option.value === value ? "opacity-100" : "opacity-0")}
                />
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
