---
name: admin-feature
description: Use when adding or modifying functionality inside the /admin section — auth-protected pages, CRUD forms, image upload, server actions for product/category mutations.
---

# admin-feature

Skill para todo lo que vive en `/admin`.

## Antes de empezar

Leé:
- [docs/architecture.md](../../../docs/architecture.md) — sección Auth y Server Actions.
- [docs/data-strategy-sheets.md](../../../docs/data-strategy-sheets.md) si vas a mutar datos.
- [docs/cloudinary-integration.md](../../../docs/cloudinary-integration.md) si subís imágenes.

## Checklist

- [ ] Ruta bajo `app/admin/`, protegida por middleware NextAuth.
- [ ] Formularios con React Hook Form + Zod. Schema reusado entre cliente y server action.
- [ ] Mutaciones a través de **Server Actions** en `server/actions/`. No fetch a API routes propias.
- [ ] Server action firma: `(input) => Promise<{ ok: true; data: T } | { ok: false; error: string }>`.
- [ ] Validar input con Zod al entrar a la action.
- [ ] `revalidateTag` después de mutar.
- [ ] Toast de éxito/error con sonner.
- [ ] Estados loading (botón deshabilitado, spinner inline) y error (mensaje en el form).
- [ ] Mobile-first también en admin.

## Reglas

- Sin endpoints públicos para mutaciones — todo Server Actions.
- Imágenes: signed upload directo a Cloudinary, **no** pasar el archivo por el servidor.
- Borrado: soft delete por defecto.
- Mensajes de error en español, neutros, accionables.
- No exponer detalles de Sheets API al usuario final ("Error al guardar producto" en vez de "Sheets returned 429").
