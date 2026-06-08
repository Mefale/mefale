import { NextResponse } from "next/server";
import { z } from "zod";
import { appendOrder } from "@/lib/sheets/orders";

const ItemSchema = z.object({
  sku: z.string(),
  name: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative(),
});

const BodySchema = z.object({
  customerName: z.string().optional().default(""),
  items: z.array(ItemSchema).min(1),
  total: z.number().nonnegative(),
  discountPercentage: z.number().min(0).max(100).default(0),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  try {
    await appendOrder(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[track-order] Error writing to Sheets:", err);
    return NextResponse.json({ error: "Error al registrar." }, { status: 500 });
  }
}
