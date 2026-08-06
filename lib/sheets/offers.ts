import { revalidateTag as _revalidateTag } from "next/cache";
const revalidateTag = _revalidateTag as (tag: string) => void;
import { getSheetsClient } from "./client";

export async function updateProductOffer(
  sku: string,
  offer: boolean,
  discountPrice: number | null
): Promise<{ success: boolean; error?: string }> {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

  let skuRes;
  try {
    skuRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "A2:A",
    });
  } catch {
    return { success: false, error: "Error al conectar con Google Sheets." };
  }

  const skuRows = skuRes.data.values ?? [];
  const rowIndex = skuRows.findIndex(
    (row) => row[0]?.trim().toLowerCase() === sku.toLowerCase()
  );

  if (rowIndex === -1) {
    return { success: false, error: `SKU "${sku}" no encontrado.` };
  }

  // rowIndex is 0-based from row 2 → actual sheet row = rowIndex + 2
  const sheetRow = rowIndex + 2;

  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `E${sheetRow}:F${sheetRow}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[discountPrice ?? "", offer ? "x" : ""]],
      },
    });
  } catch {
    return { success: false, error: "Error al guardar en Google Sheets." };
  }

  revalidateTag("products");
  return { success: true };
}
