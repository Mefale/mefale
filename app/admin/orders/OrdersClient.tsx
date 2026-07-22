"use client";

import { useState, useRef, useEffect, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
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
  DollarSign,
  FileText,
  PackageX,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/utils/format-price";
import {
  buildWhatsAppUrlForNumber,
  buildOrderSummaryMessage,
} from "@/lib/whatsapp/build-message";
import { updateOrderAction, createOrderAction } from "./actions";
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

const FLOW_STEPS = STATUS_OPTIONS.slice(0, 3);

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

function orderKey(o: Order): string {
  return o.id || `${o.date}-${o.time}-${o.customerName}`;
}

// ─── KPI Bar ─────────────────────────────────────────────────────────────────

function KpiItem({
  icon: Icon,
  label,
  value,
  valueColor,
  iconColor,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  valueColor?: string;
  iconColor?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-[#E2E8F0] shadow-sm",
          iconColor ?? "text-[#1A56DB]"
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={2.25} />
      </span>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider truncate">
          {label}
        </span>
        <span className={cn("text-lg font-bold text-[#0F172A] tabular-nums leading-none", valueColor)}>
          {value}
        </span>
      </div>
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
    <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-gradient-to-br from-[#F8FAFC] via-white to-[#EFF4FE] shadow-[0_24px_54px_-26px_rgba(26,86,219,0.25)]">
      {/* Decoración técnica */}
      <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-[#1D4ED8] opacity-[0.07] blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-28 -left-12 h-56 w-56 rounded-full bg-[#0284C7] opacity-[0.06] blur-[110px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(26,86,219,0.06) 1px, transparent 1px), linear-gradient(to right, rgba(26,86,219,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 80% 100% at 50% 0%, black 30%, transparent 75%)",
        }}
      />

      <div className="relative grid grid-cols-2 sm:grid-cols-4 divide-y divide-x divide-[#E2E8F0]/70 sm:divide-y-0">
        <KpiItem icon={DollarSign} label="Total del día" value={formatPrice(totalDia)} />
        <KpiItem
          icon={FileText}
          label="Generados"
          value={`${generados} pedido${generados !== 1 ? "s" : ""}`}
        />
        <KpiItem
          icon={PackageX}
          label="Pendientes de stock"
          value={`${pendienteStock} producto${pendienteStock !== 1 ? "s" : ""}`}
          valueColor={pendienteStock > 0 ? "text-[#D97706]" : undefined}
          iconColor={pendienteStock > 0 ? "text-[#D97706]" : undefined}
        />
        <KpiItem
          icon={Send}
          label="Listos para enviar"
          value={`${listosParaEnviar} pedido${listosParaEnviar !== 1 ? "s" : ""}`}
          valueColor={listosParaEnviar > 0 ? "text-[#16A34A]" : undefined}
          iconColor={listosParaEnviar > 0 ? "text-[#16A34A]" : undefined}
        />
      </div>
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
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden w-[min(320px,calc(100vw-1rem))] sm:w-[480px] sm:flex">
          {/* Shortcuts — horizontal scroll en mobile, sidebar en sm+ */}
          <div className="sm:w-36 sm:shrink-0 sm:bg-gray-50 sm:border-r sm:border-gray-100 sm:p-3 sm:flex sm:flex-col sm:gap-1">
            {/* Mobile: chips horizontales */}
            <div className="flex gap-1.5 overflow-x-auto px-3 pt-3 pb-2 sm:hidden scrollbar-none">
              {SHORTCUTS.map((s) => {
                const v = s.get();
                return (
                  <button
                    key={s.label}
                    onClick={() => select(v)}
                    className={cn(
                      "shrink-0 text-xs px-2.5 py-1.5 rounded-full border transition-colors whitespace-nowrap",
                      value === v
                        ? "bg-[#0F172A] text-white border-[#0F172A]"
                        : "text-[#374151] border-gray-200 hover:bg-gray-100"
                    )}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
            {/* Desktop: lista vertical */}
            <p className="hidden sm:block text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">
              Accesos rápidos
            </p>
            {SHORTCUTS.map((s) => {
              const v = s.get();
              return (
                <button
                  key={s.label}
                  onClick={() => select(v)}
                  className={cn(
                    "hidden sm:block text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors",
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

// ─── Status Stepper (usado dentro del panel de detalle) ───────────────────────

function StatusStepper({
  status,
  onChange,
  disabled,
}: {
  status: OrderStatus;
  onChange: (s: OrderStatus) => void;
  disabled?: boolean;
}) {
  const isCancelled = status === "Cancelado";
  const currentIdx = FLOW_STEPS.findIndex((s) => s.value === status);

  if (isCancelled) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
        <div className="flex items-center gap-2 text-red-600">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <span className="text-sm font-semibold">Pedido cancelado</span>
        </div>
        {!disabled && (
          <button
            onClick={() => onChange("Generado")}
            className="text-xs font-medium text-red-600 hover:text-red-700 underline underline-offset-2"
          >
            Reactivar
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start">
        {FLOW_STEPS.map((step, i) => {
          const done = i < currentIdx;
          const reached = i <= currentIdx;
          return (
            <Fragment key={step.value}>
              <button
                onClick={() => onChange(step.value)}
                disabled={disabled}
                className="flex flex-col items-center gap-1.5 group disabled:cursor-not-allowed"
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                    reached
                      ? "bg-[#1A56DB] border-[#1A56DB] text-white"
                      : "bg-white border-[#E2E8F0] text-[#94A3B8] group-hover:border-[#94A3B8]"
                  )}
                >
                  {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "text-[11px] font-medium whitespace-nowrap",
                    reached ? "text-[#0F172A]" : "text-[#94A3B8]"
                  )}
                >
                  {step.label}
                </span>
              </button>
              {i < FLOW_STEPS.length - 1 && (
                <span
                  className={cn(
                    "h-0.5 flex-1 mx-1 mt-4 rounded-full transition-colors",
                    i < currentIdx ? "bg-[#1A56DB]" : "bg-[#E2E8F0]"
                  )}
                />
              )}
            </Fragment>
          );
        })}
      </div>
      {!disabled && (
        <button
          onClick={() => onChange("Cancelado")}
          className="self-start text-xs font-medium text-[#94A3B8] hover:text-red-600 transition-colors"
        >
          Cancelar pedido
        </button>
      )}
    </div>
  );
}

// ─── Order Row (fila compacta de la lista) ─────────────────────────────────────

function OrderRow({
  order,
  onOpen,
}: {
  order: Order;
  onOpen: (key: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const isLegacy = !order.id;
  const hasPhone = order.phone && order.phone !== "-";
  const customerName = order.customerName !== "-" ? order.customerName : null;

  const pendingItems = order.items.filter((i) => i.pending);
  const hasPending = pendingItems.length > 0;

  const total = order.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const orderNum = String(order.rowNumber - 1).padStart(4, "0");
  const previewItems = order.items.slice(0, 2);

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    const msg = buildOrderSummaryMessage(order.items, order.customerName, order.discountPercentage);
    await navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleResend(e: React.MouseEvent) {
    e.stopPropagation();
    if (!hasPhone) return;
    const msg = buildOrderSummaryMessage(order.items, order.customerName, order.discountPercentage);
    const url = buildWhatsAppUrlForNumber(msg, order.phone);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div
      onClick={() => onOpen(orderKey(order))}
      className={cn(
        "bg-white rounded-xl border border-[#E2E8F0] border-l-4 overflow-hidden cursor-pointer transition-all duration-200",
        isLegacy
          ? "border-dashed border-gray-300 border-l-gray-300"
          : cn(
              "shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:border-l-[6px]",
              statusBorder(order.status)
            )
      )}
    >
      <div className="px-4 py-3 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        {/* Info: order number + name + phone + badges + meta line */}
        <div className="flex flex-col gap-1 min-w-0 sm:flex-1">
          {/* Name row */}
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="text-[11px] font-mono text-[#64748B] shrink-0 bg-[#F1F5F9] rounded-md px-1.5 py-0.5">
              #{orderNum}
            </span>
            <span className="font-semibold text-[#0F172A] truncate">
              {customerName ?? "Sin nombre"}
            </span>
            {hasPending && (
              <span className="flex items-center gap-1.5 text-[10px] bg-[#FEE2E2] text-[#B91C1C] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wide border border-[#DC2626]/25 whitespace-nowrap shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626] animate-pulse" />
                {pendingItems.length} sin stock
              </span>
            )}
            {isLegacy && (
              <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-medium border border-gray-200 shrink-0">
                Legacy
              </span>
            )}
          </div>

          {/* Meta line: time · N productos · (preview items en sm+) */}
          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] min-w-0">
            {hasPhone && (
              <>
                <span className="flex items-center gap-1 shrink-0 text-[#64748B]">
                  <Phone className="w-3 h-3" />
                  {order.phone}
                </span>
                <span className="shrink-0">·</span>
              </>
            )}
            <Clock className="w-3 h-3 shrink-0" />
            <span className="shrink-0">{order.time}</span>
            <span className="shrink-0">·</span>
            <span className="shrink-0">{order.items.length} producto{order.items.length !== 1 ? "s" : ""}</span>
            {/* Preview de items: solo en pantallas grandes para no romper en mobile */}
            <span className="hidden sm:flex items-center gap-1.5 min-w-0">
              {previewItems.map((item, i) => (
                <Fragment key={i}>
                  <span className="shrink-0">·</span>
                  <span className="text-[#64748B] truncate max-w-[140px]">
                    {item.name} × {item.quantity}
                  </span>
                </Fragment>
              ))}
            </span>
          </div>
        </div>

        {/* Controls: status pill + price block + actions.
            En mobile: fila completa con justify-between. En sm+: a la derecha. */}
        <div className="flex items-center gap-2 shrink-0 justify-between sm:justify-end">
          <span className={cn("text-xs font-medium px-3 py-1 rounded-full border", statusPill(order.status))}>
            <span className={cn("inline-block w-1.5 h-1.5 rounded-full mr-1.5 -translate-y-px", statusDot(order.status))} />
            {order.status}
          </span>

          <div className="flex items-center gap-2 shrink-0">
            {/* Price + item count */}
            <div className="text-right">
              <div className="text-sm font-bold text-[#0F172A] tabular-nums whitespace-nowrap">
                {formatPrice(total)}
              </div>
              <div className="text-[10px] text-[#94A3B8] tabular-nums">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
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

            <ChevronRight className="w-4 h-4 text-gray-300" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Order Detail Panel (ficha lateral) ────────────────────────────────────────

function OrderDetailPanel({
  order,
  products,
  onClose,
  onStatusChange,
  onItemsSaved,
}: {
  order: Order;
  products: Product[];
  onClose: () => void;
  onStatusChange: (key: string, newStatus: OrderStatus) => void;
  onItemsSaved: (key: string, items: OrderItem[]) => void;
}) {
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

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleStatusChange(newStatus: OrderStatus) {
    if (isLegacy) return;
    const prev = status;
    setStatus(newStatus);
    onStatusChange(orderKey(order), newStatus);
    const res = await updateOrderAction(order.id, { status: newStatus });
    if (!res.success) {
      setStatus(prev);
      onStatusChange(orderKey(order), prev);
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
      onItemsSaved(orderKey(order), items);
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
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
          "w-[calc(100%-2rem)] sm:w-[90vw] sm:max-w-[880px] lg:max-w-[1040px]",
          "max-h-[calc(100dvh-2rem)] sm:max-h-[88vh]",
          "flex flex-col overflow-hidden",
          "bg-white rounded-2xl border border-[#E2E8F0]",
          "shadow-[0_24px_48px_-12px_rgba(15,23,42,0.35)]"
        )}
        role="dialog"
        aria-modal
        aria-label="Detalle del pedido"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono text-[#64748B] bg-white rounded-md px-1.5 py-0.5 border border-[#E2E8F0]">
                #{orderNum}
              </span>
              <h2 className="font-bold text-[#0F172A] text-base truncate">
                {customerName ?? "Sin nombre"}
              </h2>
              {isLegacy && (
                <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-medium border border-gray-200">
                  Legacy
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B] flex-wrap">
              {hasPhone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {order.phone}
                </span>
              )}
              {hasPhone && <span>·</span>}
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {order.date}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {order.time}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5 lg:grid lg:grid-cols-[300px_1fr] lg:gap-x-6 lg:items-start">
          {/* Estado */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider">
              Estado del pedido
            </p>
            <StatusStepper status={status} onChange={handleStatusChange} disabled={isLegacy} />
          </div>

          {/* Productos */}
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">
              Productos
            </p>
            <div className="grid grid-cols-[20px_1fr_70px_85px_28px] gap-2 text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider px-1">
              <span />
              <span>Producto</span>
              <span className="text-center">Cant.</span>
              <span className="text-right">Precio</span>
              <span />
            </div>

            {items.length === 0 && (
              <p className="text-xs text-[#94A3B8] italic py-2 text-center">Sin productos</p>
            )}

            {items.map((item, idx) => (
              <div
                key={`${item.sku}-${idx}`}
                className={cn(
                  "grid grid-cols-[20px_1fr_70px_85px_28px] gap-2 items-center py-1.5 px-1 rounded-lg transition-colors",
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

            {!isLegacy && (
              <div className="relative mt-1">
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
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-[#64748B]">Total</span>
              {order.discountPercentage > 0 && (
                <span className="text-xs text-[#94A3B8]">({order.discountPercentage}% desc.)</span>
              )}
              <span className="text-lg font-bold text-[#0F172A] tabular-nums">
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
            <div className="flex gap-2 flex-wrap">
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

          <div className="flex gap-2">
            {hasPhone ? (
              <button
                onClick={handleResend}
                className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-lg bg-[#25D366]/10 text-[#128C3E] hover:bg-[#25D366]/20 border border-[#25D366]/30 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Reenviar por WhatsApp
              </button>
            ) : (
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copiado" : "Copiar pedido"}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Create Order Modal (orden manual) ─────────────────────────────────────────

function CreateOrderModal({
  products,
  onClose,
  onCreated,
}: {
  products: Product[];
  onClose: () => void;
  onCreated: (order: Order) => void;
}) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const computedTotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  function handleQtyChange(idx: number, raw: string) {
    const qty = Math.max(1, parseInt(raw) || 1);
    setItems((prev) => prev.map((it, i) => i === idx ? { ...it, quantity: qty } : it));
  }

  function handlePriceChange(idx: number, raw: string) {
    const price = Math.max(0, parseFloat(raw) || 0);
    setItems((prev) => prev.map((it, i) => i === idx ? { ...it, price } : it));
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
  }

  async function handleCreate() {
    if (items.length === 0) return;
    setCreating(true);
    const res = await createOrderAction({
      customerName: customerName.trim(),
      phone: phone.trim(),
      items,
    });
    setCreating(false);
    if (res.success && res.order) {
      toast.success("Orden creada.");
      onCreated(res.order);
    } else {
      toast.error(res.error ?? "No se pudo crear la orden.");
    }
  }

  const filteredProducts = searchQuery.length >= 2
    ? products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
          "w-[calc(100%-2rem)] sm:w-[90vw] sm:max-w-[720px]",
          "h-[calc(100dvh-2rem)] sm:h-[620px] sm:max-h-[88vh]",
          "flex flex-col overflow-hidden",
          "bg-white rounded-2xl border border-[#E2E8F0]",
          "shadow-[0_24px_48px_-12px_rgba(15,23,42,0.35)]"
        )}
        role="dialog"
        aria-modal
        aria-label="Nueva orden manual"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between gap-3">
          <h2 className="font-bold text-[#0F172A] text-base">Nueva orden manual</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
          {/* Cliente */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider">
              Cliente
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nombre (opcional)"
                className="w-full text-sm text-[#0F172A] border border-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB]/10"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Teléfono (opcional)"
                className="w-full text-sm text-[#0F172A] border border-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB]/10"
              />
            </div>
          </div>

          {/* Productos */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider">
              Productos
            </p>

            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar producto por nombre o SKU…"
                className="w-full text-sm text-[#0F172A] border border-[#E2E8F0] rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB]/10"
              />
              {filteredProducts.length > 0 && (
                <div className="absolute z-10 mt-1 w-full max-h-64 overflow-y-auto bg-white border border-[#E2E8F0] rounded-lg shadow-lg divide-y divide-[#F1F5F9]">
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleAddProduct(p)}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-[#F8FAFC] transition-colors"
                    >
                      <span className="flex flex-col min-w-0">
                        <span className="text-sm text-[#0F172A] truncate">{p.name}</span>
                        <span className="text-[10px] text-[#94A3B8] font-mono">{p.sku}</span>
                      </span>
                      <span className="text-xs font-semibold text-[#1A56DB] tabular-nums ml-2 shrink-0">
                        {formatPrice(p.price)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Lista */}
            {items.length === 0 ? (
              <p className="text-xs text-[#94A3B8] italic py-3 text-center border border-dashed border-[#E2E8F0] rounded-lg">
                Buscá y agregá productos para armar la orden.
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                <div className="grid grid-cols-[1fr_70px_85px_28px] gap-2 text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider px-1">
                  <span>Producto</span>
                  <span className="text-center">Cant.</span>
                  <span className="text-right">Precio</span>
                  <span />
                </div>
                {items.map((item, idx) => (
                  <div
                    key={`${item.sku}-${idx}`}
                    className="grid grid-cols-[1fr_70px_85px_28px] gap-2 items-center py-1.5 px-1 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm leading-tight truncate text-[#0F172A]">{item.name}</p>
                      <p className="text-[10px] text-[#94A3B8] font-mono">{item.sku}</p>
                    </div>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => handleQtyChange(idx, e.target.value)}
                      className="w-full text-center text-sm font-semibold text-[#0F172A] border border-[#E2E8F0] rounded-lg px-2 py-1 focus:outline-none focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB]/10 tabular-nums"
                    />
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8] pointer-events-none">$</span>
                      <input
                        type="number"
                        min={0}
                        value={item.price}
                        onChange={(e) => handlePriceChange(idx, e.target.value)}
                        className="w-full text-right text-sm font-semibold text-[#0F172A] border border-[#E2E8F0] rounded-lg pl-5 pr-2 py-1 focus:outline-none focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB]/10 tabular-nums"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveItem(idx)}
                      aria-label="Quitar producto"
                      className="p-1 rounded text-[#CBD5E1] hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-[#64748B]">Total</span>
            <span className="text-lg font-bold text-[#0F172A] tabular-nums">
              {formatPrice(computedTotal)}
            </span>
          </div>
          <button
            onClick={handleCreate}
            disabled={items.length === 0 || creating}
            className={cn(
              "flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-all",
              "bg-[#1A56DB] hover:bg-[#1447C0] text-white shadow-sm",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Plus className="w-4 h-4" />
            {creating ? "Creando..." : "Crear orden"}
          </button>
        </div>
      </motion.div>
    </>
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
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  function handleOrderCreated(order: Order) {
    setOrders((prev) => [order, ...prev]);
    setShowCreate(false);
    setSelectedKey(orderKey(order));
  }

  function handleStatusChange(key: string, newStatus: OrderStatus) {
    setOrders((prev) =>
      prev.map((o) => (orderKey(o) === key ? { ...o, status: newStatus } : o))
    );
  }

  function handleItemsSaved(key: string, items: OrderItem[]) {
    setOrders((prev) =>
      prev.map((o) => (orderKey(o) === key ? { ...o, items } : o))
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

  const selectedOrder = selectedKey ? orders.find((o) => orderKey(o) === selectedKey) ?? null : null;

  return (
    <div className="flex flex-col gap-4">
      {/* KPI Bar */}
      <KpiBar orders={byDate} />

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        {/* Tabs — scroll horizontal en mobile */}
        <div className="flex-1 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 w-max">
            {visibleTabs.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "text-xs font-medium px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap",
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
        </div>

        {/* Date picker — siempre a la derecha */}
        <div className="flex items-center gap-3 shrink-0">
          {filtered.length > 0 && (
            <span className="hidden sm:block text-xs text-[#94A3B8]">
              {filtered.length} pedido{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
          <DatePickerPopover value={dateFilter} onChange={setDateFilter} />
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#1A56DB] hover:bg-[#1447C0] text-white shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Crear orden</span>
          </button>
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
          {filtered.map((order, index) => (
            <motion.div
              key={orderKey(order)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4), ease: "easeOut" }}
            >
              <OrderRow order={order} onOpen={setSelectedKey} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail panel */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailPanel
            key={orderKey(selectedOrder)}
            order={selectedOrder}
            products={products}
            onClose={() => setSelectedKey(null)}
            onStatusChange={handleStatusChange}
            onItemsSaved={handleItemsSaved}
          />
        )}
      </AnimatePresence>

      {/* Create order modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateOrderModal
            products={products}
            onClose={() => setShowCreate(false)}
            onCreated={handleOrderCreated}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
