import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { importProductsToSheet, type ImportRow } from "@/lib/sheets/import";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

const ImportRowSchema = z.object({
  sku: z.string().min(1),
  category: z.string(),
  description: z.string(),
  price: z.string(),
});

const BodySchema = z.object({
  rows: z.array(ImportRowSchema).min(1),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const result = await importProductsToSheet(parsed.data.rows as ImportRow[]);
    revalidatePath("/", "layout");
    return NextResponse.json(result);
  } catch (err) {
    console.error("[import] Error writing to Sheets:", err);
    return NextResponse.json(
      { error: "Error al escribir en el catálogo. Intentá de nuevo." },
      { status: 500 }
    );
  }
}
