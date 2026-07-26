export type TrackOrderItem = {
  sku: string;
  name: string;
  quantity: number;
  price: number;
};

export type TrackOrderPayload = {
  customerName: string;
  phone: string;
  items: TrackOrderItem[];
  total: number;
  discountPercentage: number;
};

/**
 * Registra el pedido en Google Sheets (vía /api/track-order).
 *
 * Antes esto era un `fetch(...).catch(() => {})` que se tragaba cualquier fallo
 * en silencio: si Sheets fallaba, el pedido no quedaba registrado y nadie se
 * enteraba. Ahora reintenta una vez y devuelve si tuvo éxito, para que el caller
 * pueda avisar al cliente que reenvíe el mensaje. `keepalive` permite que el
 * request sobreviva aunque la pestaña navegue.
 */
export async function trackOrder(payload: TrackOrderPayload): Promise<boolean> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch("/api/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      });
      if (res.ok) return true;
    } catch {
      // Reintentar una vez ante fallo de red.
    }
    if (attempt === 0) await new Promise((r) => setTimeout(r, 800));
  }
  console.warn("[trackOrder] no se pudo registrar el pedido tras reintento");
  return false;
}
