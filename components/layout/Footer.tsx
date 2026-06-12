import Link from "next/link";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { Container } from "./Container";

export function Footer() {
  return (
    <footer className="relative mt-24 bg-[#0F172A] text-[#94A3B8]">
      {/* Hairline de acento superior */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#1A56DB]/60 to-transparent" />

      <Container className="py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Image
              src="/dgs-logo-blue-recolor.png"
              alt="Distribuidora Graser"
              width={140}
              height={56}
              className="h-10 w-auto object-contain brightness-0 invert"
            />
            <p className="text-sm leading-relaxed max-w-xs">
              Distribuidor de materiales eléctricos e iluminación. Calidad
              profesional para instaladores y técnicos.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold text-white uppercase tracking-[0.14em]">
              Catálogo
            </h3>
            <ul className="flex flex-col gap-2.5">
              {[
                { href: "/products", label: "Todos los productos" },
                { href: null, label: "Iluminación" },
                { href: null, label: "Cables" },
                { href: null, label: "Herramientas" },
              ].map((l) =>
                l.href ? (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-[#94A3B8] hover:text-white transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ) : (
                  <li key={l.label}>
                    <span className="text-sm text-[#94A3B8] cursor-default select-none">
                      {l.label}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold text-white uppercase tracking-[0.14em]">
              Contacto
            </h3>
            <p className="text-sm leading-relaxed">
              Realizá tu consulta de precios y disponibilidad directamente por
              WhatsApp.
            </p>
            <Link
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5491100000000"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 self-start rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1A56DB] hover:border-[#1A56DB] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Consultar por WhatsApp
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#64748B]">
            © {new Date().getFullYear()} Distribuidora Graser. Todos los
            derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-xs text-[#64748B]">
              Los precios son orientativos y se confirman por WhatsApp.
            </p>
            <Link
              href="/admin"
              className="text-xs text-[#334155] hover:text-[#64748B] transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
