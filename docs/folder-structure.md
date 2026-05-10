# Estructura de carpetas

```
mefale/
├── app/
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # home
│   │   ├── productos/
│   │   │   ├── page.tsx              # listado + filtros
│   │   │   └── [slug]/page.tsx       # detalle
│   │   ├── categorias/[slug]/page.tsx
│   │   └── carrito/page.tsx
│   ├── admin/
│   │   ├── layout.tsx                # protegido
│   │   ├── page.tsx                  # dashboard
│   │   ├── productos/
│   │   │   ├── page.tsx
│   │   │   ├── nuevo/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── categorias/page.tsx
│   │   └── importar/page.tsx
│   ├── api/
│   │   └── auth/[...nextauth]/route.ts
│   ├── layout.tsx                    # root
│   ├── not-found.tsx
│   └── error.tsx
│
├── components/
│   ├── ui/                           # shadcn primitives
│   ├── layout/                       # navbar, footer, container
│   ├── product/                      # ProductCard, ProductGrid, ProductGallery
│   ├── cart/                         # CartDrawer, CartItem, CartSummary, WhatsAppButton
│   ├── admin/                        # ProductForm, ImageUploader, ImporterPreview
│   └── common/                       # EmptyState, Skeleton, Toast wrapper
│
├── lib/
│   ├── sheets/
│   │   ├── client.ts                 # auth + cliente
│   │   ├── products.ts               # CRUD productos
│   │   ├── categories.ts
│   │   └── schema.ts                 # nombres de hojas, columnas
│   ├── cloudinary/
│   │   ├── client.ts
│   │   └── upload.ts                 # signed uploads
│   ├── auth/
│   │   └── options.ts                # NextAuth config
│   ├── whatsapp/
│   │   └── build-message.ts
│   ├── validators/                   # esquemas Zod compartidos
│   └── utils.ts                      # cn, formatters
│
├── hooks/
│   ├── use-cart.ts
│   ├── use-products.ts
│   └── use-debounce.ts
│
├── store/
│   └── cart-store.ts                 # Zustand + persist
│
├── services/
│   ├── products.service.ts
│   ├── categories.service.ts
│   └── importer.service.ts
│
├── server/
│   └── actions/
│       ├── products.ts
│       ├── categories.ts
│       └── import.ts
│
├── types/
│   ├── product.ts
│   ├── category.ts
│   └── cart.ts
│
├── utils/
│   ├── format-price.ts
│   ├── slugify.ts
│   └── parse-spreadsheet.ts
│
├── docs/                             # documentación del proyecto
├── public/
├── .claude/skills/                   # skills de Claude Code
├── .env.example
├── CLAUDE.md
└── README.md
```

## Reglas de ubicación

| Si es… | Va en… |
|---|---|
| Primitiva visual sin lógica | `components/ui/` (shadcn) |
| Componente con lógica de un dominio | `components/<dominio>/` |
| Lógica reusable client-side | `hooks/` |
| Estado global cliente | `store/` |
| Lógica de negocio (puro) | `services/` |
| I/O contra Sheets / Cloudinary | `lib/<integración>/` |
| Mutación llamada desde UI | `server/actions/` |
| Tipo compartido | `types/` |
| Helper puro sin I/O | `utils/` |

## Imports

Usar alias `@/*` para todo lo interno. Nunca paths relativos largos (`../../../`).
