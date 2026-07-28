# Integración Cloudinary

Cloudinary almacena las imágenes de productos. Sheets guarda solo URLs.

## Por qué Cloudinary

- CDN global + transformaciones on-demand (resize, format, quality).
- Plan free generoso para el volumen esperado.
- Soporta upload firmado desde el cliente (no exponer secret).

## Variables

```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=    # mismo valor, expuesto al cliente
```

## Estructura

```
lib/cloudinary/
├── client.ts         # SDK server-side
├── sign-upload.ts    # genera firma para subida desde cliente
└── url.ts            # builder de URLs con transformaciones
```

## Flujo de upload

1. **Server Action** `getUploadSignature()` devuelve `{ signature, timestamp, apiKey, cloudName, folder }`.
2. **Cliente** hace `POST` directo a `https://api.cloudinary.com/v1_1/<cloud>/image/upload` con la firma.
3. La respuesta contiene `secure_url` y `public_id`.
4. La URL se guarda en el campo `imagenes` del producto.

> Subir directo del cliente evita pasar el archivo por el servidor de Next (más rápido y barato).

## Carpeta y naming

- Carpeta `mefale/products/`.
- `public_id` autogenerado por Cloudinary; no nos casamos con un naming custom.

## Transformaciones recomendadas

Con `next/image` + dominio Cloudinary configurado en `next.config.js`:

```js
images: {
  remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
}
```

Para casos donde necesitemos transformaciones específicas, helper:

```ts
// lib/cloudinary/url.ts
buildImageUrl(publicId, { width: 800, quality: "auto", format: "auto" })
```

## Componente reutilizable

`components/admin/ImageUploader.tsx`:

- Drag & drop o click.
- Múltiples imágenes.
- Preview con orden drag-to-reorder.
- Botón eliminar (no borra de Cloudinary en MVP — se queda huérfana, aceptable).
- Devuelve `string[]` de URLs al form padre.

## Borrado (post-MVP)

Cleanup de imágenes huérfanas: cron o tarea manual. No se implementa en MVP.

## Restricciones de upload

- Tipos: `image/jpeg`, `image/png`, `image/webp`.
- Tamaño máximo: 5 MB por archivo.
- Validar en cliente antes de pedir la firma.

## Flujo de importación por URL (admin)

Distinto del flujo de arriba (que sube un archivo elegido en el dispositivo). Este flujo permite pegar un link externo (ej. Google Imágenes) y que el servidor lo suba a Cloudinary.

```
lib/cloudinary/
├── client.ts             # SDK server-side (compartido con el flujo firmado)
└── upload-from-url.ts    # uploadImageFromUrl(sourceUrl, sku)
```

- Ocurre **enteramente server-side**, dentro de `createProductAction`/`updateProductAction` (`app/admin/products/actions.ts`), usando `CLOUDINARY_API_SECRET` — nunca se expone al cliente.
- Usa `cloudinary.uploader.upload(url, { folder: "mefale/products", public_id: sku, overwrite: true, resource_type: "image" })`; Cloudinary descarga la URL remota y la valida como imagen (rechaza contenido que no lo sea).
- Si falla (link roto, requiere auth, no es imagen), la Server Action retorna error y **no se escribe nada en Sheets** — todo o nada.
- En edición, si el campo de imagen no cambió respecto al valor guardado, no se vuelve a subir (evita gasto de cuota/red).
- Una sola imagen por producto por ahora (columna `G` en la hoja de productos).
