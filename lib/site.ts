/**
 * Configuración pública del sitio, usada para URLs canónicas, Open Graph,
 * sitemap y robots. `NEXT_PUBLIC_SITE_URL` debe apuntar al dominio de
 * producción para que los previews de WhatsApp y la indexación de Google usen
 * la URL correcta. El fallback es el dominio actual de Vercel: si algún día se
 * suma un dominio propio, basta con setear la variable de entorno.
 */
const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "https://graser.vercel.app";

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

/**
 * Máximo de productos por link de selección. La selección viaja dentro de la
 * URL, así que acotamos para no generar links enormes.
 */
export const MAX_SELECTION_ITEMS = 30;

/** Path relativo de una selección compartida (para <Link>). */
export function selectionPath(skus: string[]): string {
  const list = skus.slice(0, MAX_SELECTION_ITEMS).join(",");
  return `/selection?p=${encodeURIComponent(list)}`;
}

/**
 * URL absoluta de una selección compartida, lista para mandar por WhatsApp.
 *
 * `baseUrl` permite forzar el dominio: el admin pasa `window.location.origin`
 * para que el link apunte siempre al sitio desde donde se está usando el panel,
 * sin depender de que NEXT_PUBLIC_SITE_URL esté bien seteada en cada entorno.
 */
export function selectionUrl(skus: string[], baseUrl?: string): string {
  const base = (baseUrl?.replace(/\/$/, "") || SITE_URL);
  return `${base}${selectionPath(skus)}`;
}

/** Lee el parámetro `p` de una selección y devuelve los SKU (acotados). */
export function parseSelectionParam(p?: string): string[] {
  if (!p) return [];
  return p
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_SELECTION_ITEMS);
}
