"use client";

import { useState, useRef, useEffect, Fragment } from "react";
import {
  ChevronDown,
  ChevronUp,
  Phone,
  Calendar,
  Clock,
  MessageCircle,
  Copy,
  Check,
  X,
  Plus,
  Save,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/utils/format-price";
import {
  buildWhatsAppUrlForNumber,
  buildOrderSummaryMessage,
} from "@/lib/whatsapp/build-message";
import { updateOrderAction } from "./actions";
import type { Order, OrderItem, OrderStatus } from "@/lib/sheets/orders";
import type { Product } from "@/types/product";

const STATUS_OPTIONS: {
  value: OrderStatus;
  label: string;
  pill: string;
  dot: string;
  border: string;
}[] = [
  { value: "Generado",    label: "Generado",    pill: "bg-slate-100 text-slate-600 border-slate-200",  dot: "bg-slate-400",  border: "border-l-slate-400"  },
  { value: "Aprobado",    label: "Aprobado",    pill: "bg-blue-50 text-blue-700 border-blue-200",      dot: "bg-blue-500",   border: "border-l-blue-500"   },
  { value: "Empaquetado", label: "Empaquetado", pill: "bg-amber-50 text-amber-700 border-amber-200",   dot: "bg-amber-500",  border: "border-l-amber-500"  },
  { value: "Cancelado",   label: "Cancelado",   pill: "bg-red-50 text-red-500 border-red-200",         dot: "bg-red-400",    border: "border-l-red-400"    },
];

function statusPill(s: OrderStatus) {
  return STATUS_OPTIONS.find((o) => o.value === s)?.pill ?? "bg-slate-100 text-slate-600 border-slate-200";
}
function statusBorder(s: OrderStatus) {
  return STATUS_OPTIONS.find((o) => o.value === s)?.border ?? "border-l-slate-300";
}
function statusDot(s: OrderStatus) {
  return STATUS_OPTIONS.find((o) => o.value === s)?.dot ?? "bg-slate-400";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayInputValue(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

function inputDateToAR(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

function offsetDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
}

// ─── KPI Bar ─────────────────────────────────────────────────────────────────

function KpiItem({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-white px-4 py-3 flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider">
        {label}
      </span>
      <span className={cn("text-base font-bold text-[#0F172A]", valueColor)}>
        {value}
      </span>
    </div>
  );
}

function KpiBar({ orders }: { orders: Order[] }) {
  const totalDia = orders.reduce(
    (acc, o) => acc + o.items.reduce((s, i) => s + i.price * i.quantity, 0),
    0
  );
  const generados = orders.filter((o) => o.status === "Generado").length;
  const pendienteStock = orders.reduce(
    (acc, o) => acc + o.items.filter((i) => i.pending).length,
    0
  );
  const listosParaEnviar = orders.filter((o) => o.status === "Empaquetado").length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
      <KpiItem label="Total del dia" value={formatPrice(totalDia)} />
      <KpiItem
        label="Generados"
        value={`${generados} pedido${generados !== 1 ? "s" : ""}`}
      />
      <KpiItem
        label="Pendientes de stock"
        value={`${pendienteStock} producto${pendienteStock !== 1 ? "s" : ""}`}
        valueColor={pendienteStock > 0 ? "text-amber-600" : undefined}
      />
      <KpiItem
        label="Listos para enviar"
        value={`${listosParaEnviar} pedido${listosParaEnviar !== 1 ? "s" : ""}`}
        valueColor={listosParaEnviar > 0 ? "text-green-600" : undefined}
      />
    </div>
  );
}

// ─── DatePickerPopover ────────────────────────────────────────────────────────

const MONTHS_ES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];
const DAYS_ES = ["Do","Lu","Ma","Mi","Ju","Vi","Sa"];

const SHORTCUTS = [
  { label: "Hoy",         get: () => todayInputValue() },
  { label: "Ayer",        get: () => offsetDate(1) },
  { label: "Hace 2 días", get: () => offsetDate(2) },
  { label: "Hace 3 días", get: () => offsetDate(3) },
  { label: "Hace 7 días", get: () => offsetDate(7) },
];

function DatePickerPopover({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const seed = value ? new Date(value + "T12:00:00") : new Date();
  const [viewYear, setViewYear] = useState(seed.getFullYear());
  const [viewMonth, setViewMonth] = useState(seed.getMonth());

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  function select(dateStr: string) {
    onChange(dateStr);
    setOpen(false);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const todayStr = todayInputValue();

  const label = value
    ? value === todayStr ? "Hoy" : inputDateToAR(value)
    : "Todas las fechas";

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors shadow-sm",
          open
            ? "bg-[#0F172A] text-white border-[#0F172A]"
            : "bg-white text-[#0F172A] border-gray-200 hover:border-gray-400"
        )}
      >
        <Calendar className="w-3.5 h-3.5 shrink-0" />
        <span>{label}</span>
        {value && (
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className={cn(
              "ml-0.5 transition-colors cursor-pointer",
              open ? "text-white/50 hover:text-white" : "text-gray-400 hover:text-gray-700"
            )}
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 flex bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden w-[480px]">
          <div className="w-36 shrink-0 bg-gray-50 border-r border-gray-100 p-3 flex flex-col gap-1">
            <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">
              Accesos rápidos
            </p>
            {SHORTCUTS.map((s) => {
              const v = s.get();
              return (
                <button
                  key={s.label}
                  onClick={() => select(v)}
                  className={cn(
                    "text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors",
                    value === v
                      ? "bg-[#0F172A] text-white font-medium"
                      : "text-[#374151] hover:bg-gray-200"
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <ChevronDown className="w-4 h-4 rotate-90" />
              </button>
              <span className="text-sm font-semibold text-[#0F172A]">
                {MONTHS_ES[viewMonth]} {viewYear}
              </span>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <ChevronDown className="w-4 h-4 -rotate-90" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-y-1">
              {DAYS_ES.map((d) => (
                <div key={d} className="text-center text-[10px] font-semibold text-[#94A3B8] uppercase py-1">
                  {d}
                </div>
              ))}
              {Array.from({ length: firstDow }).map((_, i) => (
                <div key={`b-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const isSelected = value === iso;
                const isToday = iso === todayStr;
                return (
                  <button
                    key={day}
                    onClick={() => select(iso)}
                    className={cn(
                      "mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors",
                      isSelected
                        ? "bg-[#0F172A] text-white font-semibold"
                        : isToday
                          ? "bg-blue-50 text-[#1A56DB] font-semibold hover:bg-blue-100"
                          : "text-[#374151] hover:bg-gray-100"
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => { onChange(""); setOpen(false); }}
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Limpiar
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#0F172A] text-white hover:bg-[#1e293b] transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({
  order,
  products,
  onStatusChange,
}: {
  order: Order;
  products: Product[];
  onStatusChange: (id: string, newStatus: OrderStatus) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [items, setItems] = useState<OrderItem[]>(order.items);
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const isLegacy = !order.id;
  const hasPhone = order.phone && order.phone !== "-";
  const hasChanges = JSON.stringify(items) !== JSON.stringify(order.items);
  const computedTotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const customerName = order.customerName !== "-" ? order.customerName : null;

  const pendingItems = items.filter((i) => i.pending);
  const availableItems = items.filter((i) => !i.pending);
  const hasPending = pendingItems.length > 0;

  const orderNum = String(order.rowNumber - 1).padStart(4, "0");
  const previewItems = items.slice(0, 2);

  async function handleStatusChange(newStatus: OrderStatus) {
    if (isLegacy) return;
    setStatus(newStatus);
    onStatusChange(order.id, newStatus);
    const res = await updateOrderAction(order.id, { status: newStatus });
    if (!res.success) {
      setStatus(order.status);
      onStatusChange(order.id, order.status);
      toast.error(res.error ?? "No se pudo actualizar el estado.");
    }
  }

  function handleQtyChange(idx: number, raw: string) {
    const qty = Math.max(1, parseInt(raw) || 1);
    setItems((prev) => prev.map((it, i) => i === idx ? { ...it, quantity: qty } : it));
  }

  function handlePriceChange(idx: number, raw: string) {
    const price = Math.max(0, parseFloat(raw) || 0);
    setItems((prev) => prev.map((it, i) => i === idx ? { ...it, price } : it));
  }

  function handleTogglePending(idx: number) {
    setItems((prev) => prev.map((it, i) => i === idx ? { ...it, pending: !it.pending } : it));
  }

  function handleRemoveItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleAddProduct(product: Product) {
    const existing = items.findIndex((it) => it.sku === product.sku);
    if (existing !== -1) {
      setItems((prev) =>
        prev.map((it, i) => i === existing ? { ...it, quantity: it.quantity + 1 } : it)
      );
    } else {
      setItems((prev) => [
        ...prev,
        { sku: product.sku, name: product.name, quantity: 1, price: product.price },
      ]);
    }
    setSearchQuery("");
    setShowSearch(false);
  }

  async function handleSaveItems() {
    if (isLegacy) return;
    setSaving(true);
    const res = await updateOrderAction(order.id, { items });
    setSaving(false);
    if (res.success) {
      toast.success("Pedido actualizado.");
    } else {
      toast.error(res.error ?? "Error al guardar.");
      setItems(order.items);
    }
  }

  async function handleCopy() {
    const msg = buildOrderSummaryMessage(items, order.customerName, order.discountPercentage);
    await navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleResend() {
    if (!hasPhone) return;
    const msg = buildOrderSummaryMessage(items, order.customerName, order.discountPercentage);
    const url = buildWhatsAppUrlForNumber(msg, order.phone);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleResendFiltered(subset: typeof items) {
    const msg = buildOrderSummaryMessage(subset, order.customerName, order.discountPercentage);
    if (hasPhone) {
      window.open(buildWhatsAppUrlForNumber(msg, order.phone), "_blank", "noopener,noreferrer");
    } else {
      navigator.clipboard.writeText(msg);
      toast.success("Mensaje copiado al portapapeles.");
    }
  }

  const filteredProducts = searchQuery.length >= 2
    ? products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  return (
    <div className={cn(
      "bg-white rounded-xl border border-gray-200 border-l-4 transition-shadow overflow-hidden",
      isLegacy
        ? "border-dashed border-gray-300 border-l-gray-300"
        : cn("shadow-sm hover:shadow-md", statusBorder(status))
    )}>
      {/* ── Card header ── */}
      <div className="px-4 py-3 flex items-start justify-between gap-3">
        {/* Left: order number + name + phone + badges + meta line */}
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-[#94A3B8] shrink-0">
              #{orderNum}
            </span>
            <span className="font-semibold text-[#0F172A]">
              {customerName ?? "Sin nombre"}
            </span>
            {hasPhone && (
              <span className="flex items-center gap-1 text-xs text-[#64748B]">
                <Phone className="w-3 h-3" />
                {order.phone}
              </span>
            )}
            {hasPending && (
              <span className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-medium border border-amber-200 whitespace-nowrap">
                <Clock className="w-3 h-3" />
                {pendingItems.length} sin stock
              </span>
            )}
            {isLegacy && (
              <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-medium border border-gray-200">
                Legacy
              </span>
            )}
          </div>

          {/* Meta line: time · N productos · item1 × qty · item2 × qty */}
          <div className="flex items-center gap-1 text-xs text-[#94A3B8] flex-wrap">
            <Clock className="w-3 h-3 shrink-0" />
            <span>{order.time}</span>
            <span className="mx-0.5">·</span>
            <span>{items.length} producto{items.length !== 1 ? "s" : ""}</span>
            {previewItems.map((item, i) => (
              <Fragment key={i}>
                <span className="mx-0.5">·</span>
                <span className="text-[#64748B] truncate max-w-[140px]">
                  {item.name} × {item.quantity}
                </span>
              </Fragment>
            ))}
          </div>
        </div>

        {/* Right: status pill + price block + actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Status select with colored dot */}
          <div className="relative">
            <span className={cn(
              "absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full pointer-events-none z-10",
              statusDot(status)
            )} />
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
              disabled={isLegacy}
              className={cn(
                "appearance-none text-xs font-medium pl-6 pr-6 py-1 rounded-full border cursor-pointer",
                "focus:outline-none focus:ring-2 focus:ring-[#1A56DB]/20",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                statusPill(status)
              )}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-40" />
          </div>

          {/* Price + item count */}
          <div className="text-right min-w-[64px]">
            <div className="text-sm font-bold text-[#0F172A] tabular-nums whitespace-nowrap">
              {formatPrice(computedTotal)}
            </div>
            <div className="text-[10px] text-[#94A3B8] tabular-nums">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* WhatsApp / Copy — icon only */}
          {hasPhone ? (
            <button
              onClick={handleResend}
              title="Reenviar pedido al cliente por WhatsApp"
              className="p-1.5 rounded-lg bg-[#25D366]/10 text-[#128C3E] hover:bg-[#25D366]/20 border border-[#25D366]/30 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleCopy}
              title="Copiar pedido al portapapeles"
              className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Contraer" : "Expandir"}
            className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Expanded: items ── */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="grid grid-cols-[20px_1fr_80px_90px_28px] gap-2 text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider px-1">
              <span />
              <span>Producto</span>
              <span className="text-center">Cant.</span>
              <span className="text-right">Precio unit.</span>
              <span />
            </div>

            {items.length === 0 && (
              <p className="text-xs text-[#94A3B8] italic py-2 text-center">Sin productos</p>
            )}

            {items.map((item, idx) => (
              <div
                key={`${item.sku}-${idx}`}
                className={cn(
                  "grid grid-cols-[20px_1fr_80px_90px_28px] gap-2 items-center py-1.5 px-1 rounded-lg transition-colors",
                  item.pending ? "bg-amber-50/70" : "hover:bg-gray-50"
                )}
              >
                <button
                  onClick={() => handleTogglePending(idx)}
                  disabled={isLegacy}
                  title={item.pending ? "Marcar como disponible" : "Marcar como pendiente"}
                  className={cn(
                    "p-0.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
                    item.pending
                      ? "text-amber-500 hover:text-amber-600"
                      : "text-[#CBD5E1] hover:text-amber-400"
                  )}
                >
                  <Clock className="w-3.5 h-3.5" />
                </button>

                <div className="min-w-0">
                  <p className={cn(
                    "text-sm leading-tight truncate",
                    item.pending ? "text-[#94A3B8] line-through" : "text-[#0F172A]"
                  )}>
                    {item.name}
                  </p>
                  <p className="text-[10px] text-[#94A3B8] font-mono">{item.sku}</p>
                </div>

                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => handleQtyChange(idx, e.target.value)}
                  disabled={isLegacy || !!item.pending}
                  className={cn(
                    "w-full text-center text-sm font-semibold text-[#0F172A]",
                    "border border-[#E2E8F0] rounded-lg px-2 py-1",
                    "focus:outline-none focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB]/10",
                    "disabled:bg-transparent disabled:text-gray-300 disabled:cursor-not-allowed tabular-nums"
                  )}
                />

                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8] pointer-events-none">$</span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.price === 0 && order.items[idx]?.price === 0 ? "" : item.price}
                    onChange={(e) => handlePriceChange(idx, e.target.value)}
                    disabled={isLegacy || !!item.pending}
                    placeholder={item.price === 0 ? "—" : undefined}
                    className={cn(
                      "w-full text-right text-sm text-[#0F172A]",
                      "border border-[#E2E8F0] rounded-lg pl-5 pr-2 py-1",
                      "focus:outline-none focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB]/10",
                      "disabled:bg-transparent disabled:text-gray-300 disabled:cursor-not-allowed tabular-nums"
                    )}
                  />
                </div>

                <button
                  onClick={() => handleRemoveItem(idx)}
                  disabled={isLegacy}
                  aria-label="Eliminar producto"
                  className="p-1 rounded text-[#94A3B8] hover:text-[#DC2626] hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {!isLegacy && (
            <div className="relative">
              {showSearch ? (
                <div className="flex flex-col gap-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
                    <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar por nombre o SKU..."
                      className="w-full pl-8 pr-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB]/10"
                    />
                  </div>
                  {filteredProducts.length > 0 && (
                    <div className="border border-[#E2E8F0] rounded-lg overflow-hidden shadow-sm">
                      {filteredProducts.map((p) => (
                        <button
                          key={p.sku}
                          onClick={() => handleAddProduct(p)}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-[#F8FAFC] transition-colors border-b border-[#F1F5F9] last:border-0"
                        >
                          <span className="flex flex-col items-start min-w-0">
                            <span className="text-[#0F172A] truncate">{p.name}</span>
                            <span className="text-[10px] text-[#94A3B8] font-mono">{p.sku}</span>
                          </span>
                          <span className="text-xs font-semibold text-[#1A56DB] tabular-nums ml-2 shrink-0">
                            {formatPrice(p.price)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => { setShowSearch(false); setSearchQuery(""); }}
                    className="text-xs text-[#64748B] hover:text-[#0F172A] self-start transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="flex items-center gap-1.5 text-xs text-[#1A56DB] hover:text-[#1447C0] font-medium transition-colors py-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar producto
                </button>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs text-[#64748B]">Total</span>
                {order.discountPercentage > 0 && (
                  <span className="text-xs text-[#94A3B8]">({order.discountPercentage}% desc.)</span>
                )}
                <span className="text-base font-bold text-[#0F172A] tabular-nums">
                  {formatPrice(computedTotal)}
                </span>
              </div>

              {hasChanges && !isLegacy && (
                <button
                  onClick={handleSaveItems}
                  disabled={saving}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all",
                    "bg-[#1A56DB] hover:bg-[#1447C0] text-white shadow-sm",
                    "disabled:opacity-60 disabled:cursor-not-allowed"
                  )}
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              )}
            </div>

            {hasPending && !isLegacy && (
              <div className="flex gap-2 flex-wrap pt-1">
                {availableItems.length > 0 && (
                  <button
                    onClick={() => handleResendFiltered(availableItems)}
                    className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-[#25D366]/10 text-[#128C3E] hover:bg-[#25D366]/20 border border-[#25D366]/30 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Reenviar disponibles ({availableItems.length})
                  </button>
                )}
                <button
                  onClick={() => handleResendFiltered(pendingItems)}
                  className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Reenviar pendientes ({pendingItems.length})
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Client ──────────────────────────────────────────────────────────────

export default function OrdersClient({
  initialOrders,
  products,
}: {
  initialOrders: Order[];
  products: Product[];
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filter, setFilter] = useState<OrderStatus | "Todos">("Todos");
  const [dateFilter, setDateFilter] = useState<string>(todayInputValue);

  function handleStatusChange(id: string, newStatus: OrderStatus) {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
  }

  const byDate = dateFilter
    ? orders.filter((o) => o.date === inputDateToAR(dateFilter))
    : orders;

  const filtered = filter === "Todos"
    ? byDate
    : byDate.filter((o) => o.status === filter);

  const counts = {
    Todos: byDate.length,
    Generado: byDate.filter((o) => o.status === "Generado").length,
    Aprobado: byDate.filter((o) => o.status === "Aprobado").length,
    Empaquetado: byDate.filter((o) => o.status === "Empaquetado").length,
    Cancelado: byDate.filter((o) => o.status === "Cancelado").length,
  };

  const isToday = dateFilter === todayInputValue();

  const visibleTabs = (["Todos", "Generado", "Aprobado", "Empaquetado", "Cancelado"] as const).filter(
    (f) => f === "Todos" || counts[f] > 0 || filter === f
  );

  return (
    <div className="flex flex-col gap-4">
      {/* KPI Bar */}
      <KpiBar orders={byDate} />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {visibleTabs.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "text-xs font-medium px-3 py-1.5 rounded-full border transition-colors",
                filter === f
                  ? "bg-[#0F172A] text-white border-[#0F172A]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              )}
            >
              {f}
              <span className={cn("ml-1.5 tabular-nums", filter === f ? "opacity-60" : "opacity-50")}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {filtered.length > 0 && (
            <span className="text-xs text-[#94A3B8]">
              {filtered.length} pedido{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
          <DatePickerPopover value={dateFilter} onChange={setDateFilter} />
        </div>
      </div>

      {/* Order list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-[#0F172A]">No hay pedidos</p>
          <p className="text-xs text-[#64748B] mt-1">
            {!dateFilter
              ? filter === "Todos"
                ? "Los pedidos que lleguen por WhatsApp aparecerán acá."
                : `No hay pedidos con estado "${filter}".`
              : isToday
                ? "Todavía no hay pedidos hoy."
                : `No hay pedidos para el ${inputDateToAR(dateFilter)}${filter !== "Todos" ? ` con estado "${filter}"` : ""}.`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((order) => (
            <OrderCard
              key={order.id || `${order.date}-${order.time}-${order.customerName}`}
              order={order}
              products={products}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
