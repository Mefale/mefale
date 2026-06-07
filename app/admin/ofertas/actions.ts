"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateProductOffer } from "@/lib/sheets/offers";

const Schema = z.object({
  sku: z.string().min(1),
  offer: z.boolean(),
  discountPrice: z.number().positive().nullable(),
});

export async function setOfferAction(
  sku: string,
  offer: boolean,
  discountPrice: number | null
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "No autorizado." };

  const parsed = Schema.safeParse({ sku, offer, discountPrice });
  if (!parsed.success) return { success: false, error: "Datos inválidos." };

  const result = await updateProductOffer(sku, offer, discountPrice);

  if (result.success) {
    revalidatePath("/", "layout");
  }

  return result;
}
