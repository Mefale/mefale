"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ShoppingCart, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "./Container";
import { cn } from "@/lib/utils";
import { useCart, useCartHydrated } from "@/hooks/use-cart";

const navLinks = [
  { href: "/productos", label: "Catálogo" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { openDrawer, itemCount } = useCart();
  const hydrated = useCartHydrated();
  const count = hydrated ? itemCount() : 0;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/85 backdrop-blur-xl border-b border-[#E2E8F0] shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
          : "bg-white/60 backdrop-blur-sm border-b border-transparent"
      )}
    >
      {/* Hairline de acento superior */}
      <div className="h-0.5 w-full bg-gradient-to-r from-[#1A56DB] via-[#1A56DB]/40 to-transparent" />
      <Container>
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#0F172A] group-hover:bg-[#1A56DB] transition-colors duration-300 shadow-sm">
              <Zap className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
            </div>
            <span className="hidden sm:flex flex-col leading-none">
              <span className="font-bold text-[#0F172A] text-[15px] tracking-tight">
                Distribuidora Graser
              </span>
              <span className="text-[10px] font-medium text-[#64748B] uppercase tracking-[0.18em] mt-1">
                Materiales eléctricos
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={openDrawer}
              aria-label={`Carrito${count > 0 ? `, ${count} productos` : ""}`}
              className="relative p-2.5 rounded-lg text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#1A56DB] text-white text-[10px] font-bold px-1 tabular-nums ring-2 ring-white">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2.5 rounded-lg text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </Container>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="md:hidden border-t border-[#E2E8F0] bg-white/95 backdrop-blur-xl overflow-hidden"
          >
            <Container>
              <ul className="py-4 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 rounded-lg text-sm font-medium text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
