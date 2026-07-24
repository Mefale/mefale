import {
  PDFDocument,
  StandardFonts,
  rgb,
  setCharacterSpacing,
  type PDFFont,
  type PDFPage,
  type RGB,
} from "pdf-lib";
import type { Order, OrderStatus } from "@/lib/sheets/orders";

// ─── Paleta (papelería, no UI) ──────────────────────────────────────────────────

const INK = rgb(0.071, 0.071, 0.071); // casi negro, tinta
const SOFT = rgb(0.42, 0.42, 0.44); // labels y metadatos
const HAIR = rgb(0.86, 0.86, 0.87); // reglas finas
const RULE = rgb(0.09, 0.09, 0.09); // reglas fuertes
const GOLD = rgb(0.62, 0.45, 0.11); // acento del tagline
const RED = rgb(0.7, 0.11, 0.11);

const PAGE_W = 595.28; // A4
const PAGE_H = 841.89;
const MARGIN = 56;
const CONTENT_W = PAGE_W - MARGIN * 2;

// Anclas de columnas (relativas al margen izquierdo).
// Los números van alineados a derecha sobre su ancla.
const COL_SKU = 0;
const COL_DESC = 88;
const QTY_R = 370;
const UNIT_R = 430;
const TOTAL_R = CONTENT_W;

const BUSINESS_NAME = "Distribuidora Graser";
const BUSINESS_TAGLINE = "Electrónica y electricidad";

const STATUS_COLORS: Record<OrderStatus, { text: RGB; border: RGB }> = {
  Generado: { text: rgb(0.35, 0.4, 0.47), border: rgb(0.8, 0.83, 0.87) },
  Aprobado: { text: rgb(0.11, 0.35, 0.72), border: rgb(0.72, 0.8, 0.93) },
  Empaquetado: { text: rgb(0.11, 0.45, 0.28), border: rgb(0.71, 0.86, 0.77) },
  Cancelado: { text: rgb(0.7, 0.15, 0.15), border: rgb(0.93, 0.76, 0.76) },
};

/**
 * Las fuentes estándar usan WinAnsi: acentos y ñ sí, emojis y símbolos raros no.
 * Se limpia lo que no se puede codificar para que pdf-lib no tire error.
 */
function sanitize(text: string): string {
  return text
    .normalize("NFC")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "");
}

