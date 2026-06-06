import { revalidateTag } from "next/cache";
import { getSheetsClient } from "./client";

export interface ImportRow {
  sku: string;
  category: string;
  description: string;
  price: string;
}

export interface ImportResult {
  total: number;
  updated: number;
  created: number;
}

export async function importProductsToSheet(
  rows: ImportRow[]
): Promise<ImportResult> {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

  // Read current data to preserve columns E (DiscountPrice) and F (Offer)
  const current = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "A2:F",
  });

  const existing = new Map<string, [string, string]>();
  for (const row of current.data.values ?? []) {
    const sku = row[0]?.trim();
    if (sku) {
      existing.set(sku, [row[4] ?? "", row[5] ?? ""]);
    }
  }

  const created = rows.filter((r) => !existing.has(r.sku)).length;
  const updated = rows.filter((r) => existing.has(r.sku)).length;

  // Build merged rows: A-D from Excel, E-F preserved from sheet
  const newRows = rows.map((row) => {
    const preserved = existing.get(row.sku) ?? ["", ""];
    return [row.sku, row.category, row.description, row.price, preserved[0], preserved[1]];
  });

  // Clear existing data rows and rewrite
  await sheets.spreadsheets.values.clear({ spreadsheetId, range: "A2:F" });

  if (newRows.length > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "A2",
      valueInputOption: "RAW",
      requestBody: { values: newRows },
    });
  }

  revalidateTag("products");
  revalidateTag("categories");

  return { total: rows.length, updated, created };
}
