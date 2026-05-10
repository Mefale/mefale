# Carrito + WhatsApp

El carrito vive **completamente en el cliente**. Nunca se persiste server-side. El "checkout" es un deep link de WhatsApp con el resumen pre-armado.

## Store (Zustand + persist)

`store/cart-store.ts`:

```ts
type CartItem = {
  id: string;        // product.id
  sku: string;
  nombre: string;
  precio: number;    // snapshot al agregar
  imagen?: string;
  cantidad: number;
};

type CartState = {
  items: CartItem[];
  add: (product: Product, cantidad?: number) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, cantidad: number) => void;
  clear: () => void;
  // selectores
  subtotal: () => number;
  itemCount: () => number;
};
```

- Middleware `persist` con `name: "grasser-cart-v1"`.
- Versión en el nombre para invalidar en cambios de schema.
- `add` con mismo `id` → suma `cantidad`.
- `setQuantity(id, 0)` → remove.

## Hidratación

Zustand `persist` puede causar mismatch SSR/CSR. Patrón:

```ts
const hydrated = useCartHydrated();
if (!hydrated) return <CartSkeleton />;
```

O usar `useCart` solo en componentes `"use client"` con `useEffect`.

## UI del carrito

- **Drawer (Sheet shadcn)** abierto desde el ícono de la navbar.
- Dentro: lista, controles cantidad (− / input / +), eliminar, subtotal, botón **"Consultar por WhatsApp"**.
- Página dedicada `/carrito` para mobile o cuando el usuario quiere más espacio.
- Empty state con CTA a `/productos`.

## Mensaje de WhatsApp

`lib/whatsapp/build-message.ts`:

```ts
buildWhatsAppMessage({
  items: CartItem[],
  customer?: { nombre?: string; telefono?: string }
}): string
```

Formato:

```
Hola, quiero consultar por estos productos:

- Producto X (SKU123) x2 — $4.000
- Producto Y (SKU456) x5 — $12.500

Total estimado: $16.500

Mi nombre es: <nombre>
Mi teléfono es: <telefono>

Gracias.
```

- Si no hay datos del cliente, omitir esas líneas.
- Precio formateado con `format-price.ts` (separador de miles `.`, sin decimales).
- "Total estimado" deja claro que el precio final lo confirma el dueño.

## Deep link

```ts
const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
```

- `WHATSAPP_NUMBER` desde `NEXT_PUBLIC_WHATSAPP_NUMBER`, formato internacional sin `+` ni espacios (ej: `5491122334455`).
- Abrir con `window.open(url, "_blank")` para no perder el carrito.
- **No vaciar el carrito** automáticamente al consultar (por si el usuario vuelve).

## Datos del cliente (opcionales)

Antes de abrir WhatsApp, modal pequeño pidiendo `nombre` y `telefono` (no obligatorio, skippeable). Esto:

- mejora la calidad del lead
- ayuda al dueño a identificar antes de abrir el chat

Implementación en form simple con React Hook Form + Zod (`min(0)` salvo si se decide hacer obligatorio).

## Reglas

- Snapshot del precio al agregar al carrito. Si el precio cambia en Sheets, el carrito muestra el viejo (es solo una consulta, el dueño confirma en WhatsApp).
- Stock: mostrar advertencia si `cantidad > stock`, pero **no bloquear**. Sigue siendo una consulta.
- Carrito tiene tope razonable (`MAX_CART_ITEMS = 50`) para evitar abusos.
