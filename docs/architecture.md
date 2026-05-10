# Arquitectura

## Principios

- **Server-first:** Server Components y Server Actions por defecto.
- **Client cuando hay estado interactivo:** carrito, forms, modales, animaciones.
- **Sheets como única fuente de datos persistente.** Cache de Next gestiona la performance.
- **Capas claras:** UI → hooks/store → services → Sheets API.
- **Tipado estricto end-to-end:** Zod valida en el borde (Sheets ↔ app).

## Capas

```
┌─────────────────────────────────────────────┐
│  app/  (rutas, layouts, páginas, RSC)       │
│  ├─ Server Components → fetch directo       │
│  └─ Client Components → leen store/hook     │
└─────────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────────┐
│  components/  (UI reutilizable)             │
│  └─ ui/ (shadcn) + features/ + layout/      │
└─────────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────────┐
│  hooks/   |   store/  (Zustand, cliente)    │
└─────────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────────┐
│  services/  (lógica de negocio)             │
│  └─ products, categories, importer          │
└─────────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────────┐
│  lib/sheets/  (cliente Google Sheets API)   │
│  lib/cloudinary/  (upload, transform)       │
│  lib/auth/  (NextAuth)                      │
└─────────────────────────────────────────────┘
                  │
              Google Sheets / Cloudinary
```

## Server vs Client

| Caso | Tipo |
|---|---|
| Listado de productos, página de detalle, home | Server Component |
| Filtros que no cambian URL | Client Component |
| Filtros que se reflejan en URL | Server Component + `searchParams` |
| Carrito | Client (Zustand + localStorage) |
| Formularios admin | Client + Server Action |
| Subida de imagen | Client (signed upload Cloudinary) |
| Auth callback / sesión | Server |

## Data fetching

- **Lectura pública:** Server Components con `fetch` cacheado o `unstable_cache` envolviendo la llamada al service.
- **Escritura:** Server Actions. Tras una mutación, `revalidatePath` o `revalidateTag` sobre las rutas afectadas.
- **Carrito:** nunca toca el servidor. Vive en Zustand + localStorage.

## Cache strategy

- Tag `products` para todas las lecturas de productos.
- Tag `categories` para categorías.
- Mutaciones del admin → `revalidateTag('products')` (o el tag pertinente).
- TTL razonable (ej. 60s) como red de seguridad si falla la invalidación.

## Errores

- Services lanzan errores tipados (`SheetsError`, `ValidationError`).
- Server Actions devuelven `{ ok: true, data } | { ok: false, error }`. No tirar excepciones al cliente.
- UI tiene `error.tsx` y `not-found.tsx` por segmento de ruta crítico.

## Auth

- NextAuth con provider Credentials (usuario/clave de admin) **o** Google restringido por email allowlist (a confirmar con el usuario).
- Middleware protege `/admin/*`.
- Sesión JWT.

## Performance

- `next/image` siempre, con dominios Cloudinary configurados.
- Fonts con `next/font`.
- Suspense + skeletons para listas grandes.
- Paginación o cursor en listados largos.
