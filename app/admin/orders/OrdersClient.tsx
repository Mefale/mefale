"use client";

import { useState, useCallback } from "react";
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

const STATUS_OPTIONS: { value: OrderStatus; label: string; color: string }[] = [
  { value: "Generado",    label: "Generado",    color: "bg-gray-100 text-gray-700 border-gray-200" },
  { value: "Aprobado",    label: "Aprobado",    color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "Empaquetado", label: "Empaquetado", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "Cancelado",   label: "Cancelado",   color: "bg-red-50 text-red-700 border-red-200" },
];

function statusColor(s: OrderStatus) {
  return STATUS_OPTIONS.find((o) => o.value === s)?.color ?? "bg-gray-100 text-gray-700";
}

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({ order, products }: { order: Order; products: Product[] }) {
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

  // ── Status change (guardado inmediato) ──
  async function handleStatusChange(newStatus: OrderStatus) {
    if (isLegacy) return;
    setStatus(newStatus);
    const res = await updateOrderAction(order.id, { status: newStatus });
    if (!res.success) {
      setStatus(order.status);
      toast.error(res.error ?? "No se pudo actualizar el estado.");
    }
  }

  // ── Item edits ──
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
    setShowSearch(false);
  }

  // ── Save items ──
  async function handleSaveItems() {
    if (isLegacy) return;
    setSaving(true);
    const res = await updateOrderAction(order.id, { items });
    setSaving(false);
    if (res.success) {
      toast.success("Pedido actualizado.");
    } else {
      toast.error(res.error ?? "Error al guardar.");
      setItems(order.items); // revertir
    }
  }

  // ── Copy to clipboard ──
  async function handleCopy() {
    const msg = buildOrderSummaryMessage(items, order.customerName, order.discountPercentage);
    await navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── WhatsApp re-send ──
  function handleResend() {
    if (!hasPhone) return;
    const msg = buildOrderSummaryMessage(items, order.customerName, order.discountPercentage);
    const url = buildWhatsAppUrlForNumber(msg, order.phone);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  // ── Product search ──
  const filteredProducts = searchQuery.length >= 2
    ? products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  return (
    <div className={cn(
      "bg-white rounded-xl border transition-shadow",
      isLegacy ? "border-dashed border-gray-300" : "border-gray-200 shadow-sm hover:shadow-md"
    )}>
      {/* ── Card header ── */}
      <div className="px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[#0F172A] text-sm truncate">
              {order.customerName !== "-" ? order.customerName : "Cliente sin nombre"}
            </span>
            {isLegacy && (
              <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium border border-gray-200">
                Legacy
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-[#64748B]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {order.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {order.time}
            </span>
            {order.phone !== "-" && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {order.phone}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status select */}
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
            disabled={isLegacy}
            className={cn(
              "text-xs font-medium px-2.5 py-1 rounded-full border cursor-pointer",
              "focus:outline-none focus:ring-2 focus:ring-[#1A56DB]/20",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              statusColor(status)
            )}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Total */}
          <span className="text-sm font-bold text-[#0F172A] tabular-nums whitespace-nowrap">
            {formatPrice(computedTotal)}
          </span>

          {/* WhatsApp re-send */}
          {hasPhone ? (
            <button
              onClick={handleResend}
              title="Reenviar pedido al cliente por WhatsApp"
              className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-[#25D366]/10 text-[#128C3E] hover:bg-[#25D366]/20 border border-[#25D366]/30 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reenviar</span>
            </button>
          ) : (
            <button
              onClick={handleCopy}
              title="Copiar pedido al portapapeles"
              className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? "¡Copiado!" : "Copiar"}</span>
            </button>
          )}

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Contraer" : "Expandir"}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Expanded: items ── */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 flex flex-col gap-3">
          {/* Item list */}
          <div className="flex flex-col gap-1">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_80px_90px_28px] gap-2 text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider px-1">
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
                className="grid grid-cols-[1fr_80px_90px_28px] gap-2 items-center py-1.5 px-1 rounded-lg hover:bg-gray-50"
              >
                {/* Nombre + SKU */}
                <div className="min-w-0">
                  <p className="text-sm text-[#0F172A] leading-tight truncate">{item.name}</p>
                  <p className="text-[10px] text-[#94A3B8] font-mono">{item.sku}</p>
                </div>

                {/* Cantidad */}
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => handleQtyChange(idx, e.target.value)}
                  disabled={isLegacy}
                  className={cn(
                    "w-full text-center text-sm font-semibold text-[#0F172A]",
                    "border border-[#E2E8F0] rounded-lg px-2 py-1",
                    "focus:outline-none focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB]/10",
                    "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed",
                    "tabular-nums"
                  )}
                />

                {/* Precio unitario */}
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8] pointer-events-none">$</span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.price === 0 && order.items[idx]?.price === 0 ? "" : item.price}
                    onChange={(e) => handlePriceChange(idx, e.target.value)}
                    disabled={isLegacy}
                    placeholder={item.price === 0 ? "—" : undefined}
                    className={cn(
                      "w-full text-right text-sm text-[#0F172A]",
                      "border border-[#E2E8F0] rounded-lg pl-5 pr-2 py-1",
                      "focus:outline-none focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB]/10",
                      "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed",
                      "tabular-nums"
                    )}
                  />
                </div>

                {/* Eliminar */}
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

          {/* Agregar producto */}
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

          {/* Total + guardar */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
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
  const [filter, setFilter] = useState<OrderStatus | "Todos">("Todos");

  const filtered = filter === "Todos"
    ? initialOrders
    : initialOrders.filter((o) => o.status === filter);

  const counts = {
    Todos: initialOrders.length,
    Generado: initialOrders.filter((o) => o.status === "Generado").length,
    Aprobado: initialOrders.filter((o) => o.status === "Aprobado").length,
    Empaquetado: initialOrders.filter((o) => o.status === "Empaquetado").length,
    Cancelado: initialOrders.filter((o) => o.status === "Cancelado").length,
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["Todos", "Generado", "Aprobado", "Empaquetado", "Cancelado"] as const).map((f) => (
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
            {f} <span className="ml-1 opacity-60">{counts[f]}</span>
          </button>
        ))}
      </div>

      {/* Order list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-[#0F172A]">No hay pedidos</p>
          <p className="text-xs text-[#64748B] mt-1">
            {filter === "Todos"
              ? "Los pedidos que lleguen por WhatsApp aparecerán acá."
              : `No hay pedidos con estado "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((order) => (
            <OrderCard key={order.id || `${order.date}-${order.time}-${order.customerName}`} order={order} products={products} />
          ))}
        </div>
      )}
    </div>
  );
}
