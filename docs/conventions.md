# Convenciones de código

## TypeScript

- `strict: true`, `noUncheckedIndexedAccess: true`.
- Sin `any`. Si no hay alternativa, comentar el motivo en una línea.
- Tipos compartidos en `types/`. Tipos locales y privados quedan en el archivo.
- `type` para uniones/aliases, `interface` solo si hay razón (extends).
- Inferencia de retorno permitida salvo en API pública (services, server actions).

## Naming

| Cosa | Estilo | Ejemplo |
|---|---|---|
| Componente | PascalCase | `ProductCard.tsx` |
| Hook | kebab-case con prefijo `use-` | `use-cart.ts` |
| Service / lib / util | kebab-case | `products.service.ts`, `format-price.ts` |
| Server Action file | kebab-case | `server/actions/products.ts` |
| Tipos | PascalCase | `Product`, `CartItem` |
| Constantes | SCREAMING_SNAKE | `MAX_CART_ITEMS` |
| Variables / funciones | camelCase | `getProductBySku` |

Carpetas en kebab-case (`product-gallery/` no `ProductGallery/`).

## Archivos

- Un componente por archivo. Si hay subcomponentes solo usados ahí, viven en el mismo archivo.
- Export `default` solo para páginas/layouts de Next. El resto: named exports.
- `index.ts` solo para barrels de un módulo cerrado (ej. `components/ui/index.ts`).

## React

- Server Component por defecto. Marcar `"use client"` únicamente si hace falta.
- Props tipadas con `type Props = { ... }`. Sin `React.FC`.
- Lista → `key` estable (id), nunca el índice salvo orden inmutable.
- Sin lógica pesada en el render. Extraer a hook o util.

## Tailwind

- Mobile-first. `sm:`, `md:`, `lg:` solo para overrides hacia arriba.
- Usar `cn()` de `lib/utils.ts` (clsx + tailwind-merge) para clases condicionales.
- Tokens del design system (colores, spacing) en `tailwind.config.ts` — no hardcodear hex en componentes.
- Evitar `@apply` salvo en `globals.css` para utilidades muy repetidas.

## Forms

- React Hook Form + Zod, siempre.
- Schema en `lib/validators/<dominio>.ts` y reusado en cliente y server action.
- Mensajes de error en español.

## Server Actions

- Archivo empieza con `"use server"`.
- Firma: `(input) => Promise<{ ok: true; data: T } | { ok: false; error: string }>`.
- Validar `input` con Zod al entrar.
- Llamar `revalidateTag` / `revalidatePath` antes de devolver.

## Errores

- Errores de dominio: clases en `lib/sheets/errors.ts` etc.
- Nunca `console.log` en producción. `console.error` solo en handlers de error.
- Mensajes para el usuario en español, neutros, accionables.

## Comentarios

- Por defecto, no escribir comentarios. El código tiene que explicarse solo.
- Un comentario solo si captura un *por qué* no obvio (workaround, invariante oculta, restricción de Sheets).

## Tests

- Por ahora **no se exige test suite**. Si se agrega, Vitest + Testing Library. Se decide en el roadmap.
