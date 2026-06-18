import { revalidateTag as _revalidateTag } from "next/cache";
const revalidateTag = _revalidateTag as (tag: string) => void;
import { getSheetsClient } from "./client";

type ProductInput = {
  sku: string;
  category: string;
  name: string;
  price: number;
};

type Result = { success: boolean; error?: string };

// Columns: A=SKU, B=Category, C=Name, D=Price, E=DiscountPrice(preserved), F=Offer(preserved)

export async function createProduct(data: ProductInput): Promise<Result> {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

  try {
    // Check for duplicate SKU
    const current = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "A2:A",
    });
    const skus = (current.data.values ?? []).map((r) => r[0]?.trim());
    if (skus.includes(data.sku.trim())) {
      return { success: false, error: "Ya existe un producto con ese SKU." };
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "A2",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[data.sku.trim(), data.category.trim(), data.name.trim(), String(data.price), "", ""]],
      },
    });

    revalidateTag("products");
    return { success: true };
  } catch (err) {
    console.error("[createProduct]", err);
    return { success: false, error: "Error al crear el producto." };
  }
}

export async function updateProduct(
  sku: string,
  data: { category: string; name: string; price: number }
): Promise<Result> {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

  try {
    const current = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "A2:F",
    });

    const rows = current.data.values ?? [];
    const rowIndex = rows.findIndex((r) => r[0]?.trim() === sku.trim());
    if (rowIndex === -1) {
      return { success: false, error: "Producto no encontrado." };
    }

    // Row number in the sheet (1-indexed, +2 for header + 0-index offset)
    const sheetRow = rowIndex + 2;
    const preserved = [rows[rowIndex][4] ?? "", rows[rowIndex][5] ?? ""];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `A${sheetRow}:F${sheetRow}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[sku.trim(), data.category.trim(), data.name.trim(), String(data.price), preserved[0], preserved[1]]],
      },
    });

    revalidateTag("products");
    return { success: true };
  } catch (err) {
    console.error("[updateProduct]", err);
    return { success: false, error: "Error al actualizar el producto." };
  }
}

export async function deleteProduct(sku: string): Promise<Result> {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

  try {
    const current = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "A2:F",
    });

    const rows = current.data.values ?? [];
    const filtered = rows.filter((r) => r[0]?.trim() !== sku.trim());

    if (filtered.length === rows.length) {
      return { success: false, error: "Producto no encontrado." };
    }

    await sheets.spreadsheets.values.clear({ spreadsheetId, range: "A2:F" });

    if (filtered.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "A2",
        valueInputOption: "RAW",
        requestBody: { values: filtered },
      });
    }

    revalidateTag("products");
    return { success: true };
  } catch (err) {
    console.error("[deleteProduct]", err);
    return { success: false, error: "Error al eliminar el producto." };
  }
}
