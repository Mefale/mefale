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
          ? "bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#D1D5DB]/60 shadow-lg shadow-black/20"
          : "bg-transparent"
      )}
    >
      <Container>
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-[#1A56DB]/10 border border-[#1A56DB]/20 group-hover:bg-[#1A56DB]/20 transition-colors">
              <Zap className="w-5 h-5 text-[#1A56DB]" />
            </div>
            <span className="font-semibold text-[#111827] hidden sm:block">
              Distribuidora Graser
            </span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="px-4 py-2 rounded-lg text-sm text-[#6B7280] hover:text-[#111827] hover:bg-[#F1F3F5] transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={openDrawer}
              aria-label={`Carrito${count > 0 ? `, ${count} productos` : ""}`}
              className="relative p-2.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F1F3F5] transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#1A56DB] text-[#FFFFFF] text-[10px] font-bold px-1 tabular-nums">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F1F3F5] transition-colors"
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
            className="md:hidden border-t border-[#D1D5DB]/60 bg-[#FFFFFF]/95 backdrop-blur-md overflow-hidden"
          >
            <Container>
              <ul className="py-4 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F1F3F5] transition-colors"
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
