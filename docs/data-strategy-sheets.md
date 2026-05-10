# Estrategia de datos — Google Sheets

Google Sheets es la **única fuente persistente** de productos, categorías, marcas y stock. La app la lee y escribe vía la API oficial.

## Por qué Sheets y no DB

- El dueño ya trabaja con Excel; mantener una herramienta familiar para edición masiva.
- Cero costo de hosting de DB.
- Importador (CSV/XLSX) y la planilla conviven naturalmente.

## Limitaciones a tener presente

- Latencia: cada llamada cuesta cientos de ms. **Cache obligatorio** en Next.
- Cuotas: 60 lecturas/min/usuario, 300/min/proyecto. No hacer fan-out por producto.
- No hay índices ni transacciones. La consistencia se cuida desde la app (lectura completa + filtro en memoria).
- Concurrencia: si dos admins editan a la vez puede haber pisada. Aceptable en MVP — un solo editor activo.

## Autenticación

- **Service Account** con permiso de editor sobre la planilla.
- Credenciales en env vars (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`).
- Cliente: paquete oficial `googleapis` o `google-spreadsheet`. Decisión final al implementar `lib/sheets/client.ts`.

## Modelo de hojas

Una planilla, varias hojas (tabs):

### Hoja `productos`

| Col | Campo | Tipo | Notas |
|---|---|---|---|
| A | id | string | UUID generado al crear |
| B | sku | string | clave de negocio, única |
| C | nombre | string | |
| D | descripcion | string | multilínea ok |
| E | precio | number | enteros ARS |
| F | imagenes | string | URLs separadas por `\|` |
| G | categoria | string | slug, FK a `categorias.slug` |
| H | marca | string | |
| I | stock | number | |
| J | etiquetas | string | separadas por `,` |
| K | destacado | boolean | `TRUE`/`FALSE` |
| L | createdAt | ISO string | |
| M | updatedAt | ISO string | |

Fila 1 = headers, no tocar.

### Hoja `categorias`

| Col | Campo |
|---|---|
| A | slug |
| B | nombre |
| C | descripcion |
| D | imagen |
| E | orden |

### Hoja `marcas` (opcional, MVP puede derivarse de productos)

## Schema Zod

`lib/validators/product.ts`:

```ts
export const productSchema = z.object({
  id: z.string().uuid(),
  sku: z.string().min(1),
  nombre: z.string().min(1),
  descripcion: z.string().default(""),
  precio: z.number().int().nonnegative(),
  imagenes: z.array(z.string().url()).default([]),
  categoria: z.string().min(1),
  marca: z.string().default(""),
  stock: z.number().int().nonnegative().default(0),
  etiquetas: z.array(z.string()).default([]),
  destacado: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Product = z.infer<typeof productSchema>;
```

## Parseo y serialización

Helpers en `utils/parse-spreadsheet.ts`:

- `rowToProduct(row): Product` — convierte arrays de Sheets a objeto, parsea `imagenes` (split `|`), `etiquetas` (split `,`), `destacado` (TRUE/FALSE).
- `productToRow(product): string[]` — inverso.
- Validar siempre con `productSchema.parse` antes de devolver.

## Operaciones

`lib/sheets/products.ts` expone:

- `listProducts(): Promise<Product[]>` — lee todo el rango y mapea.
- `getProductById(id)` / `getProductBySku(sku)` — usan `listProducts` + filter (no es eficiente pero la planilla es chica).
- `createProduct(input)` — append fila, generar id + timestamps.
- `updateProduct(id, patch)` — buscar fila por id, escribir el rango.
- `deleteProduct(id)` — `batchUpdate` con `deleteDimension` o flag `archivado` (preferir soft delete).
- `bulkUpsert(items)` — usado por el importador, hace una sola llamada `values.batchUpdate`.

Cada función envuelve errores de la API en `SheetsError`.

## Cache

```ts
import { unstable_cache } from "next/cache";

export const getProductsCached = unstable_cache(
  async () => listProducts(),
  ["products"],
  { tags: ["products"], revalidate: 60 }
);
```

- Tag `products` para todo lo de productos.
- Server actions de admin → `revalidateTag("products")` tras escribir.

## Importador

- Acepta CSV o XLSX (`xlsx` o `papaparse` + `xlsx`).
- Validación columna por columna contra `productSchema` (relajado: `id`, `createdAt`, `updatedAt` opcionales, se generan).
- Preview en UI antes de confirmar.
- Match por `sku`: si existe → update, si no → create.
- Una única llamada `bulkUpsert` al confirmar.
- Reporte final: creados, actualizados, errores con número de fila.

## Errores comunes a manejar

- `429` cuota → backoff exponencial, máx 3 intentos.
- Headers cambiados manualmente en la planilla → fallar ruidoso, no silencioso.
- Valores no parseables (`precio` con texto) → registrar fila + saltar, devolver al usuario en el reporte.
