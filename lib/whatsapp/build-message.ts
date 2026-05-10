import { formatPrice } from "@/utils/format-price";
import type { CartItem } from "@/types/cart";

type Customer = {
  nombre?: string;
};

export function buildWhatsAppMessage(
  items: CartItem[],
  customer?: Customer
): string {
  const lines = items.map(
    (item) =>
      `- ${item.nombre} (${item.sku}) x${item.cantidad} — ${formatPrice(item.precio * item.cantidad)}`
  );

  const total = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  const parts: string[] = [
    "Hola, quiero consultar por estos productos:",
    "",
    ...lines,
    "",
    `Total estimado: ${formatPrice(total)}`,
  ];

  if (customer?.nombre) {
    parts.push("");
    parts.push(`Mi nombre es: ${customer.nombre}`);
  }

  parts.push("", "Gracias.");

  return parts.join("\n");
}

export function buildWhatsAppUrl(message: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5491100000000";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
