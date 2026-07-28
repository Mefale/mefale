"use server";

import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { createProduct, updateProduct, deleteProduct } from "@/lib/sheets/products-crud";
import { getProductBySku } from "@/lib/sheets/products";
import { uploadImageFromUrl } from "@/lib/cloudinary/upload-from-url";

const ProductSchema = z.object({
  sku:      z.string().min(1, "SKU requerido"),
  category: z.string().min(1, "Categoría requerida"),
  name:     z.string().min(1, "Nombre requerido"),
  price:    z.number({ error: "Precio inválido" }).positive("El precio debe ser mayor a 0"),
  imageUrl: z.string().trim().default(""),
});

const UpdateSchema = ProductSchema.omit({ sku: true });

type Result = { success: boolean; error?: string };

async function requireSession(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return !!session?.user;
}

export async function createProductAction(
  data: { sku: string; category: string; name: string; price: number; imageUrl: string }
): Promise<Result> {
  if (!(await requireSession())) return { success: false, error: "No autorizado." };

  const parsed = ProductSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  let finalImageUrl = "";
  if (parsed.data.imageUrl) {
    const uploaded = await uploadImageFromUrl(parsed.data.imageUrl, parsed.data.sku);
    if (!uploaded.success) return { success: false, error: uploaded.error };
    finalImageUrl = uploaded.url;
  }

  return createProduct({ ...parsed.data, imageUrl: finalImageUrl });
}

export async function updateProductAction(
  sku: string,
  data: { category: string; name: string; price: number; imageUrl: string }
): Promise<Result> {
  if (!(await requireSession())) return { success: false, error: "No autorizado." };

  if (!sku?.trim()) return { success: false, error: "SKU requerido." };

  const parsed = UpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const currentProduct = await getProductBySku(sku);
  const currentImageUrl = currentProduct?.images[0] ?? "";

  let finalImageUrl = parsed.data.imageUrl;
  if (parsed.data.imageUrl && parsed.data.imageUrl !== currentImageUrl) {
    const uploaded = await uploadImageFromUrl(parsed.data.imageUrl, sku);
    if (!uploaded.success) return { success: false, error: uploaded.error };
    finalImageUrl = uploaded.url;
  }

  return updateProduct(sku, { ...parsed.data, imageUrl: finalImageUrl });
}

export async function deleteProductAction(sku: string): Promise<Result> {
  if (!(await requireSession())) return { success: false, error: "No autorizado." };

  if (!sku?.trim()) return { success: false, error: "SKU requerido." };

  return deleteProduct(sku);
}
