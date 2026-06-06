# Plan: Badge "OFERTA" en ProductCard + columna `Oferta` en Sheets

## Context

Hoy la detección de "qué productos son oferta" depende de dos cosas frágiles:

1. Una constante hardcodeada `OFFER_CATEGORY = "bases"` (con TODO de cambiar a "oferta") en [app/(public)/page.tsx](../../app/(public)/page.tsx) y [app/(public)/products/page.tsx](../../app/(public)/products/page.tsx).
2. Un mock que pisa el `discountPrice` del primer producto de esa categoría con `Math.round(p.price * 0.85)`.

Además, las cards del catálogo regular ([ProductCard.tsx](../../components/product/ProductCard.tsx)) muestran el precio rebajado y el % descuento cuando hay `discountPrice`, pero **no muestran ningún badge visible** que comunique "este producto está en oferta" al estilo del badge `Destacado` ni del badge `OFERTA` rojo que sí tiene `OfferCard` dentro de [OffersSection.tsx](../../components/product/OffersSection.tsx).

El usuario va a agregar una **nueva columna `Oferta` en Sheets**: una `x` en la fila marca al producto como oferta. Esta columna pasa a ser la fuente única de verdad — independiente de la categoría y del `discountPrice` (un producto puede estar marcado como oferta aunque no tenga aún precio rebajado cargado).

**Outcome esperado:** marcar con `x` en Sheets → el producto aparece con badge rojo "OFERTA" en su card del catálogo y entra a la `OffersSection`. Si además tiene `DiscountPrice` cargado, sigue mostrando el precio tachado y el % como ya hace hoy.

## Cambios

### 1. Tipo `Product`
**Archivo:** [types/product.ts](../../types/product.ts)
- Agregar campo `isOffer: boolean` (no opcional, default `false` en el parser).

### 2. Parser de Sheets
**Archivo:** [lib/sheets/products.ts](../../lib/sheets/products.ts)
- Cambiar `RANGE = "A2:E"` → `"A2:F"`.
- Actualizar comentario de columnas: `A=SKU, B=Category, C=Name, D=Price, E=DiscountPrice, F=Offer`.
- En `rowToProduct`: destructurar 6° valor `offerCol`.
- Parsear como oferta si `offerCol?.trim().toLowerCase()` es alguno de: `"x"`, `"true"`, `"1"`, `"si"`, `"sí"`. Asignar `isOffer: <boolean>` al objeto retornado.

### 3. Badge en `ProductCard`
**Archivo:** [components/product/ProductCard.tsx](../../components/product/ProductCard.tsx)
- En el overlay de la imagen (donde está el badge `Destacado`), agregar badge `OFERTA` cuando `product.isOffer === true`.
- Reusar paleta roja existente del proyecto (`#DC2626` ya en uso para el precio rebajado y en `OffersSection`).
- Posicionar `top-2 right-2` para no chocar con `Destacado` (que va `top-2 left-2`). Si el producto fuera ambas cosas, quedan uno a cada lado.
- No tocar la lógica de precio existente — sigue funcionando igual basada en `discountPrice`.

### 4. Filtro de productos en oferta
**Archivos:** [app/(public)/page.tsx](../../app/(public)/page.tsx), [app/(public)/products/page.tsx](../../app/(public)/products/page.tsx)
- Eliminar la constante `OFFER_CATEGORY` y su TODO.
- Reemplazar el filtro `p.category.toLowerCase() === OFFER_CATEGORY` por `p.isOffer`.
- **Eliminar el mock** `.map((p, i) => (i === 0 ? { ...p, discountPrice: Math.round(p.price * 0.85) } : p))` — los productos sin `discountPrice` cargado en Sheets se mostrarán en `OffersSection` con badge pero sin precio tachado. (Si más adelante se decide que la OffersSection solo debe mostrar productos con descuento real, se puede agregar `.filter(p => p.discountPrice)` como segundo filtro, pero no es lo que el usuario pidió ahora.)

## Archivos modificados

- [types/product.ts](../../types/product.ts)
- [lib/sheets/products.ts](../../lib/sheets/products.ts)
- [components/product/ProductCard.tsx](../../components/product/ProductCard.tsx)
- [app/(public)/page.tsx](../../app/(public)/page.tsx)
- [app/(public)/products/page.tsx](../../app/(public)/products/page.tsx)

## Verificación

1. **Agregar columna F en Sheets** con header `Oferta` y poner `x` en 2–3 filas (al menos una con `DiscountPrice` cargado y otra sin).
2. `npm run build` vía WSL con Node 20 — debe compilar sin errores TS.
3. `npm run dev` y abrir:
   - `/` → la `OffersSection` debe mostrar exactamente los productos marcados con `x`.
   - `/products` → las cards de esos productos deben mostrar badge rojo `OFERTA` en `top-2 right-2`.
   - Una card que sea `featured` Y `isOffer` debe mostrar ambos badges sin solaparse.
   - Productos sin `x` no deben mostrar badge, aunque tengan `DiscountPrice` (el precio tachado sí sigue apareciendo — son cosas independientes).
4. Revalidar cache (`/api/revalidate` si existe, o esperar 1h) tras cambios en Sheets.

## Fuera de scope (sugerencias para más adelante)

- Badge de oferta dentro de `ProductModal.tsx` (consistencia con la card).
- Diferenciar visualmente `isOffer` vs descuento global en `CartDrawer`.
- Renombrar `OffersSection`'s `OfferCard` para reusar `ProductCard` y evitar duplicación de estilos de precio.
