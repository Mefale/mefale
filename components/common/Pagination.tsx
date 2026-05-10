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

  function go(p: number) {
    if (p < 1 || p > totalPages) return;
    onPageChange?.(p);
    const target = document.getElementById("catalogo") ?? document.body;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-10">
      <PageBtn
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </PageBtn>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-[#6B7280] text-sm select-none">
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
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
        aria-label="Página siguiente"
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
        "w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-colors",
        disabled && "text-[#3F3F46] cursor-not-allowed",
        active && "bg-[#1A56DB] text-[#FFFFFF] font-semibold",
        !active && !disabled && "text-[#6B7280] hover:text-[#111827] hover:bg-[#F1F3F5]"
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
