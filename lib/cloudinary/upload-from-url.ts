import { getCloudinaryClient } from "./client";

type UploadResult =
  | { success: true; url: string }
  | { success: false; error: string };

const FOLDER = "mefale/products";

function isWellFormedUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function sanitizePublicId(sku: string): string {
  return sku.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
}

export async function uploadImageFromUrl(
  sourceUrl: string,
  sku: string
): Promise<UploadResult> {
  const trimmed = sourceUrl.trim();
  if (!isWellFormedUrl(trimmed)) {
    return { success: false, error: "La URL de la imagen no es válida." };
  }

  const cloudinary = getCloudinaryClient();

  try {
    const res = await cloudinary.uploader.upload(trimmed, {
      folder: FOLDER,
      public_id: sanitizePublicId(sku),
      overwrite: true,
      resource_type: "image",
      timeout: 15000,
    });
    return { success: true, url: res.secure_url };
  } catch (err) {
    console.error("[uploadImageFromUrl]", err);
    return {
      success: false,
      error:
        "No se pudo descargar/subir la imagen. Verificá que el link sea público y apunte a una imagen.",
    };
  }
}
