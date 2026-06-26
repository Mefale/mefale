"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { Upload, Tag, Menu, X, LogOut, ClipboardList, Package } from "lucide-react";

const NAV = [
  { href: "/admin/orders", label: "Control de Pedidos", icon: ClipboardList },
  { href: "/admin/products", label: "Productos", icon: Package },
  { href: "/admin/offers", label: "Ofertas", icon: Tag },
  { href: "/admin/import", label: "Importar productos", icon: Upload },
];

export default function AdminMobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-200 flex items-center justify-between px-4 h-14 shrink-0">
        <Link href="/">
          <Image
            src="/dgs-logo-blue-recolor.png"
            alt="Distribuidora Graser"
            width={160}
            height={64}
            className="h-[52px] w-auto object-contain"
            priority
          />
        </Link>

        <button
          onClick={() => setOpen((v) => !v)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Menú"
        >
          {open ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
        </button>
      </header>

      {/* Overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-down menu */}
      <div
        className={`md:hidden fixed top-14 left-0 right-0 z-30 bg-white border-b border-gray-200 shadow-lg transition-transform duration-200 ${
          open ? "translate-y-0" : "-translate-y-full pointer-events-none"
        }`}
      >
        <nav className="px-3 py-3 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
            >
              ← Volver al sitio
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
