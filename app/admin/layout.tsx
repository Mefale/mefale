import Link from "next/link";
import { Upload, Settings, Zap, Tag } from "lucide-react";
import SessionProviderWrapper from "@/components/admin/SessionProviderWrapper";
import AdminSignOut from "@/components/admin/AdminSignOut";

const NAV = [
  { href: "/admin/importar", label: "Importar productos", icon: Upload },
  { href: "/admin/ofertas", label: "Ofertas", icon: Tag },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProviderWrapper>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col">
          <div className="px-4 py-4 border-b border-gray-200">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0F172A] group-hover:bg-[#1A56DB] transition-colors duration-300 shrink-0">
                <Zap className="w-4 h-4 text-white" strokeWidth={2.5} fill="currentColor" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-extrabold text-[#0F172A] text-[13px] tracking-tight">
                  Distribuidora Graser
                </span>
                <span className="text-[10px] font-medium text-[#64748B] uppercase tracking-[0.16em] mt-0.5">
                  Admin
                </span>
              </div>
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
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex justify-end px-8 pt-5">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-white transition-colors"
            >
              ← Volver al sitio
            </Link>
          </div>
          <main className="flex-1 px-8 py-6">{children}</main>
        </div>
      </div>
    </SessionProviderWrapper>
  );
}
