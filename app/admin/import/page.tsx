"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import type { ImportRow } from "@/lib/sheets/import";

type Stage = "idle" | "preview" | "importing" | "done" | "error";

interface PreviewData {
  rows: ImportRow[];
  sample: ImportRow[];
}

interface ImportResult {
  total: number;
  updated: number;
  created: number;
  removed: number;
}

type ImportMode = "merge" | "replace";

// Map Excel header names to ImportRow fields
const HEADER_MAP: Record<string, keyof ImportRow> = {
  "codigo de articulo": "sku",
  "nombre de familia": "category",
  "descripción": "description",
  "descripcion": "description",
  "precio": "price",
};

function parseXlsx(file: File): Promise<PreviewData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json<Record<string, string>>(
          sheet,
          { defval: "" }
        );

        if (rawRows.length === 0) {
          reject(new Error("El archivo está vacío."));
          return;
        }

        // Build column mapping from actual headers (case-insensitive)
        const firstRow = rawRows[0];
        const colMap: Record<string, keyof ImportRow> = {};
        for (const header of Object.keys(firstRow)) {
          const normalized = header.toLowerCase().trim();
          if (HEADER_MAP[normalized]) {
            colMap[header] = HEADER_MAP[normalized];
          }
        }

        const requiredFields: (keyof ImportRow)[] = ["sku", "category", "description", "price"];
        const mapped = Object.values(colMap);
        const missing = requiredFields.filter((f) => !mapped.includes(f));
        if (missing.length > 0) {
          reject(
            new Error(
              `Columnas no encontradas: ${missing.join(", ")}. Verificá que el archivo tenga las cabeceras correctas.`
            )
          );
          return;
        }

        const rows: ImportRow[] = rawRows
          .map((raw) => {
            const row: Partial<ImportRow> = {};
            for (const [header, field] of Object.entries(colMap)) {
              row[field] = String(raw[header] ?? "").trim();
            }
            return row as ImportRow;
          })
          .filter((r) => r.sku && r.price);

        resolve({ rows, sample: rows.slice(0, 5) });
      } catch {
        reject(new Error("No se pudo leer el archivo. Verificá que sea un .xlsx válido."));
      }
    };
    reader.onerror = () => reject(new Error("Error al leer el archivo."));
    reader.readAsArrayBuffer(file);
  });
}

export default function ImportarPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [mode, setMode] = useState<ImportMode>("merge");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStage("idle");
    setErrorMsg("");

    try {
      const data = await parseXlsx(file);
      setPreview(data);
      setStage("preview");
    } catch (err) {
      setErrorMsg((err as Error).message);
      setStage("error");
    }
  }

  async function handleImport() {
    if (!preview) return;
    setStage("importing");

    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: preview.rows, mode }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Error del servidor.");
      }

      const data: ImportResult = await res.json();
      setResult(data);
      setStage("done");
      toast.success("Importación completada", {
        description: `${data.updated} actualizados, ${data.created} nuevos`,
      });
    } catch (err) {
      setErrorMsg((err as Error).message);
      setStage("error");
      toast.error("La importación falló", {
        description: (err as Error).message,
      });
    }
  }

  function handleReset() {
    setStage("idle");
    setPreview(null);
    setMode("merge");
    setResult(null);
    setErrorMsg("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#0F172A]">Importar productos</h1>
        <p className="text-sm text-[#64748B] mt-0.5">
          Subí el Excel diario. Se actualizan SKU, familia, descripción y precio. Los campos <strong>Precio de Descuento</strong> y <strong>Oferta</strong> no se tocan. Antes de confirmar elegís si conservar o reemplazar los productos ausentes.
        </p>
      </div>

      {/* Upload */}
      {(stage === "idle" || stage === "error") && (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center">
          <p className="text-gray-500 text-sm mb-4">
            Seleccioná el archivo <strong>.xlsx</strong>
          </p>
          <label className="inline-block cursor-pointer bg-[#1A56DB] text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-[#1447C0] transition-colors">
            Elegir archivo
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          {errorMsg && (
            <p className="mt-4 text-sm text-red-600">{errorMsg}</p>
          )}
        </div>
      )}

      {/* Preview */}
      {stage === "preview" && preview && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
            Se encontraron <strong>{preview.rows.length}</strong> productos para importar.
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  {["SKU", "Familia", "Descripción", "Precio"].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium text-gray-700 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {preview.sample.map((row, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 font-mono text-xs text-gray-600">{row.sku}</td>
                    <td className="px-4 py-2 text-gray-700">{row.category}</td>
                    <td className="px-4 py-2 text-gray-700 max-w-xs truncate">{row.description}</td>
                    <td className="px-4 py-2 text-gray-700">{row.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.rows.length > 5 && (
              <p className="text-xs text-gray-400 px-4 py-2">
                … y {preview.rows.length - 5} más
              </p>
            )}
          </div>

          {/* Modo de importación */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Modo de importación</p>
            <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:border-gray-300 transition-colors">
              <input
                type="radio"
                name="import-mode"
                checked={mode === "merge"}
                onChange={() => setMode("merge")}
                className="mt-0.5 w-4 h-4 text-[#1A56DB]"
              />
              <span className="text-sm">
                <span className="font-medium text-gray-800">Solo actualizar y agregar</span>{" "}
                <span className="text-xs text-gray-500">(recomendado)</span>
                <span className="block text-xs text-gray-500 mt-0.5">
                  Los productos que no estén en el Excel se conservan.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:border-gray-300 transition-colors">
              <input
                type="radio"
                name="import-mode"
                checked={mode === "replace"}
                onChange={() => setMode("replace")}
                className="mt-0.5 w-4 h-4 text-[#DC2626]"
              />
              <span className="text-sm">
                <span className="font-medium text-gray-800">Reemplazar todo el catálogo</span>
                <span className="block text-xs text-gray-500 mt-0.5">
                  Los productos que no estén en el Excel se <strong>eliminan</strong>.
                </span>
              </span>
            </label>
            {mode === "replace" && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                ⚠️ Se eliminarán del catálogo todos los SKU que no estén en este archivo. Asegurate de subir el listado completo.
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleImport}
              className="bg-[#1A56DB] text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-[#1447C0] transition-colors"
            >
              Confirmar importación
            </button>
            <button
              onClick={handleReset}
              className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Importing */}
      {stage === "importing" && (
        <div className="flex flex-col items-center gap-3 py-16 text-gray-500 text-sm">
          <Loader2 className="w-6 h-6 animate-spin text-[#1A56DB]" />
          Importando productos al catálogo…
        </div>
      )}

      {/* Done */}
      {stage === "done" && result && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg px-5 py-4">
            <p className="font-medium text-green-800 mb-2">
              Importación completada
            </p>
            <ul className="text-sm text-green-700 space-y-1">
              <li>Total procesados: <strong>{result.total}</strong></li>
              <li>Actualizados: <strong>{result.updated}</strong></li>
              <li>Nuevos: <strong>{result.created}</strong></li>
              {result.removed > 0 && (
                <li className="text-red-700">Eliminados: <strong>{result.removed}</strong></li>
              )}
            </ul>
          </div>
          <button
            onClick={handleReset}
            className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Importar otro archivo
          </button>
        </div>
      )}
    </div>
  );
}
