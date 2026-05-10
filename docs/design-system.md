# Design system y UX

## Identidad visual

- **Tono:** moderno, premium, minimalista, profesional.
- **Referencias:** Apple (spacing, tipografía, calma), Mercado Libre (densidad de catálogo manejable), tiendas de tech modernas.
- **Personalidad:** electricidad / electrónica → acentos sutiles tipo neón, sin saturar.

## Modo y paleta

Modo oscuro como default. (Modo claro queda fuera del MVP salvo pedido explícito.)

```
background      #09090B   (zinc-950)
surface         #18181B   (zinc-900)
surface-2       #27272A   (zinc-800)
border          #3F3F46   (zinc-700)
text            #FAFAFA   (zinc-50)
text-muted      #A1A1AA   (zinc-400)
accent          #38BDF8   (sky-400)   ← neón eléctrico
accent-strong   #0EA5E9   (sky-500)
success         #22C55E
warning         #F59E0B
danger          #EF4444
```

Definir como variables CSS en `globals.css` y mapearlas en `tailwind.config.ts` (`bg-background`, `text-muted`, `border-border`, etc.).

## Tipografía

- Sans: **Geist** o **Inter** (vía `next/font`).
- Mono solo para SKU/códigos.
- Escala: `text-sm` 14, `text-base` 16, `text-lg` 18, `text-xl` 20, `text-2xl` 24, `text-3xl` 30, `text-4xl` 36.

## Spacing

- Padding generoso. Containers con `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- Gaps: `gap-4` mínimo en grids; `gap-8` entre secciones.
- Secciones con `py-16` mínimo en desktop, `py-10` en mobile.

## Componentes (shadcn)

Instalar progresivamente lo que se usa: `button`, `card`, `input`, `label`, `dialog`, `sheet` (drawer carrito), `dropdown-menu`, `toast` (sonner), `skeleton`, `badge`, `select`, `separator`, `table`.

## Animaciones (Framer Motion)

- Sutiles. `fade + slide-up 12px` para entradas. Duración 200–350ms. Easing `easeOut`.
- Hover: `scale-[1.02]` o `translate-y-0.5` con `transition-transform`.
- Sin animaciones que bloqueen la interacción.

## Estados obligatorios por pantalla

Toda pantalla con datos debe contemplar:

1. **Loading** → Skeleton específico (no spinner solo).
2. **Empty** → ilustración/ícono + mensaje + CTA.
3. **Error** → mensaje claro + acción de reintento.
4. **Success de mutación** → toast (sonner).

## Mobile-first

- Layouts probados primero a 375px de ancho.
- Tap targets ≥ 44px.
- Drawer (Sheet) para carrito y filtros en mobile; sidebar en desktop.

## Accesibilidad

- Contraste WCAG AA mínimo.
- `aria-label` en íconos sin texto.
- Foco visible (no quitar `focus-visible`).
- Forms con labels asociadas.

## Performance percibida

- Skeletons inmediatos con Suspense.
- `next/image` con `priority` solo en imagen above-the-fold.
- Prefetch de links importantes.

## Lo que NO se hace

- Gradientes saturados de moda 2018.
- Carruseles auto-play.
- Modales sobre modales.
- Animaciones de entrada que retrasen el contenido más de 400ms.
- Toasts persistentes.
