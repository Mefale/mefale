"use client";

import { useState, useMemo } from "react";
import type { Product } from "@/types/product";
import { setOfferAction } from "./actions";

const PAGE_SIZE = 50;

interface RowState {
  offer: boolean;
  discountPrice: string;
  status: "idle" | "saving" | "saved" | "error";
  error?: string;
}

function initRows(products: Product[]): Record<string, RowState> {
  const map: Record<string, RowState> = {};
  for (const p of products) {
    map[p.sku] = {
      offer: p.offer,
      discountPrice: p.discountPrice ? String(p.discountPrice) : "",
      status: "idle",
    };
  }
  return map;
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 ${
        checked ? "bg-emerald-500" : "bg-gray-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function OffersClient({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<Record<string, RowState>>(() =>
    initRows(products)
  );
  const [confirmClear, setConfirmClear] = useState(false);
  const [offersFirst, setOffersFirst] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = q
      ? products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
        )
      : [...products];
    if (offersFirst) {
      list = [...list].sort((a, b) =>
        rows[b.sku].offer === rows[a.sku].offer
          ? 0
          : rows[b.sku].offer
          ? 1
          : -1
      );
    }
    return list;
  }, [products, search, offersFirst, rows]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function update(sku: string, patch: Partial<RowState>) {
    setRows((prev) => ({ ...prev, [sku]: { ...prev[sku], ...patch } }));
  }

  function isDirty(p: Product) {
    const row = rows[p.sku];
    const originalDiscount = p.discountPrice ? String(p.discountPrice) : "";
    return row.offer !== p.offer || row.discountPrice !== originalDiscount;
  }

  const dirtyProducts = products.filter(isDirty);
  const isSaving = dirtyProducts.some((p) => rows[p.sku]?.status === "saving");
  const activeOfferCount = products.filter((p) => rows[p.sku].offer).length;

  async function handleSave(p: Product) {
    update(p.sku, { status: "saving", error: undefined });
    const row = rows[p.sku];
    const discountPrice =
      row.offer && row.discountPrice ? parseFloat(row.discountPrice) : null;
    const result = await setOfferAction(p.sku, row.offer, discountPrice);
    update(
      p.sku,
      result.success
        ? { status: "saved" }
        : { status: "error", error: result.error }
    );
    setTimeout(() => update(p.sku, { status: "idle" }), 2000);
  }

  async function handleSaveAll() {
    if (dirtyProducts.length === 0) return;
    setRows((prev) => {
      const next = { ...prev };
      for (const p of dirtyProducts) {
        next[p.sku] = { ...next[p.sku], status: "saving", error: undefined };
      }
      return next;
    });

    const snapshot = { ...rows };
    await Promise.all(
      dirtyProducts.map(async (p) => {
        const row = snapshot[p.sku];
        const discountPrice =
          row.offer && row.discountPrice ? parseFloat(row.discountPrice) : null;
        const result = await setOfferAction(p.sku, row.offer, discountPrice);
        update(
          p.sku,
          result.success
            ? { status: "saved" }
            : { status: "error", error: result.error }
        );
      })
    );

    setTimeout(() => {
      setRows((prev) => {
        const next = { ...prev };
        for (const p of dirtyProducts) {
          if (next[p.sku].status === "saved") {
            next[p.sku] = { ...next[p.sku], status: "idle" };
          }
        }
        return next;
      });
    }, 2000);
  }

  async function handleClearAllConfirmed() {
    setConfirmClear(false);
    const toRemove = products.filter((p) => rows[p.sku].offer);
    if (toRemove.length === 0) return;

    setRows((prev) => {
      const next = { ...prev };
      for (const p of toRemove) {
        next[p.sku] = {
          ...next[p.sku],
          offer: false,
          discountPrice: "",
          status: "saving",
          error: undefined,
        };
      }
      return next;
    });

    await Promise.all(
      toRemove.map(async (p) => {
        const result = await setOfferAction(p.sku, false, null);
        update(
          p.sku,
          result.success
            ? { status: "saved" }
            : { status: "error", error: result.error }
        );
      })
    );

    setTimeout(() => {
      setRows((prev) => {
        const next = { ...prev };
        for (const p of toRemove) {
          if (next[p.sku].status === "saved") {
            next[p.sku] = { ...next[p.sku], status: "idle" };
          }
        }
        return next;
      });
    }, 2000);
  }

  return (
    <div>
      {/* Estadistica + accion quitar todas */}
      {activeOfferCount > 0 && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shrink-0">
            {activeOfferCount}
          </span>
          <span className="text-sm text-emerald-800">
            {activeOfferCount === 1
              ? "1 producto en oferta activa"
              : `${activeOfferCount} productos con oferta activa`}
          </span>
          {confirmClear ? (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-red-700">Confirmar?</span>
              <button
                onClick={handleClearAllConfirmed}
                className="text-xs font-medium px-2.5 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Quitar todas
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="ml-auto text-xs text-red-500 hover:text-red-700 hover:underline transition-colors"
            >
              Quitar todas
            </button>
          )}
        </div>
      )}

      {/* Banner guardar todos */}
      {dirtyProducts.length > 0 && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
          <p className="text-sm text-amber-800">
            <span className="font-medium">{dirtyProducts.length}</span>{" "}
            {dirtyProducts.length === 1 ? "cambio" : "cambios"} sin guardar
          </p>
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="text-sm font-medium px-4 py-1.5 rounded-lg bg-amber-800 text-white hover:bg-amber-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            {isSaving ? "Guardando..." : "Guardar todos"}
          </button>
        </div>
      )}

      {/* Buscador + filtros */}
      <div className="flex flex-col gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o SKU..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setOffersFirst((v) => !v);
              setPage(1);
            }}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap ${
              offersFirst
                ? "bg-gray-900 text-white border-gray-900"
                : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            En oferta primero
          </button>
          <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
            {filtered.length} productos
          </span>
        </div>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400">No se encontraron productos.</p>
      ) : (
        <>
          <div className="space-y-2">
            {paginated.map((p) => {
              const row = rows[p.sku];
              const dirty = isDirty(p);
              const isOnOffer = row.offer;

              return (
                <div
                  key={p.sku}
                  className={`bg-white border rounded-lg transition-all ${
                    isOnOffer
                      ? "border-l-4 border-l-emerald-400 border-gray-200 pl-3 pr-4 py-3"
                      : "border-gray-200 px-4 py-3"
                  }`}
                >
                  {/* Fila superior: toggle + nombre + boton guardar */}
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5 shrink-0">
                      <Toggle
                        checked={isOnOffer}
                        onChange={(v) =>
                          update(p.sku, {
                            offer: v,
                            discountPrice: v ? row.discountPrice : "",
                            status: "idle",
                          })
                        }
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 leading-snug truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">
                        {p.sku}
                        <span className="mx-1.5">·</span>
                        <span className="text-gray-500 font-sans">
                          Precio: ${p.price.toLocaleString("es-AR")}
                        </span>
                      </p>
                    </div>

                    {dirty && (
                      <button
                        onClick={() => handleSave(p)}
                        disabled={row.status === "saving"}
                        className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-gray-900 text-white hover:bg-gray-700 mt-0.5"
                      >
                        {row.status === "saving" ? "..." : "Guardar"}
                      </button>
                    )}
                    {!dirty && row.status === "saved" && (
                      <span className="shrink-0 text-xs text-emerald-600 font-medium mt-0.5">
                        Guardado
                      </span>
                    )}
                  </div>

                  {/* Precio oferta: se despliega hacia abajo sin mover el producto */}
                  <div className={`grid transition-all duration-200 ${isOnOffer ? "grid-rows-[1fr] mt-2.5" : "grid-rows-[0fr] mt-0"}`}>
                    <div className="overflow-hidden">
                      <div className="ml-12 flex items-center gap-2">
                        <span className="text-xs text-gray-500 shrink-0">
                          Precio oferta
                        </span>
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-gray-900 bg-white">
                          <span className="px-2 text-sm text-gray-400 select-none border-r border-gray-200 bg-gray-50">
                            $
                          </span>
                          <input
                            type="number"
                            min={1}
                            placeholder="0"
                            value={row.discountPrice}
                            disabled={!isOnOffer}
                            onChange={(e) =>
                              update(p.sku, {
                                discountPrice: e.target.value,
                                status: "idle",
                              })
                            }
                            className="w-36 px-2 py-1.5 text-sm focus:outline-none disabled:cursor-not-allowed"
                          />
                        </div>
                        {isOnOffer && row.discountPrice && p.price > 0 && (
                          <span className="text-xs text-emerald-600 font-medium">
                            -{Math.round(
                              ((p.price - parseFloat(row.discountPrice)) /
                                p.price) *
                                100
                            )}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {row.status === "error" && (
                    <p className="text-xs text-red-500 mt-1.5 ml-12">
                      {row.error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              <span className="text-xs text-gray-500">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}