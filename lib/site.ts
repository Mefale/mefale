/**
 * Configuración pública del sitio, usada para URLs canónicas, Open Graph,
 * sitemap y robots. `NEXT_PUBLIC_SITE_URL` debe apuntar al dominio de
 * producción (ej: https://distribuidoragraser.com) para que los previews de
 * WhatsApp y la indexación de Google usen la URL correcta.
 */
const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "https://distribuidoragraser.com";

/** URL base sin barra final. */
export const SITE_URL = raw.replace(/\/$/, "");

export const SITE_NAME = "Distribuidora Graser";

/** URL absoluta de la ficha de un producto, lista para compartir. */
export function productUrl(sku: string): string {
  return `${SITE_URL}/products/${encodeURIComponent(sku)}`;
}

/** Path relativo de la ficha de un producto (para <Link>). */
export function productPath(sku: string): string {
  return `/products/${encodeURIComponent(sku)}`;
}
