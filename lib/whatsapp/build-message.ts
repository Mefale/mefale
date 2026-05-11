import { formatPrice } from "@/utils/format-price";
import type { CartItem } from "@/types/cart";

type Customer = {
  name?: string;
};

export function buildWhatsAppMessage(
  items: CartItem[],
  customer?: Customer
): string {
  const lines = items.map(
    (item) =>
      `- ${item.name} (${item.sku}) x${item.quantity} — ${formatPrice(item.price * item.quantity)}`
  );

  const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const parts: string[] = [
    "Hola, quiero consultar por estos productos:",
    "",
    ...lines,
    "",
    `Total estimado: ${formatPrice(total)}`,
  ];

  if (customer?.name) {
    parts.push("");
    parts.push(`Mi nombre es: ${customer.name}`);
  }

  parts.push("", "Gracias.");

  return parts.join("\n");
}

export function buildWhatsAppUrl(message: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5491100000000";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
