# CLAUDE.md — Distribuidora Graser

Plataforma web de catálogo + carrito → WhatsApp para una tienda de electrónica y electricidad. **No es ecommerce con pagos online.** El cliente arma el pedido y la venta se cierra manualmente por WhatsApp con el dueño.

> Antes de codear cualquier feature, leé este archivo y los docs relevantes en [docs/](docs/). Si la feature está fuera del roadmap actual, confirmá con el usuario antes de implementar.

---

## Flujo de negocio

1. Cliente navega catálogo
2. Agrega productos al carrito (con cantidades)
3. Presiona **"Consultar por WhatsApp"**
4. Se abre WhatsApp con un mensaje pre-armado (lista + total estimado + datos)
5. El dueño cierra la venta manualmente

El reemplazo del Excel actual y la modernización del catálogo son los dos objetivos centrales.

---

## Stack obligatorio

| Capa | Tecnología |
|---|---|
| Framework | **Next.js 15 (App Router)** |
| Lenguaje | **TypeScript estricto** |
| UI | **TailwindCSS + shadcn/ui** |
| Estado cliente | **Zustand** (carrito persistido en localStorage) |
| Base de datos | **Google Sheets API** (oficial) |
| Auth | **NextAuth** (panel admin) |
| Forms | **React Hook Form + Zod** |
| Animaciones | **Framer Motion** |
| Imágenes | **Cloudinary** |

### Prohibido
- Redux, Material UI, Chakra, Bootstrap
- JavaScript sin TypeScript
- Pages Router
- PostgreSQL / Prisma / cualquier DB tradicional
- `any` salvo justificación explícita en comentario

---

## Documentación del proyecto

Los detalles viven en `docs/`. Cargar el doc relevante antes de trabajar en un módulo:

- [docs/architecture.md](docs/architecture.md) — Arquitectura general, capas, server vs client
- [docs/folder-structure.md](docs/folder-structure.md) — Estructura de carpetas
- [docs/conventions.md](docs/conventions.md) — Convenciones de código, naming, imports
- [docs/design-system.md](docs/design-system.md) — Reglas visuales, tokens, UX
- [docs/data-strategy-sheets.md](docs/data-strategy-sheets.md) — Cómo se modela y consulta Google Sheets
- [docs/cloudinary-integration.md](docs/cloudinary-integration.md) — Carga y uso de imágenes
- [docs/cart-whatsapp-strategy.md](docs/cart-whatsapp-strategy.md) — Carrito + deep link WhatsApp
- [docs/workflow.md](docs/workflow.md) — Cómo se desarrolla incrementalmente
- [docs/roadmap.md](docs/roadmap.md) — Módulos, orden y estado

---

## Reglas de trabajo (críticas)

1. **Trabajar incrementalmente.** Nunca implementar "toda la app" en una sola tanda. Un módulo a la vez, según [docs/roadmap.md](docs/roadmap.md).
2. **No inventar features fuera del scope.** Si el usuario no lo pidió y no está en el roadmap, no lo agregues.
3. **Server-first.** Server Components y Server Actions por defecto. `"use client"` solo cuando hay interactividad real (carrito, forms, animaciones).
4. **Tipado estricto.** Todo input/output de Sheets pasa por un schema Zod. Sin tipos `any`.
5. **Sheets es la fuente de verdad.** No duplicar productos en otra capa. Cache controlado, revalidación explícita.
6. **Mobile-first.** Probar diseño en mobile antes de desktop.
7. **Componentes reutilizables.** Antes de crear un componente nuevo, verificar si existe uno similar en `components/`.
8. **No commits automáticos.** Solo commitear cuando el usuario lo pida explícitamente.

---

## Modelo de Producto (referencia rápida)

```ts
type Product = {
  id: string;          // generado, estable
  sku: string;         // clave de negocio (importador la usa para upsert)
  nombre: string;
  descripcion: string;
  precio: number;
  imagenes: string[];  // URLs Cloudinary
  categoria: string;
  marca: string;
  stock: number;
  etiquetas: string[];
  destacado: boolean;
};
```

Schema completo + validación Zod en [docs/data-strategy-sheets.md](docs/data-strategy-sheets.md).

---

## Skills disponibles

Skills en `.claude/skills/` para tareas recurrentes:

- `sheets-sync` — agregar/editar lectura o escritura sobre Google Sheets
- `ui-component` — crear componente shadcn/ui consistente con el design system
- `whatsapp-message` — modificar el formato del mensaje del carrito
- `import-products` — trabajar sobre el importador CSV/XLSX
- `admin-feature` — agregar funcionalidad al panel admin
- `commit` — generar mensaje de commit en inglés + instrucciones de branch/push (solo instructivo, no ejecuta nada)

Cada skill tiene su `SKILL.md` con checklist y restricciones.

---

## Variables de entorno (planificadas)

```
GOOGLE_SHEETS_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_WHATSAPP_NUMBER=
NEXT_PUBLIC_SITE_URL=
```

`.env.local` no se commitea. `.env.example` se mantiene actualizado.

---

## Estado actual del proyecto

> **Fase 0 — Setup y documentación.** No hay código de aplicación todavía. Próximo paso: ver [docs/roadmap.md](docs/roadmap.md).
