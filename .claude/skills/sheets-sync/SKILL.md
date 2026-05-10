---
name: sheets-sync
description: Use when adding, modifying, or debugging read/write operations against Google Sheets (productos, categorias, marcas). Covers schema, parsing, cache invalidation, and quota handling.
---

# sheets-sync

Aplicá esta skill cuando toques cualquier cosa relacionada con la lectura o escritura sobre Google Sheets.

## Antes de empezar

1. Leé [docs/data-strategy-sheets.md](../../../docs/data-strategy-sheets.md). El schema de hojas y los nombres de columnas viven ahí.
2. Confirmá si la operación necesita ser server (siempre) o si la dispara una server action.

## Checklist

- [ ] La operación vive en `lib/sheets/<dominio>.ts`. No hacer fetch a Sheets desde componentes.
- [ ] Parseo y validación con Zod de `lib/validators/`. No devolver `unknown` ni `any`.
- [ ] Lecturas envueltas en `unstable_cache` con tag (`products`, `categories`).
- [ ] Escrituras seguidas de `revalidateTag(<tag>)`.
- [ ] Errores de la API tipados (`SheetsError`) — no propagar el error crudo de `googleapis`.
- [ ] Para mutaciones masivas usar `values.batchUpdate` / `spreadsheets.batchUpdate`. **No** un PUT por fila.
- [ ] Backoff en 429 (max 3 intentos, exponencial).

## Reglas duras

- Headers de la hoja (fila 1) son contrato. Si cambian, fallar ruidoso.
- `id` se genera en la app (UUID). Nunca confiar en row index como id.
- `updatedAt` se actualiza en cada escritura.
- Soft delete preferido sobre `deleteDimension` salvo pedido contrario.

## Cuándo NO usar esta skill

- Si solo estás cambiando UI que ya consume el service existente.
- Si es un util puro sin I/O.
