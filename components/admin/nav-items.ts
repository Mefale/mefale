import { Upload, Tag, ClipboardList, Package } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

/** Fuente única de los ítems del menú admin (sidebar desktop + menú mobile). */
export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin/orders", label: "Control de Pedidos", icon: ClipboardList },
  { href: "/admin/products", label: "Productos", icon: Package },
  { href: "/admin/offers", label: "Ofertas", icon: Tag },
  { href: "/admin/import", label: "Importar productos", icon: Upload },
];
