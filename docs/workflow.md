# Flujo de trabajo incremental

El proyecto se construye **por módulos**, no de una sola pasada. Cada módulo es chico, mergeable, y deja la app en un estado funcional.

## Principios

1. **Un módulo por sesión.** Foco en una unidad cerrada (ej: "listado de productos público").
2. **Verticalidad antes de horizontalidad.** Antes de pulir todo el catálogo, llegar punta a punta a un MVP feo pero funcional.
3. **Dato real cuanto antes.** En cuanto Sheets esté conectado, dejar de usar mocks.
4. **Confirmar scope.** Antes de un módulo, alinear con el usuario: qué entra, qué no.
5. **No commits sin pedirlo.** Claude no commitea por su cuenta.

## Ciclo por módulo

1. **Plan corto** — listar archivos a tocar, decisiones técnicas, dudas. Confirmar con el usuario.
2. **Implementación incremental** — primero tipos + service, después UI, al final estados (loading/empty/error).
3. **Probar en mobile y desktop** antes de declarar listo.
4. **Cerrar el módulo** — actualizar `docs/roadmap.md` (marcar hecho), mover al siguiente.

## Definición de "listo" para un módulo

- TypeScript compila sin errores.
- No rompe rutas existentes.
- Loading + empty + error implementados donde aplique.
- Mobile + desktop probados.
- Roadmap actualizado.

## Cuando algo no está claro

- Preguntar al usuario antes de inventar requisitos.
- Si el usuario está ausente y la decisión es chica (ej: nombre de un campo), elegir y documentar la elección en código o en el doc relevante.

## Antes de empezar a codear cada vez

Leer:
- `CLAUDE.md` (siempre)
- el doc del dominio del módulo (ej: `data-strategy-sheets.md` si tocás Sheets)
- `roadmap.md` para confirmar la prioridad

## Qué no hacer

- No agregar dependencias sin avisar.
- No reescribir módulos que ya pasaron por aprobación, salvo pedido explícito.
- No agregar features "por si acaso".
- No mockear cosas que ya están conectadas a Sheets.
