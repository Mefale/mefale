---
name: import-products
description: Use when working on the CSV/XLSX product importer — parsing, validation, preview, bulk upsert by SKU into Google Sheets, and result reporting.
---

# import-products

Skill para el importador masivo de productos.

## Antes de empezar

Leé:
- [docs/data-strategy-sheets.md](../../../docs/data-strategy-sheets.md) — sección Importador y Schema Zod.

## Checklist

- [ ] Soporta CSV y XLSX (libs: `papaparse`, `xlsx`).
- [ ] Valida headers contra el schema. Headers desconocidos → warning, no fail.
- [ ] Valida filas con `productSchema` relajado (`id`, `createdAt`, `updatedAt` opcionales).
- [ ] Genera `id` (UUID) y timestamps para nuevos.
- [ ] **Preview obligatoria** antes de confirmar: tabla con creados / actualizados / errores.
- [ ] Match por `sku` para upsert. Sin SKU → fila inválida.
- [ ] Una sola llamada `bulkUpsert` al confirmar (no loop de updates).
- [ ] `revalidateTag("products")` al terminar.
- [ ] Reporte final: counts + lista de filas con error (con número de fila original).

## UI

- Página `/admin/importar`.
- Drag & drop o input file.
- Pasos visibles: Upload → Preview → Confirmar → Resultado.
- Botón "Cancelar" disponible en Preview.

## Reglas

- Filas inválidas no abortan la operación — se saltan y se reportan.
- Imágenes en CSV vienen como URLs separadas por `|`.
- Booleanos: aceptar `TRUE/FALSE`, `true/false`, `1/0`, `sí/no`.
- No tocar productos que no aparecen en el archivo (no es un sync destructivo).
