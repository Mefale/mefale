import { getSheetsClient } from "./client";

export interface OrderItem {
  sku: string;
  name: string;
  quantity: number;
  price: number;
  pending?: boolean;
}

export type OrderStatus = "Generado" | "Aprobado" | "Empaquetado" | "Cancelado";

export interface Order {
  id: string;
  rowNumber: number;
  date: string;
  time: string;
  customerName: string;
  phone: string;
  items: OrderItem[];
  total: number;
  discountPercentage: number;
  status: OrderStatus;
}

export interface OrderEntry {
  customerName: string;
  phone: string;
  items: OrderItem[];
  total: number;
  discountPercentage: number;
}

// Detecta JSON vs formato legacy "SKU x2, SKU x1"
function parseItems(raw: string): OrderItem[] {
  if (!raw || raw === "-") return [];
  if (raw.trimStart().startsWith("[")) {
    try {
      return JSON.parse(raw) as OrderItem[];
    } catch {
      // cae al parser legacy
    }
  }
  // Formato legacy: "SKU1 x2, SKU2 x1" — price queda en 0
  return raw.split(",").flatMap((segment) => {
    const match = segment.trim().match(/^(.+?)\s+x(\d+)$/i);
    if (!match) return [];
    return [{ sku: match[1].trim(), name: match[1].trim(), quantity: Number(match[2]), price: 0 }];
  });
}

function parseStatus(raw: string): OrderStatus {
  const valid: OrderStatus[] = ["Generado", "Aprobado", "Empaquetado", "Cancelado"];
  return (valid.includes(raw as OrderStatus) ? raw : "Generado") as OrderStatus;
}

function rowToOrder(row: string[], rowNumber: number): Order | null {
  // Esquema actual (col A=0 … I=8):
  // A=date, B=time, C=customerName, D=phone, E=items(JSON), F=total, G=discount, H=status, I=id
  if (!row[0] && !row[2]) return null; // fila vacía

  return {
    date: row[0] ?? "",
    time: row[1] ?? "",
    customerName: row[2] ?? "-",
    phone: row[3] ?? "-",
    items: parseItems(row[4] ?? ""),
    total: parseFloat(row[5] ?? "0") || 0,
    discountPercentage: row[6] && row[6] !== "-" ? parseFloat(row[6]) : 0,
    status: parseStatus(row[7] ?? ""),
    id: row[8] ?? "",
    rowNumber,
  };
}

export async function getOrders(): Promise<Order[]> {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Orders!A2:I",
  });

  const rows = res.data.values ?? [];
  return rows
    .map((row, idx) => rowToOrder(row as string[], idx + 2))
    .filter((o): o is Order => o !== null)
    .reverse(); // más recientes primero
}

export async function updateOrder(
  id: string,
  patch: Partial<Pick<Order, "status" | "items" | "total" | "customerName" | "phone">>
): Promise<{ success: boolean; error?: string }> {
  if (!id) return { success: false, error: "Pedido sin ID (pedido legacy)." };

  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

  // Buscar la fila por UUID en columna I
  const colRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Orders!I2:I",
  });
  const idRows = (colRes.data.values ?? []) as string[][];
  const relIdx = idRows.findIndex((r) => r[0] === id);
  if (relIdx === -1) return { success: false, error: "Pedido no encontrado." };

  const rowNumber = relIdx + 2; // 1-based, con header en fila 1

  // Leer la fila completa para hacer merge con el patch
  const rowRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `Orders!A${rowNumber}:I${rowNumber}`,
  });
  const existing = (rowRes.data.values?.[0] ?? []) as string[];

  const current = rowToOrder(existing, rowNumber);
  if (!current) return { success: false, error: "No se pudo leer el pedido." };

  const merged = { ...current, ...patch };

  // Recalcular total si se modificaron items
  if (patch.items) {
    merged.total = patch.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  }

  const discountStr = merged.discountPercentage > 0 ? `${merged.discountPercentage}%` : "-";

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Orders!A${rowNumber}:I${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [[
        merged.date,
        merged.time,
        merged.customerName,
        merged.phone,
        JSON.stringify(merged.items),
        merged.total,
        discountStr,
        merged.status,
        merged.id,
      ]],
    },
  });

  return { success: true };
}

export async function appendOrder(order: OrderEntry): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

  const now = new Date();
  const date = now.toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const time = now.toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const id = crypto.randomUUID();
  const discountStr = order.discountPercentage > 0 ? `${order.discountPercentage}%` : "-";

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Orders!A:I",
    valueInputOption: "RAW",
    requestBody: {
      values: [[
        date,
        time,
        order.customerName || "-",
        order.phone || "-",
        JSON.stringify(order.items),
        order.total,
        discountStr,
        "Generado",
        id,
      ]],
    },
  });
}
