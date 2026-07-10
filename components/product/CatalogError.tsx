"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, RotateCw } from "lucide-react";

export function CatalogError() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC]">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white border border-[#E2E8F0] shadow-sm">
        <AlertTriangle className="w-6 h-6 text-[#D97706]" />
      </div>
      <div className="flex flex-col gap-1 px-6">
        <p className="text-sm font-semibold text-[#0F172A]">
          No pudimos cargar el catálogo
        </p>
        <p className="text-sm text-[#64748B]">
          Hubo un problema temporal al conectar. Probá de nuevo en unos segundos.
        </p>
      </div>
      <button
        onClick={() => router.refresh()}
        className="flex items-center gap-2 rounded-lg bg-[#1A56DB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1447C0] transition-colors"
      >
        <RotateCw className="w-4 h-4" />
        Reintentar
      </button>
    </div>
  );
}
