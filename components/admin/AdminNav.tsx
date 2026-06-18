"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Upload, Tag, ClipboardList, Package } from "lucide-react";

const NAV = [
  { href: "/admin/orders", label: "Control de Pedidos", icon: ClipboardList },
  { href: "/admin/products", label: "Productos", icon: Package },
  { href: "/admin/import", label: "Importar productos", icon: Upload },
  { href: "/admin/offers", label: "Ofertas", icon: Tag },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              active
                ? "bg-[#EFF6FF] text-[#1A56DB] font-medium"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
