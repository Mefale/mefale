"use client";

import { useState, useMemo, useTransition } from "react";
import type { Product } from "@/types/product";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const PAGE_SIZE = 50;

type ModalState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; product: Product };

type FormData = {
  sku: string;
  category: string;
  name: string;
  price: string;
};

const EMPTY_FORM: FormData = { sku: "", category: "", name: "", price: "" };

function formFromProduct(p: Product): FormData {
  return { sku: p.sku, category: p.category, name: p.name, price: String(p.price) };
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function ProductsClient({ products }: { products: Product[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.sku.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [search, products]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormError(null);
    setModal({ mode: "create" });
  }

  function openEdit(product: Product) {
    setForm(formFromProduct(product));
    setFormError(null);
    setModal({ mode: "edit", product });
  }

  function closeModal() {
    setModal({ mode: "closed" });
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleSubmit() {
    setFormError(null);
    const price = parseFloat(form.price);
    if (!form.sku.trim()) return setFormError("SKU requerido.");
    if (!form.category.trim()) return setFormError("Categoría requerida.");
    if (!form.name.trim()) return setFormError("Nombre requerido.");
    if (isNaN(price) || price <= 0) return setFormError("Precio inválido.");

    startTransition(async () => {
      let result;
      if (modal.mode === "create") {
        result = await createProductAction({
          sku: form.sku.trim(),
          category: form.category.trim(),
          name: form.name.trim(),
          price,
        });
      } else if (modal.mode === "edit") {
        result = await updateProductAction(modal.product.sku, {
          category: form.category.trim(),
          name: form.name.trim(),
          price,
        });
      } else {
        return;
      }

      if (result.success) {
        toast.success(modal.mode === "create" ? "Producto creado" : "Cambios guardados");
        closeModal();
        router.refresh();
      } else {
        setFormError(result.error ?? "Error inesperado.");
      }
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteProductAction(deleteTarget.sku);
      if (result.success) {
        toast.success("Producto eliminado");
        setDeleteTarget(null);
        router.refresh();
      } else {
        setDeleteError(result.error ?? "Error inesperado.");
      }
    });
  }

  const isFormOpen = modal.mode !== "closed";
  const isEditing = modal.mode === "edit";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Productos</h1>
          <p className="text-sm text-[#64748B] mt-0.5">{products.length} productos en total</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          Nuevo producto
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Buscar por SKU, nombre o categoría…"
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="max-w-sm"
      />

      {/* Table */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">SKU</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Categoría</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Precio</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Oferta</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">
                    {search ? "Sin resultados para esa búsqueda." : "No hay productos cargados."}
                  </td>
                </tr>
              ) : (
                paginated.map((product) => (
                  <tr key={product.sku} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{product.sku}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{product.category}</td>
                    <td className="px-4 py-3 text-gray-900">{product.name}</td>
                    <td className="px-4 py-3 text-right text-gray-900 whitespace-nowrap font-medium">
                      ${product.price.toLocaleString("es-AR")}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {product.offer ? (
                        <span className="inline-flex flex-col items-center gap-0.5">
                          <span className="text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-full px-2 py-0.5">
                            Oferta
                          </span>
                          {product.discountPrice && (
                            <span className="text-xs text-orange-500">
                              ${product.discountPrice.toLocaleString("es-AR")}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-1.5 rounded-md bg-amber-100 text-amber-600 hover:bg-amber-200 hover:text-amber-700 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setDeleteError(null); setDeleteTarget(product); }}
                          className="p-1.5 rounded-md bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative z-10 bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                {isEditing ? "Editar producto" : "Nuevo producto"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="SKU" id="sku">
                <Input
                  id="sku"
                  value={form.sku}
                  onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                  disabled={isEditing}
                  placeholder="Ej: CABLE-USB-001"
                  className={isEditing ? "bg-gray-50 text-gray-500" : ""}
                />
              </Field>

              <Field label="Categoría" id="category">
                <Input
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="Ej: Cables"
                />
              </Field>

              <Field label="Nombre" id="name">
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Cable USB tipo C 2m"
                />
              </Field>

              <Field label="Precio ($)" id="price">
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="Ej: 1500"
                />
              </Field>

              {formError && (
                <p className="text-sm text-red-600">{formError}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={closeModal} disabled={isPending}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={isPending}>
                {isPending ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear producto"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative z-10 bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4">
            <h2 className="text-base font-semibold text-gray-900">¿Eliminar producto?</h2>
            <p className="text-sm text-gray-600">
              Se eliminará <strong>{deleteTarget.name}</strong> (SKU:{" "}
              {deleteTarget.sku}) de la hoja de cálculo. Esta acción no se puede deshacer.
            </p>

            {deleteError && (
              <p className="text-sm text-red-600">{deleteError}</p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isPending ? "Eliminando…" : "Sí, eliminar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
