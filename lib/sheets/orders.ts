import { getSheetsClient } from "./client";

export interface OrderEntry {
  customerName: string;
  items: { sku: string; name: string; quantity: number; price: number }[];
  total: number;
  discountPercentage: number;
}

export async function appendOrder(order: OrderEntry): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

  const date = new Date().toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const time = new Date().toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const productos = order.items
    .map((i) => `${i.sku} x${i.quantity}`)
    .join(", ");

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Orders!A:F",
    valueInputOption: "RAW",
    requestBody: {
      values: [[
        date,
        time,
        order.customerName || "-",
        productos,
        order.total,
        order.discountPercentage > 0 ? `${order.discountPercentage}%` : "-",
      ]],
    },
  });
}
