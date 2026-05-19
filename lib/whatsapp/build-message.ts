import { formatPrice } from "@/utils/format-price";
import type { CartItem } from "@/types/cart";

type Customer = {
  name?: string;
};

export function buildWhatsAppMessage(
  items: CartItem[],
  customer?: Customer,
  discountPercentage?: number
): string {
  const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const hasDiscount = !!discountPercentage && discountPercentage > 0;
  const factor = hasDiscount ? 1 - discountPercentage / 100 : 1;

  const lines = items.map((item) => {
    const original = item.price * item.quantity;
    if (hasDiscount) {
      const discounted = original * factor;
      return `* ${item.name} (${item.sku}) x${item.quantity} — _~${formatPrice(original)}~_ *${formatPrice(discounted)}*`;
    }
    return `* ${item.name} (${item.sku}) x${item.quantity} — *${formatPrice(original)}*`;
  });

  const parts: string[] = [
    "Hola, quiero consultar por estos productos:",
    "",
    ...lines,
    "",
  ];

  if (hasDiscount) {
    const discounted = total * factor;
    parts.push(`*Subtotal:* ${formatPrice(total)}`);
    parts.push(`*Descuento:* ${discountPercentage}%`);
    parts.push(`*Total con descuento:* ${formatPrice(discounted)}`);
  } else {
    parts.push(`*Total estimado:* ${formatPrice(total)}`);
  }

  if (customer?.name) {
    parts.push("");
    parts.push(`*Mi nombre es:* ${customer.name}`);
  }

  parts.push("", "¡Gracias!");

  return parts.join("\n");
}

export function buildWhatsAppUrl(message: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5491100000000";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
