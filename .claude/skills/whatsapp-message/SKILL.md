---
name: whatsapp-message
description: Use when modifying the cart's WhatsApp message format, the deep link builder, or the customer info modal that feeds the message.
---

# whatsapp-message

Skill para tocar el armado del mensaje de WhatsApp y el deep link.

## Antes de empezar

Leé [docs/cart-whatsapp-strategy.md](../../../docs/cart-whatsapp-strategy.md). El formato exacto y las reglas viven ahí.

## Checklist

- [ ] La función vive en `lib/whatsapp/build-message.ts`. Pura, sin I/O, sin DOM.
- [ ] Acepta `items: CartItem[]` y `customer?: { nombre?, telefono? }`.
- [ ] Si faltan datos del cliente, **omitir** las líneas (no dejar "Mi nombre es: ").
- [ ] Precios formateados con `format-price` (separador miles `.`, sin decimales, prefijo `$`).
- [ ] Texto exactamente como en el doc (incluida la línea "Total estimado:").
- [ ] Deep link: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`.
- [ ] `WHATSAPP_NUMBER` desde `NEXT_PUBLIC_WHATSAPP_NUMBER`. Validar formato (solo dígitos, sin `+`).
- [ ] Abrir con `window.open(url, "_blank")`.
- [ ] **No vaciar el carrito** al hacer click.

## Reglas

- Snapshot del precio (el del item, no re-leer de Sheets).
- Stock: si `cantidad > stock`, agregar línea de advertencia *en la UI*, no en el mensaje.
- Mensaje en español neutro.
