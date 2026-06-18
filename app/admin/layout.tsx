import Link from "next/link";
import Image from "next/image";
import { Upload, Settings, Tag, ClipboardList, Package } from "lucide-react";
import SessionProviderWrapper from "@/components/admin/SessionProviderWrapper";
import AdminSignOut from "@/components/admin/AdminSignOut";
import AdminMobileHeader from "@/components/admin/AdminMobileHeader";

const NAV = [
  { href: "/admin/orders", label: "Control de Pedidos", icon: ClipboardList },
  { href: "/admin/products", label: "Productos", icon: Package },
  { href: "/admin/import", label: "Importar productos", icon: Upload },
  { href: "/admin/offers", label: "Ofertas", icon: Tag },
  { href: "/admin/settings", label: "Configuración", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProviderWrapper>
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">

        {/* Mobile top bar */}
        <AdminMobileHeader />

        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-56 shrink-0 bg-white border-r border-gray-200 flex-col">
          <div className="px-4 py-4 border-b border-gray-200">
            <Link href="/" className="flex flex-col items-center gap-1 group">
              <Image
                src="/dgs-logo-blue-recolor.png"
                alt="Distribuidora Graser"
                width={180}
                height={72}
                className="h-20 w-auto object-contain"
                priority
              />
              <span className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-[0.18em]">
                Administración
              </span>
            </Link>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="px-5 py-4 border-t border-gray-200">
            <AdminSignOut />
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="hidden md:flex justify-end px-8 pt-5">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-white transition-colors"
            >
              ← Volver al sitio
            </Link>
          </div>
          <main className="flex-1 px-4 py-5 md:px-8 md:py-6">{children}</main>
        </div>

      </div>
    </SessionProviderWrapper>
  );
}
