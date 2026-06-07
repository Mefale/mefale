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

async function saveProducts(
  targets: Product[],
  rows: Record<string, RowState>,
  onUpdate: (sku: string, patch: Partial<RowState>) => void
) {
  await Promise.all(
    targets.map(async (p) => {
      const row = rows[p.sku];
      const discountPrice =
        row.offer && row.discountPrice ? parseFloat(row.discountPrice) : null;
      const result = await setOfferAction(p.sku, row.offer, discountPrice);
      onUpdate(
        p.sku,
        result.success
          ? { status: "saved" }
          : { status: "error", error: result.error }
      );
    })
  );
}

export default function OffersClient({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<Record<string, RowState>>(() =>
    initRows(products)
  );
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }, [products, search]);

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

  async function handleSave(p: Product) {
    update(p.sku, { status: "saving", error: undefined });
    await saveProducts([p], rows, update);
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

    // Capture rows snapshot before async work
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

    // Products currently marked as offer (in state or in original)
    const toRemove = products.filter((p) => rows[p.sku].offer);
    if (toRemove.length === 0) return;

    // Update local state first
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

  const activeOfferCount = products.filter((p) => rows[p.sku].offer).length;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre o SKU…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full max-w-sm border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <span className="text-xs text-gray-400 shrink-0">
          {filtered.length} productos
        </span>
        {activeOfferCount > 0 && (
          <div className="ml-auto shrink-0">
            {confirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-600">
                  ¿Quitar {activeOfferCount} ofertas y guardar?
                </span>
                <button
                  onClick={handleClearAllConfirmed}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                Quitar todas las ofertas
              </button>
            )}
          </div>
        )}
      </div>

      {dirtyProducts.length > 0 && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
          <p className="text-sm text-amber-800">
            <span className="font-medium">{dirtyProducts.length}</span>{" "}
            {dirtyProducts.length === 1
              ? "producto modificado"
              : "productos modificados"}{" "}
            sin guardar
          </p>
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="text-sm font-medium px-4 py-1.5 rounded-lg bg-amber-800 text-white hover:bg-amber-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? "Guardando…" : "Guardar todos"}
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400">No se encontraron productos.</p>
      ) : (
        <>
          <div className="space-y-2">
            {paginated.map((p) => {
              const row = rows[p.sku];
              const dirty = isDirty(p);

              return (
                <div
                  key={p.sku}
                  className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">
                      {p.sku} · ${p.price.toLocaleString("es-AR")}
                    </p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={row.offer}
                      onChange={(e) => {
                        update(p.sku, {
                          offer: e.target.checked,
                          discountPrice: e.target.checked
                            ? row.discountPrice
                            : "",
                          status: "idle",
                        });
                      }}
                      className="w-4 h-4 accent-gray-900"
                    />
                    <span className="text-xs text-gray-600">En oferta</span>
                  </label>

                  <input
                    type="number"
                    min={1}
                    placeholder="Precio oferta"
                    value={row.discountPrice}
                    disabled={!row.offer}
                    onChange={(e) =>
                      update(p.sku, {
                        discountPrice: e.target.value,
                        status: "idle",
                      })
                    }
                    className="w-32 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-40 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />

                  <button
                    onClick={() => handleSave(p)}
                    disabled={!dirty || row.status === "saving"}
                    className="shrink-0 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-gray-900 text-white hover:bg-gray-800"
                  >
                    {row.status === "saving"
                      ? "Guardando…"
                      : row.status === "saved"
                      ? "Guardado ✓"
                      : "Guardar"}
                  </button>

                  {row.status === "error" && (
                    <p className="text-xs text-red-500 w-full">{row.error}</p>
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
                ← Anterior
              </button>
              <span className="text-xs text-gray-500">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
