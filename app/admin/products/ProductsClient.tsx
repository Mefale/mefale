"use client";

import { useState, useMemo, useTransition, useRef, useEffect } from "react";
import type { Product } from "@/types/product";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
  bulkAdjustPriceAction,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, ChevronLeft, ChevronRight, ChevronDown, Check, Search, X, ImageIcon, ImageOff, Percent } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatPrice } from "@/utils/format-price";

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
  imageUrl: string;
  brand: string;
};

const EMPTY_FORM: FormData = { sku: "", category: "", name: "", price: "", imageUrl: "", brand: "" };

function formFromProduct(p: Product): FormData {
  return {
    sku: p.sku,
    category: p.category,
    name: p.name,
    price: String(p.price),
    imageUrl: p.images[0] ?? "",
    brand: p.brand,
  };
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

function CategorySelect({
  id,
  value,
  categories,
  onChange,
}: {
  id: string;
  value: string;
  categories: string[];
  onChange: (category: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? categories.filter((c) => c.toLowerCase().includes(query.toLowerCase().trim()))
    : categories;

  const trimmedQuery = query.trim();
  const exactMatch = categories.some(
    (c) => c.toLowerCase() === trimmedQuery.toLowerCase()
  );

  function select(category: string) {
    onChange(category);
    setOpen(false);
    setQuery("");
  }

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-2 border rounded-md px-3 py-2 text-sm text-left transition-colors ${
          open
            ? "border-[#1A56DB] ring-2 ring-[#1A56DB]/20"
            : "border-gray-200 hover:border-gray-300"
        } ${value ? "text-gray-900" : "text-gray-400"}`}
      >
        <span className="truncate">{value || "Seleccionar categoría…"}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-full z-20 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar o crear categoría…"
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
            />
          </div>

          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.map((cat) => (
              <li key={cat}>
                <button
                  type="button"
                  onClick={() => select(cat)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-gray-50 ${
                    value === cat ? "text-[#1A56DB] font-medium" : "text-gray-700"
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 shrink-0 ${value === cat ? "opacity-100" : "opacity-0"}`} />
                  {cat}
                </button>
              </li>
            ))}

            {filtered.length === 0 && !trimmedQuery && (
              <li className="px-3 py-3 text-sm text-gray-400 text-center">
                No hay categorías cargadas
              </li>
            )}

            {trimmedQuery && !exactMatch && (
              <li className="border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => select(trimmedQuery)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-[#1A56DB] hover:bg-[#EFF4FE] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  Crear categoría &ldquo;{trimmedQuery}&rdquo;
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function BrandSelect({
  id,
  value,
  brands,
  onChange,
}: {
  id: string;
  value: string;
  brands: string[];
  onChange: (brand: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? brands.filter((b) => b.toLowerCase().includes(query.toLowerCase().trim()))
    : brands;

  const trimmedQuery = query.trim();
  const exactMatch = brands.some(
    (b) => b.toLowerCase() === trimmedQuery.toLowerCase()
  );

  function select(brand: string) {
    onChange(brand);
    setOpen(false);
    setQuery("");
  }

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-2 border rounded-md px-3 py-2 text-sm text-left transition-colors ${
          open
            ? "border-[#1A56DB] ring-2 ring-[#1A56DB]/20"
            : "border-gray-200 hover:border-gray-300"
        } ${value ? "text-gray-900" : "text-gray-400"}`}
      >
        <span className="truncate">{value || "Sin marca (opcional)"}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-full z-20 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar o crear marca…"
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
            />
          </div>

          <ul className="max-h-52 overflow-y-auto py-1">
            {!trimmedQuery && (
              <li>
                <button
                  type="button"
                  onClick={() => select("")}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-gray-50 ${
                    !value ? "text-[#1A56DB] font-medium" : "text-gray-700"
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 shrink-0 ${!value ? "opacity-100" : "opacity-0"}`} />
                  Sin marca
                </button>
              </li>
            )}

            {filtered.map((brand) => (
              <li key={brand}>
                <button
                  type="button"
                  onClick={() => select(brand)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-gray-50 ${
                    value === brand ? "text-[#1A56DB] font-medium" : "text-gray-700"
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 shrink-0 ${value === brand ? "opacity-100" : "opacity-0"}`} />
                  {brand}
                </button>
              </li>
            ))}

            {filtered.length === 0 && !trimmedQuery && (
              <li className="px-3 py-3 text-sm text-gray-400 text-center">
                No hay marcas cargadas
              </li>
            )}

            {trimmedQuery && !exactMatch && (
              <li className="border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => select(trimmedQuery)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-[#1A56DB] hover:bg-[#EFF4FE] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  Crear marca &ldquo;{trimmedQuery}&rdquo;
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
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

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkBrand, setBulkBrand] = useState("");
  const [bulkPercent, setBulkPercent] = useState("");
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkConfirming, setBulkConfirming] = useState(false);

  const categories = useMemo(
    () =>
      Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort(
        (a, b) => a.localeCompare(b, "es")
      ),
    [products]
  );

  const brands = useMemo(
    () =>
      Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).sort(
        (a, b) => a.localeCompare(b, "es")
      ),
    [products]
  );

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

  // Vista previa del ajuste masivo: se calcula en el cliente (ya tenemos
  // `products` completo acá), sin pegarle al servidor hasta confirmar.
  const bulkPercentNum = parseFloat(bulkPercent);
  const bulkAffected = useMemo(
    () => (bulkBrand ? products.filter((p) => p.brand === bulkBrand) : []),
    [products, bulkBrand]
  );
  const bulkPreviewValid = !!bulkBrand && !isNaN(bulkPercentNum) && bulkPercentNum !== 0;
  const bulkFactor = 1 + (isNaN(bulkPercentNum) ? 0 : bulkPercentNum) / 100;

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

  function openBulk() {
    setBulkBrand("");
    setBulkPercent("");
    setBulkError(null);
    setBulkConfirming(false);
    setBulkOpen(true);
  }

  function closeBulk() {
    setBulkOpen(false);
  }

  function handleBulkApply() {
    if (!bulkPreviewValid) return;
    setBulkError(null);
    startTransition(async () => {
      const result = await bulkAdjustPriceAction(bulkBrand, bulkPercentNum);
      if (result.success) {
        toast.success(
          `Precios actualizados`,
          { description: `${result.updated ?? bulkAffected.length} productos de ${bulkBrand}` }
        );
        setBulkOpen(false);
        router.refresh();
      } else {
        setBulkError(result.error ?? "Error inesperado.");
        setBulkConfirming(false);
      }
    });
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
          imageUrl: form.imageUrl.trim(),
          brand: form.brand.trim(),
        });
      } else if (modal.mode === "edit") {
        result = await updateProductAction(modal.product.sku, {
          category: form.category.trim(),
          name: form.name.trim(),
          price,
          imageUrl: form.imageUrl.trim(),
          brand: form.brand.trim(),
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
        <div className="flex items-center gap-2">
          <Button onClick={openBulk} size="sm" variant="outline" className="gap-1.5">
            <Percent className="w-4 h-4" />
            Ajustar precios por marca
          </Button>
          <Button onClick={openCreate} size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            Nuevo producto
          </Button>
        </div>
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
                <th className="text-center px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Foto</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Categoría</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Marca</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Precio</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Oferta</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-sm">
                    {search ? "Sin resultados para esa búsqueda." : "No hay productos cargados."}
                  </td>
                </tr>
              ) : (
                paginated.map((product) => (
                  <tr key={product.sku} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{product.sku}</td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {product.images.length > 0 ? (
                        <span title="Con foto">
                          <ImageIcon className="w-4 h-4 text-emerald-600 inline-block" />
                        </span>
                      ) : (
                        <span title="Sin foto">
                          <ImageOff className="w-4 h-4 text-gray-300 inline-block" />
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{product.category}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {product.brand || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{product.name}</td>
                    <td className="px-4 py-3 text-right text-gray-900 whitespace-nowrap font-medium">
                      ${product.price.toLocaleString("es-AR")}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {product.offer ? (
                        <span className="inline-flex flex-col items-center gap-0.5">
                          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                            Oferta
                          </span>
                          {product.discountPrice && (
                            <span className="text-xs text-emerald-600">
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
                          className="p-1.5 rounded-md bg-[#EFF4FE] text-[#1A56DB] hover:bg-[#DBE7FD] hover:text-[#1447C0] transition-colors"
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
                <CategorySelect
                  id="category"
                  value={form.category}
                  categories={categories}
                  onChange={(category) => setForm((f) => ({ ...f, category }))}
                />
              </Field>

              <Field label="Marca" id="brand">
                <BrandSelect
                  id="brand"
                  value={form.brand}
                  brands={brands}
                  onChange={(brand) => setForm((f) => ({ ...f, brand }))}
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

              <Field label="Imagen (URL)" id="imageUrl">
                <Input
                  id="imageUrl"
                  value={form.imageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="Pegar link de imagen (ej: Google Imágenes)"
                />
                {form.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- preview cliente antes de subir a Cloudinary, no un asset final
                  <img
                    src={form.imageUrl}
                    alt=""
                    className="mt-2 h-20 w-20 object-cover rounded-md border border-gray-200"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
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

      {/* Bulk price adjust Modal */}
      {bulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeBulk} />
          <div className="relative z-10 bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Ajustar precios por marca</h2>
              <button
                onClick={closeBulk}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Marca" id="bulk-brand">
                <BrandSelect
                  id="bulk-brand"
                  value={bulkBrand}
                  brands={brands}
                  onChange={(brand) => {
                    setBulkBrand(brand);
                    setBulkConfirming(false);
                  }}
                />
              </Field>

              <Field label="Ajuste (%)" id="bulk-percent">
                <Input
                  id="bulk-percent"
                  type="number"
                  step="0.1"
                  value={bulkPercent}
                  onChange={(e) => {
                    setBulkPercent(e.target.value);
                    setBulkConfirming(false);
                  }}
                  placeholder="Ej: 5 (sube 5%) o -10 (baja 10%)"
                />
              </Field>

              {bulkError && (
                <p className="text-sm text-red-600">{bulkError}</p>
              )}

              {bulkBrand && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
                  <p className="text-sm text-gray-700">
                    <strong>{bulkAffected.length}</strong>{" "}
                    {bulkAffected.length === 1 ? "producto" : "productos"} de{" "}
                    <strong>{bulkBrand}</strong>
                  </p>

                  {bulkPreviewValid && bulkAffected.length > 0 && (
                    <>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {bulkAffected.slice(0, 5).map((p) => (
                          <div key={p.sku} className="flex items-center justify-between gap-2 text-xs">
                            <span className="truncate text-gray-600">{p.name}</span>
                            <span className="shrink-0 font-medium text-gray-900 whitespace-nowrap">
                              {formatPrice(p.price)} → {formatPrice(Math.round(p.price * bulkFactor * 100) / 100)}
                            </span>
                          </div>
                        ))}
                      </div>
                      {bulkAffected.length > 5 && (
                        <p className="text-xs text-gray-400">… y {bulkAffected.length - 5} más.</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Los productos en oferta también ajustan su precio de descuento en la misma proporción.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              {bulkConfirming ? (
                <>
                  <span className="text-sm text-red-600 flex items-center mr-auto">
                    ¿Confirmás? No se puede deshacer.
                  </span>
                  <Button variant="outline" onClick={() => setBulkConfirming(false)} disabled={isPending}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleBulkApply}
                    disabled={isPending}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isPending ? "Aplicando…" : "Sí, aplicar"}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={closeBulk} disabled={isPending}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => setBulkConfirming(true)}
                    disabled={!bulkPreviewValid || bulkAffected.length === 0 || isPending}
                  >
                    Vista previa: aplicar cambios
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
