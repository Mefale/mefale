"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { updateOrder } from "@/lib/sheets/orders";

const ItemSchema = z.object({
  sku: z.string(),
  name: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative(),
});

const PatchSchema = z.object({
  status: z.enum(["Generado", "Aprobado", "Empaquetado", "Cancelado"]).optional(),
  items: z.array(ItemSchema).optional(),
  total: z.number().nonnegative().optional(),
  customerName: z.string().optional(),
  phone: z.string().optional(),
});

export type OrderPatch = z.infer<typeof PatchSchema>;

export async function updateOrderAction(
  id: string,
  patch: OrderPatch
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "No autorizado." };

  const parsed = PatchSchema.safeParse(patch);
  if (!parsed.success) return { success: false, error: "Datos inválidos." };

  return updateOrder(id, parsed.data);
}
