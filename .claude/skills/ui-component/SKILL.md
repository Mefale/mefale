---
name: ui-component
description: Use when creating or modifying React components for the storefront or admin. Enforces design system tokens, shadcn/ui patterns, mobile-first responsive rules, and required loading/empty/error states.
---

# ui-component

Skill para crear o modificar componentes UI consistentes con el design system.

## Antes de empezar

1. Leé [docs/design-system.md](../../../docs/design-system.md).
2. Buscá en `components/` si ya existe algo similar antes de crear nuevo.
3. Decidí si es Server o Client Component (default: Server).

## Checklist

- [ ] Tokens de Tailwind del design system (`bg-background`, `text-muted`, `border-border`, `text-accent`). Sin hex hardcodeados.
- [ ] Mobile-first. Probado a 375px antes de desktop.
- [ ] `"use client"` solo si hay state, effects, o handlers.
- [ ] Props tipadas con `type Props = { ... }`. Sin `React.FC`.
- [ ] Si el componente muestra datos: implementar **loading**, **empty**, **error**.
- [ ] Skeleton específico (no spinner solo).
- [ ] Animaciones: Framer Motion sutil (200–350ms, `easeOut`) o transiciones Tailwind.
- [ ] Accesibilidad: foco visible, `aria-label` en íconos sin texto, contraste AA.
- [ ] Tap target ≥ 44px en mobile.

## Estructura

- Primitiva visual sin lógica → `components/ui/` (shadcn).
- Componente de dominio → `components/<dominio>/<NombreComponente>.tsx`.
- Subcomponentes solo usados ahí → mismo archivo.

## Reglas

- `cn()` para clases condicionales (`lib/utils.ts`).
- `next/image` siempre para imágenes. `priority` solo en above-the-fold.
- Lista → `key` por id, nunca por índice salvo lista inmutable.
- Sin lógica pesada en render — extraer a hook o util.

## Antipatrones

- Modal sobre modal.
- Carrusel auto-play.
- Toasts persistentes.
- Animaciones que retrasen el LCP.
