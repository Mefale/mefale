"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Zap, ShieldCheck, Truck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";

const brands = [
  { name: "Argenplas", logo: "/marcas/argenplas.png" },
  { name: "Jeluz",     logo: "/marcas/jeluz.png" },
  { name: "Kalop",     logo: "/marcas/kalop.png" },
  { name: "Re-Flex",   logo: "/marcas/re-flex.png" },
  { name: "Sica",      logo: "/marcas/sica.png" },
  { name: "Dayton",    logo: "/marcas/dayton.png" },
];

const features = [
  { icon: Zap, label: "Stock disponible" },
  { icon: ShieldCheck, label: "Productos certificados" },
  { icon: Truck, label: "Entrega en todo el país" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-[#F8FAFC]">
      {/* Fondo técnico */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-technical" />
        <div
          className="absolute -top-32 -left-32 w-[32rem] h-[32rem] rounded-full blur-[140px]"
          style={{ backgroundColor: "rgba(26, 86, 219, 0.08)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-[28rem] h-[28rem] rounded-full blur-[120px]"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.05)" }}
        />
        {/* Base degradado a blanco para fundir con el catálogo */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-white" />
      </div>

      <Container className="relative pt-28 pb-20">
        <div className="max-w-3xl">
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-[#E2E8F0] text-[#1A56DB] shadow-sm mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1A56DB] animate-pulse" />
              Distribuidora mayorista
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
            className="text-4xl sm:text-5xl lg:text-[3.75rem] font-extrabold text-[#0F172A] tracking-[-0.03em] leading-[1.05]"
          >
            Distribuidora de Materiales{" "}
            <span className="relative whitespace-nowrap text-[#1A56DB]">
              Eléctricos
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#1A56DB]/20 rounded-full" />
            </span>{" "}
            e Iluminación
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.14, ease: "easeOut" }}
            className="mt-6 text-lg text-[#475569] leading-relaxed max-w-xl"
          >
            Catálogo completo con precios de distribuidor. Calidad certificada
            para instaladores, técnicos y comercios.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            className="mt-9 flex flex-col sm:flex-row gap-3"
          >
            <Button
              asChild
              size="lg"
              className="bg-[#1A56DB] hover:bg-[#1447C0] text-white font-semibold gap-2 h-12 px-7 shadow-md shadow-[#1A56DB]/20"
            >
              <a href="#catalogo">
                Ver catálogo completo
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-[#CBD5E1] bg-white text-[#0F172A] hover:bg-[#F1F5F9] h-12 px-7 gap-2"
            >
              <Link
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5491100000000"}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-4 h-4" />
                Consultar por WhatsApp
              </Link>
            </Button>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.26, ease: "easeOut" }}
            className="mt-10 flex flex-wrap gap-x-6 gap-y-3"
          >
            {features.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-sm font-medium text-[#475569]"
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-md bg-white border border-[#E2E8F0] shadow-sm">
                  <Icon className="w-3.5 h-3.5 text-[#1A56DB]" />
                </span>
                {label}
              </div>
            ))}
          </motion.div>

          {/* Brand strip */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.32, ease: "easeOut" }}
            className="mt-12 pt-8 border-t border-[#E2E8F0]"
          >
            <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-[0.2em] mb-5">
              Marcas que distribuimos
            </p>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
              {brands.map((brand) => (
                <div
                  key={brand.name}
                  className="relative h-7 w-24"
                >
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    sizes="96px"
                    className="object-contain object-left"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
