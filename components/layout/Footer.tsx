import Link from "next/link";
import { Zap } from "lucide-react";
import { Container } from "./Container";

export function Footer() {
  return (
    <footer className="border-t border-[#D1D5DB]/60 bg-[#F8F9FA] mt-24">
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#1A56DB]/10 border border-[#1A56DB]/20">
                <Zap className="w-4 h-4 text-[#1A56DB]" />
              </div>
              <span className="font-semibold text-[#111827]">Distribuidora Graser</span>
            </div>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Distribuidor de materiales electricos e iluminacion. Calidad profesional para instaladores y técnicos.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-[#111827]">Catálogo</h3>
            <ul className="flex flex-col gap-2">
              {[
                { href: "/productos", label: "Todos los productos" },
                { href: "/categorias/iluminacion", label: "Iluminación" },
                { href: "/categorias/cables-y-conductores", label: "Cables" },
                { href: "/categorias/herramientas", label: "Herramientas" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-[#6B7280] hover:text-[#1A56DB] transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-[#111827]">Contacto</h3>
            <p className="text-sm text-[#6B7280]">
              Realizá tu consulta de precios y disponibilidad directamente por WhatsApp.
            </p>
            <Link
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5491100000000"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#1A56DB] hover:text-[#1447C0] transition-colors"
            >
              Consultar por WhatsApp →
            </Link>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#D1D5DB]/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#6B7280]">
            © {new Date().getFullYear()} Distribuidora Graser. Todos los derechos reservados.
          </p>
          <p className="text-xs text-[#6B7280]">
            Los precios son orientativos y se confirman por WhatsApp.
          </p>
        </div>
      </Container>
    </footer>
  );
}
