# Roadmap

Estado: ☐ pendiente · ◐ en progreso · ☑ hecho

## Fase 0 — Setup y documentación
- ☑ CLAUDE.md + docs base
- ☑ Skills de Claude Code
- ☑ Inicializar Next.js 15 (App Router, TS, Tailwind)
- ☑ Instalar shadcn/ui base + tokens del design system
- ☑ Configurar `.env.example`, alias `@/*`, ESLint
- ☑ Layout root, navbar, footer, container

## Fase 1 — Base visual (datos mockeados)
- ☑ Layout público + navbar + footer
- ☑ HeroSection animada
- ☑ Homepage: hero + categorías + destacados + CTA
- ☑ Página `/productos` con filtros por categoría
- ☑ ProductCard + ProductGrid
- ☑ CategoryCard
- ☑ Mock data: 12 productos, 6 categorías

## Fase 2 — Carrito + WhatsApp
- ☑ Zustand store (`grasser-cart-v1`) con persist
- ☑ `useCart` hook + hidratación SSR-safe
- ☑ `AddToCartButton` con feedback visual
- ☑ `CartDrawer` (slide-in, Framer Motion)
- ☑ Controles de cantidad (−/+/eliminar)
- ☑ Datos opcionales del cliente (nombre/teléfono)
- ☑ `buildWhatsAppMessage` + deep link
- ☑ Página `/carrito`
- ☑ Badge contador en navbar

## Fase 2 — Carrito + WhatsApp
- ☐ Zustand store con persist
- ☐ CartDrawer (Sheet shadcn)
- ☐ Página `/carrito`
- ☐ `lib/whatsapp/build-message.ts`
- ☐ Modal opcional de datos del cliente
- ☐ Botón "Consultar por WhatsApp"

## Fase 3 — Filtros y búsqueda
- ☐ Filtro por categoría (URL state)
- ☐ Filtro por marca
- ☐ Búsqueda por nombre/SKU
- ☐ Orden por precio / destacados
- ☐ Paginación o infinite scroll

## Fase 4 — Admin (auth + CRUD)
- ☐ NextAuth configurado
- ☐ Middleware proteger `/admin/*`
- ☐ Layout admin
- ☐ Listado productos admin
- ☐ Form alta/edición producto
- ☐ ImageUploader (Cloudinary signed)
- ☐ Eliminar producto (soft delete)
- ☐ CRUD categorías

## Fase 5 — Importador
- ☐ Parser CSV/XLSX
- ☐ Validación + preview
- ☐ Bulk upsert por SKU
- ☐ Reporte de resultados

## Fase 6 — Pulido
- ☐ SEO + metadata por página
- ☐ OpenGraph
- ☐ Sitemap + robots
- ☐ Lighthouse audit
- ☐ Animaciones Framer Motion
- ☐ Empty/error states finales
- ☐ Skeletons completos

## Backlog (sin priorizar)
- Modo claro
- Cleanup de imágenes huérfanas en Cloudinary
- Métricas / analytics
- Multi-admin con roles
- Productos relacionados / "también podría interesarte"
