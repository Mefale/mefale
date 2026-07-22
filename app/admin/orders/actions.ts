"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { updateOrder, appendOrder, type Order } from "@/lib/sheets/orders";

const ItemSchema = z.object({
  sku: z.string(),
  name: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative(),
  pending: z.boolean().optional(),
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

const CreateSchema = z.object({
  customerName: z.string().optional(),
  phone: z.string().optional(),
  items: z.array(ItemSchema).min(1),
  discountPercentage: z.number().min(0).max(100).optional(),
});

export type OrderCreate = z.infer<typeof CreateSchema>;

export async function createOrderAction(
  input: OrderCreate
): Promise<{ success: boolean; order?: Order; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "No autorizado." };

  const parsed = CreateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Datos inválidos." };

  const { customerName, phone, items, discountPercentage = 0 } = parsed.data;
  const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  try {
    const order = await appendOrder({
      customerName: customerName ?? "",
      phone: phone ?? "",
      items,
      total,
      discountPercentage,
    });
    return { success: true, order };
  } catch {
    return { success: false, error: "No se pudo crear el pedido." };
  }
}