function money(value: number): string {
  return `$${value.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

interface Ctx {
  serif: PDFFont;
  serifBold: PDFFont;
  sans: PDFFont;
  sansBold: PDFFont;
}

interface TextOpts {
  font: PDFFont;
  size: number;
  color?: RGB;
  align?: "left" | "right";
  /** Tracking en puntos, para los labels en versalitas */
  tracking?: number;
}

function measure(text: string, opts: TextOpts): number {
  const base = opts.font.widthOfTextAtSize(text, opts.size);
  return opts.tracking ? base + opts.tracking * Math.max(text.length - 1, 0) : base;
}

function drawText(page: PDFPage, text: string, x: number, y: number, opts: TextOpts) {
  const value = sanitize(text);
  if (!value) return;

  const width = measure(value, opts);
  const startX = opts.align === "right" ? x - width : x;

  if (opts.tracking) page.pushOperators(setCharacterSpacing(opts.tracking));
  page.drawText(value, {
    x: startX,
    y,
    size: opts.size,
    font: opts.font,
    color: opts.color ?? INK,
  });
  if (opts.tracking) page.pushOperators(setCharacterSpacing(0));
}

/** Label en versalitas grises, el recurso tipográfico que sostiene todo el diseño. */
function drawLabel(
  page: PDFPage,
  ctx: Ctx,
  text: string,
  x: number,
  y: number,
  align: "left" | "right" = "left"
) {
  drawText(page, text.toUpperCase(), x, y, {
    font: ctx.sans,
    size: 7.5,
    color: SOFT,
    tracking: 0.9,
    align,
  });
}

function truncate(text: string, opts: TextOpts, maxWidth: number): string {
  if (measure(text, opts) <= maxWidth) return text;
  let out = text;
  while (out.length > 1 && measure(`${out}...`, opts) > maxWidth) {
    out = out.slice(0, -1);
  }
  return `${out.trimEnd()}...`;
}

function rule(page: PDFPage, y: number, thickness: number, color: RGB) {
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: MARGIN + CONTENT_W, y },
    thickness,
    color,
  });
}

/** Rectángulo redondeado vía path SVG (pdf-lib no tiene border-radius nativo). */
function roundedRect(
  page: PDFPage,
  x: number,
  yTop: number,
  w: number,
  h: number,
  r: number,
  borderColor: RGB
) {
  const path = [
    `M ${r} 0`,
    `H ${w - r}`,
    `A ${r} ${r} 0 0 1 ${w} ${r}`,
    `V ${h - r}`,
    `A ${r} ${r} 0 0 1 ${w - r} ${h}`,
    `H ${r}`,
    `A ${r} ${r} 0 0 1 0 ${h - r}`,
    `V ${r}`,
    `A ${r} ${r} 0 0 1 ${r} 0`,
    "Z",
  ].join(" ");

  page.drawSvgPath(path, { x, y: yTop, borderColor, borderWidth: 0.8 });
}

/** Membrete + datos del documento. Devuelve la Y donde continúa el contenido. */
function drawLetterhead(page: PDFPage, ctx: Ctx, order: Order, orderNumber: string): number {
  const top = PAGE_H - MARGIN;

  drawText(page, BUSINESS_NAME, MARGIN, top - 22, { font: ctx.serifBold, size: 22 });
  drawText(page, BUSINESS_TAGLINE.toUpperCase(), MARGIN, top - 38, {
    font: ctx.sans,
    size: 8,
    color: GOLD,
    tracking: 1.4,
  });

  const right = MARGIN + CONTENT_W;
  drawLabel(page, ctx, "Detalle de pedido", right, top - 14, "right");
  drawText(page, `N° ${orderNumber}`, right, top - 38, {
    font: ctx.serifBold,
    size: 17,
    align: "right",
  });

  const stamp = [order.date, order.time && `${order.time} hs`].filter(Boolean).join("  ·  ");
  drawText(page, stamp, right, top - 54, {
    font: ctx.sans,
    size: 8.5,
    color: SOFT,
    align: "right",
  });

  rule(page, top - 76, 1.6, RULE);
  return top - 76;
}

/** Bloque de cliente. Devuelve la Y donde continúa el contenido. */
function drawCustomer(page: PDFPage, ctx: Ctx, order: Order, y: number): number {
  const right = MARGIN + CONTENT_W;
  const hasPhone = Boolean(order.phone && order.phone !== "-");

  drawLabel(page, ctx, "Cliente", MARGIN, y - 24);
  drawText(
    page,
    order.customerName && order.customerName !== "-" ? order.customerName : "Sin nombre",
    MARGIN,
    y - 42,
    { font: ctx.sans, size: 13 }
  );

  if (hasPhone) {
    drawLabel(page, ctx, "Teléfono", right, y - 24, "right");
    drawText(page, order.phone, right, y - 42, {
      font: ctx.sans,
      size: 13,
      align: "right",
    });
  }

  // Pill de estado bajo el nombre
  const statusColor = STATUS_COLORS[order.status] ?? STATUS_COLORS.Generado;
  const statusOpts: TextOpts = { font: ctx.sans, size: 8, color: statusColor.text };
  const pillW = measure(sanitize(order.status), statusOpts) + 18;
  const pillTop = y - 54;
  roundedRect(page, MARGIN, pillTop, pillW, 16, 8, statusColor.border);
  drawText(page, order.status, MARGIN + 9, pillTop - 11.5, statusOpts);

  return y - 104;
}

/** Cabecera de la tabla. Devuelve la Y de la primera fila. */
function drawTableHead(page: PDFPage, ctx: Ctx, y: number): number {
  drawLabel(page, ctx, "Código", MARGIN + COL_SKU, y);
  drawLabel(page, ctx, "Descripción", MARGIN + COL_DESC, y);
  drawLabel(page, ctx, "Cant.", MARGIN + QTY_R, y, "right");
  drawLabel(page, ctx, "P. unit.", MARGIN + UNIT_R, y, "right");
  drawLabel(page, ctx, "Subtotal", MARGIN + TOTAL_R, y, "right");

  rule(page, y - 10, 0.6, HAIR);
  return y - 30;
}

function drawPageFooter(page: PDFPage, ctx: Ctx, pageIndex: number, pageCount: number) {
  rule(page, MARGIN + 4, 0.6, HAIR);
  drawText(page, "Documento no fiscal · Detalle informativo del pedido", MARGIN, MARGIN - 10, {
    font: ctx.sans,
    size: 7.5,
    color: SOFT,
  });
  if (pageCount > 1) {
    drawText(page, `${pageIndex} / ${pageCount}`, MARGIN + CONTENT_W, MARGIN - 10, {
      font: ctx.sans,
      size: 7.5,
      color: SOFT,
      align: "right",
    });
  }
}

export async function buildOrderInvoicePdf(order: Order): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const ctx: Ctx = {
    serif: await doc.embedFont(StandardFonts.TimesRoman),
    serifBold: await doc.embedFont(StandardFonts.TimesRomanBold),
    sans: await doc.embedFont(StandardFonts.Helvetica),
    sansBold: await doc.embedFont(StandardFonts.HelveticaBold),
  };

  const orderNumber = String(Math.max(order.rowNumber - 1, 0)).padStart(4, "0");

  doc.setTitle(`Pedido ${orderNumber} — ${BUSINESS_NAME}`);
  doc.setAuthor(BUSINESS_NAME);
  doc.setSubject(`Detalle del pedido ${orderNumber}`);

  const pages: PDFPage[] = [];
  let page = doc.addPage([PAGE_W, PAGE_H]);
  pages.push(page);

  let y = drawLetterhead(page, ctx, order, orderNumber);
  y = drawCustomer(page, ctx, order, y);
  y = drawTableHead(page, ctx, y);

  const ROW_H = 34;
  const BOTTOM_LIMIT = MARGIN + 46; // sólo reserva el pie de página
  const TOTALS_H = 120; // alto máximo del bloque de totales

  const nameOpts: TextOpts = { font: ctx.sans, size: 9.5 };
  const skuOpts: TextOpts = { font: ctx.sans, size: 8, color: SOFT };
  const descMax = QTY_R - COL_DESC - 18;

  order.items.forEach((item, idx) => {
    if (y < BOTTOM_LIMIT) {
      page = doc.addPage([PAGE_W, PAGE_H]);
      pages.push(page);
      y = drawTableHead(page, ctx, PAGE_H - MARGIN - 14);
    }

    if (idx > 0) rule(page, y + 18, 0.5, HAIR);

    drawText(page, truncate(sanitize(item.sku || "-"), skuOpts, COL_DESC - 12), MARGIN + COL_SKU, y, skuOpts);
    drawText(page, truncate(sanitize(item.name), nameOpts, descMax), MARGIN + COL_DESC, y, nameOpts);

    if (item.pending) {
      drawText(page, "sin stock", MARGIN + COL_DESC, y - 11, {
        font: ctx.sans,
        size: 7.5,
        color: RED,
      });
    }

    drawText(page, String(item.quantity), MARGIN + QTY_R, y, {
      font: ctx.sans,
      size: 9.5,
      align: "right",
    });
    drawText(page, money(item.price), MARGIN + UNIT_R, y, {
      font: ctx.sans,
      size: 9.5,
      color: SOFT,
      align: "right",
    });
    drawText(page, money(item.price * item.quantity), MARGIN + TOTAL_R, y, {
      font: ctx.sansBold,
      size: 9.5,
      align: "right",
    });

    y -= ROW_H;
  });

  if (order.items.length === 0) {
    drawText(page, "El pedido no tiene productos cargados.", MARGIN, y, {
      font: ctx.sans,
      size: 9.5,
      color: SOFT,
    });
    y -= ROW_H;
  }

  // ─── Totales ────────────────────────────────────────────────────────────────
  // Si no entran completos, arrancan en una hoja nueva en vez de pisar el pie
  if (y < MARGIN + TOTALS_H) {
    page = doc.addPage([PAGE_W, PAGE_H]);
    pages.push(page);
    y = PAGE_H - MARGIN - 30;
  }

  y += 12;
  rule(page, y, 1.6, RULE);
  y -= 26;

  const subtotal = order.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const discount = order.discountPercentage > 0 ? (subtotal * order.discountPercentage) / 100 : 0;
  const total = subtotal - discount;

  // El label se ancla al ancho real del monto para que nunca lo pise
  function totalLine(label: string, amount: string, opts: TextOpts, labelOffsetY = 0) {
    drawLabel(page, ctx, label, MARGIN + TOTAL_R - measure(amount, opts) - 14, y + labelOffsetY, "right");
    drawText(page, amount, MARGIN + TOTAL_R, y, opts);
  }

  if (discount > 0) {
    totalLine("Subtotal", money(subtotal), { font: ctx.sans, size: 10, align: "right" });
    y -= 18;

    totalLine(`Descuento ${order.discountPercentage}%`, `- ${money(discount)}`, {
      font: ctx.sans,
      size: 10,
      color: SOFT,
      align: "right",
    });
    y -= 26;
  }

  totalLine("Total", money(total), { font: ctx.sansBold, size: 20, align: "right" }, 5);

  pages.forEach((p, i) => drawPageFooter(p, ctx, i + 1, pages.length));

  return doc.save();
}
