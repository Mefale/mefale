import { getSheetsClient } from "./client";

export interface ImportRow {
  sku: string;
  category: string;
  description: string;
  price: string;
}

/**
 * - "merge": actualiza/agrega los SKU del Excel y CONSERVA los que no vengan
 *   en el archivo (seguro, recomendado).
 * - "replace": reemplaza toda la hoja por lo que traiga el Excel; los SKU
 *   ausentes se ELIMINAN del catálogo.
 */
export type ImportMode = "merge" | "replace";

export interface ImportResult {
  total: number;
  updated: number;
  created: number;
  /** SKU eliminados (solo en modo "replace"). */
  removed: number;
}

export async function importProductsToSheet(
  rows: ImportRow[],
  mode: ImportMode = "merge"
): Promise<ImportResult> {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

  // Read current data to preserve columns E (DiscountPrice) and F (Offer),
  // and to know qué SKU ya existen.
  const current = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "A2:F",
  });

  // sku -> fila completa existente [A..F]
  const existing = new Map<string, string[]>();
  for (const row of current.data.values ?? []) {
    const sku = row[0]?.trim();
    if (sku) existing.set(sku, row);
  }

  const importSkus = new Set(rows.map((r) => r.sku));
  const created = rows.filter((r) => !existing.has(r.sku)).length;
  const updated = rows.filter((r) => existing.has(r.sku)).length;

  // Filas del Excel: A-D del archivo, E-F preservadas de la hoja.
  const importedRows = rows.map((row) => {
    const prev = existing.get(row.sku);
    return [row.sku, row.category, row.description, row.price, prev?.[4] ?? "", prev?.[5] ?? ""];
  });

  let finalRows: string[][];
  let removed = 0;

  if (mode === "merge") {
    // Conservar los SKU existentes que NO vienen en el Excel.
    const keptRows = [...existing.entries()]
      .filter(([sku]) => !importSkus.has(sku))
      .map(([, row]) => [
        row[0] ?? "",
        row[1] ?? "",
        row[2] ?? "",
        row[3] ?? "",
        row[4] ?? "",
        row[5] ?? "",
      ]);
    finalRows = [...importedRows, ...keptRows];
  } else {
    removed = [...existing.keys()].filter((sku) => !importSkus.has(sku)).length;
    finalRows = importedRows;
  }

  // Clear existing data rows and rewrite
  await sheets.spreadsheets.values.clear({ spreadsheetId, range: "A2:F" });

  if (finalRows.length > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "A2",
      valueInputOption: "RAW",
      requestBody: { values: finalRows },
    });
  }

  return { total: rows.length, updated, created, removed };
}
