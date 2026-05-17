"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  totalPages: number;
  buildHref?: (page: number) => string;
  onPageChange?: (page: number) => void;
};

export function Pagination({ page, totalPages, buildHref, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const pages = buildPageList(page, totalPages);
  const STEP = 10;
  const prevStep = Math.max(1, page - STEP);
  const nextStep = Math.min(totalPages, page + STEP);

  function go(p: number) {
    if (p < 1 || p > totalPages) return;
    onPageChange?.(p);
    const target = document.getElementById("catalogo") ?? document.body;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-10">
      <PageBtn
        onClick={() => go(prevStep)}
        disabled={page <= 1}
        aria-label="Retroceder 10 páginas"
      >
        <ChevronLeft className="w-4 h-4" />
      </PageBtn>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-[#94A3B8] text-sm select-none">
            …
          </span>
        ) : (
          <PageBtn
            key={p}
            onClick={() => go(p as number)}
            active={p === page}
          >
            {p}
          </PageBtn>
        )
      )}

      <PageBtn
        onClick={() => go(nextStep)}
        disabled={page >= totalPages}
        aria-label="Avanzar 10 páginas"
      >
        <ChevronRight className="w-4 h-4" />
      </PageBtn>
    </div>
  );
}

function PageBtn({
  onClick,
  active,
  disabled,
  children,
  "aria-label": ariaLabel,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  "aria-label"?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "w-9 h-9 flex items-center justify-center rounded-lg text-sm border transition-colors",
        disabled && "text-[#CBD5E1] border-transparent cursor-not-allowed",
        active && "bg-[#1A56DB] text-white border-[#1A56DB] font-semibold shadow-sm shadow-[#1A56DB]/20",
        !active && !disabled && "text-[#475569] border-[#E2E8F0] bg-white hover:text-[#0F172A] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
      )}
    >
      {children}
    </button>
  );
}

function buildPageList(current: number, total: number): (number | "...")[] {
  const groupSize = 10;
  const groupStart = Math.floor((current - 1) / groupSize) * groupSize + 1;
  const groupEnd = Math.min(groupStart + groupSize - 1, total);

  const pages: (number | "...")[] = [];
  if (groupStart > 1) pages.push("...");
  for (let i = groupStart; i <= groupEnd; i++) pages.push(i);
  if (groupEnd < total) pages.push("...");
  return pages;
}
