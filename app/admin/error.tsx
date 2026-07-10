"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center rounded-xl border border-dashed border-gray-300 bg-white">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50 border border-red-100">
        <AlertTriangle className="w-6 h-6 text-red-500" />
      </div>
      <div className="flex flex-col gap-1 px-6">
        <p className="text-sm font-semibold text-gray-900">
          No se pudieron cargar los datos
        </p>
        <p className="text-sm text-gray-500">
          Hubo un problema al conectar con la planilla. Reintentá en unos segundos.
        </p>
      </div>
      <button
        onClick={reset}
        className="flex items-center gap-2 rounded-lg bg-[#1A56DB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1447C0] transition-colors"
      >
        <RotateCw className="w-4 h-4" />
        Reintentar
      </button>
    </div>
  );
}
