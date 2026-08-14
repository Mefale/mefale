import { revalidateTag as _revalidateTag } from "next/cache";
const revalidateTag = _revalidateTag as (tag: string) => void;
import { getSheetsClient } from "./client";
import { parsePrice } from "./products";

type ProductInput = {
  sku: string;
  category: string;
  name: string;
  price: number;
  imageUrl: string;
  brand: string;
};

type Result = { success: boolean; error?: string };
type BulkPriceResult = { success: boolean; updated: number; error?: string };

// Columns: A=SKU, B=Category, C=Name, D=Price, E=DiscountPrice(preserved), F=Offer(preserved), G=ImageUrl, H=Brand

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
        values: [[data.sku.trim(), data.category.trim(), data.name.trim(), String(data.price), "", "", data.imageUrl.trim(), data.brand.trim()]],
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
  data: { category: string; name: string; price: number; imageUrl: string; brand: string }
): Promise<Result> {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

  try {
    const current = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "A2:H",
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
      range: `A${sheetRow}:H${sheetRow}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[sku.trim(), data.category.trim(), data.name.trim(), String(data.price), preserved[0], preserved[1], data.imageUrl.trim(), data.brand.trim()]],
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
      range: "A2:H",
    });

    const rows = current.data.values ?? [];
    const filtered = rows.filter((r) => r[0]?.trim() !== sku.trim());

    if (filtered.length === rows.length) {
      return { success: false, error: "Producto no encontrado." };
    }

    await sheets.spreadsheets.values.clear({ spreadsheetId, range: "A2:H" });

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

/**
 * Ajusta el precio (y, proporcionalmente, el precio de oferta si tiene) de
 * todos los productos de una marca. `percent` positivo sube, negativo baja
 * (ej: 5 = +5%, -10 = -10%). Escritura puntual por celda (D/E), no reescribe
 * la fila completa.
 */
export async function bulkAdjustPriceByBrand(
  brand: string,
  percent: number
): Promise<BulkPriceResult> {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;
  const factor = 1 + percent / 100;

  try {
    const current = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "A2:H",
    });
    const rows = current.data.values ?? [];

    const data: { range: string; values: string[][] }[] = [];

    rows.forEach((row, i) => {
      const rowBrand = row[7]?.trim() ?? "";
      if (rowBrand !== brand) return;

      const sheetRow = i + 2;

      const price = parsePrice(row[3] ?? "");
      if (price > 0) {
        const newPrice = Math.round(price * factor * 100) / 100;
        data.push({ range: `D${sheetRow}`, values: [[String(newPrice)]] });
      }

      const discountRaw = row[4]?.trim();
      if (discountRaw) {
        const discountPrice = parsePrice(discountRaw);
        if (discountPrice > 0) {
          const newDiscountPrice = Math.round(discountPrice * factor * 100) / 100;
          data.push({ range: `E${sheetRow}`, values: [[String(newDiscountPrice)]] });
        }
      }
    });

    if (data.length === 0) {
      return { success: true, updated: 0 };
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: { valueInputOption: "RAW", data },
    });

    revalidateTag("products");
    return { success: true, updated: data.filter((d) => d.range.startsWith("D")).length };
  } catch (err) {
    console.error("[bulkAdjustPriceByBrand]", err);
    return { success: false, updated: 0, error: "Error al ajustar los precios." };
  }
}
