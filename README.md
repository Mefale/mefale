# Distribuidora Graser

Plataforma web de catálogo y carrito para una tienda de electrónica y electricidad. El cliente arma su pedido y cierra la venta por WhatsApp con el dueño — sin pagos online.

---

## ¿Qué hace?

- Navegar el catálogo con filtros por categoría y marca
- Ver ofertas destacadas en la home
- Agregar productos al carrito con cantidades
- Consultar por WhatsApp con un mensaje pre-armado (lista + total)
- Panel admin para gestionar productos, ofertas e importar desde Excel/CSV

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 · App Router · TypeScript |
| UI | TailwindCSS · shadcn/ui · Framer Motion |
| Estado | Zustand (carrito persistido en localStorage) |
| Base de datos | Google Sheets API |
| Auth | NextAuth (panel admin) |
| Imágenes | Cloudinary |
| Forms | React Hook Form · Zod |

---

## Páginas

**Públicas**
- `/` — Home con hero, categorías, ofertas y catálogo destacado
- `/products` — Catálogo completo con filtros
- `/cart` — Carrito y botón de consulta WhatsApp

**Admin** (requiere login)
- `/admin` — Dashboard
- `/admin/import` — Importar productos desde CSV/XLSX
- `/admin/offers` — Gestión de ofertas
- `/admin/orders` — Ver pedidos
- `/admin/settings` — Configuración

---

## Estado del proyecto

| Fase | Descripción | Estado |
|---|---|---|
| 0 | Setup, documentación, layout base | ✅ Completo |
| 1 | Catálogo visual con datos mockeados | ✅ Completo |
| 2 | Carrito + integración WhatsApp | ✅ Completo |
| 3 | Filtros y búsqueda | 🔄 En progreso |
| 4 | Panel admin con CRUD completo | 🔄 En progreso |
| 5 | Importador CSV/XLSX | 🔄 En progreso |
| 6 | SEO, performance, pulido final | ⏳ Pendiente |

---

## Correr el proyecto localmente

**Requisitos:** Node.js 20+, una cuenta de Google Cloud con Sheets API habilitada, cuenta Cloudinary.

```bash
git clone https://github.com/tu-usuario/mefale.git
cd mefale
npm install
cp .env.example .env.local
# Completar variables en .env.local
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

---

## Variables de entorno

Ver [`.env.example`](.env.example) para la lista completa. Las principales:

```
# Google Sheets
GOOGLE_SHEETS_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=

# Admin
NEXTAUTH_SECRET=
NEXTAUTH_URL=
ADMIN_EMAIL=
ADMIN_PASSWORD=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=

# WhatsApp (número sin + ni espacios, formato internacional)
NEXT_PUBLIC_WHATSAPP_NUMBER=
```

---

## Documentación técnica

Toda la guía de arquitectura y convenciones vive en [`docs/`](docs/):

- [Arquitectura](docs/architecture.md)
- [Estructura de carpetas](docs/folder-structure.md)
- [Convenciones de código](docs/conventions.md)
- [Design system](docs/design-system.md)
- [Google Sheets — modelo de datos](docs/data-strategy-sheets.md)
- [Cloudinary](docs/cloudinary-integration.md)
- [Carrito + WhatsApp](docs/cart-whatsapp-strategy.md)
- [Roadmap](docs/roadmap.md)
