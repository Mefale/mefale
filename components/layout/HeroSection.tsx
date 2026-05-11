"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Zap, ShieldCheck, Truck } from "lucide-react";
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
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Ambient glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px]" style={{ backgroundColor: "rgba(26, 86, 219, 0.06)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-[100px]" style={{ backgroundColor: "rgba(26, 86, 219, 0.04)" }} />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#1A56DB 1px, transparent 1px), linear-gradient(90deg, #1A56DB 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <Container className="relative pt-24 pb-16">
        <div className="max-w-3xl">
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#1A56DB]/10 border border-[#1A56DB]/20 text-[#1A56DB] mb-6">
              <Zap className="w-3 h-3" />
              Distribuidora mayorista
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#111827] tracking-tight leading-[1.1]"
          >
            Distribuidora de Materiales{" "}
            <span className="text-[#1A56DB]">Eléctricos</span>{" "}
            e Iluminación
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.14, ease: "easeOut" }}
            className="mt-6 text-lg text-[#6B7280] leading-relaxed max-w-2xl"
          >
            Calidad profesional para instaladores y técnicos.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            className="mt-8 flex flex-col sm:flex-row gap-3"
          >
            <Button
              asChild
              size="lg"
              className="bg-[#1A56DB] hover:bg-[#1447C0] text-[#FFFFFF] font-semibold gap-2 h-12 px-6"
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
              className="border-[#D1D5DB]/60 text-[#6B7280] hover:text-[#111827] hover:bg-[#F1F3F5] h-12 px-6"
            >
              <Link
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5491100000000"}`}
                target="_blank"
              >
                Consultar por WhatsApp
              </Link>
            </Button>
          </motion.div>

          {/* Brand logos */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.26, ease: "easeOut" }}
            className="mt-10"
          >
            <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-widest mb-4">
              Marcas que distribuimos
            </p>
            <div className="flex flex-wrap items-center gap-6">
              {brands.map((brand) => (
                <div
                  key={brand.name}
                  className="relative h-8 w-24"
                >
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    sizes="96px"
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
            className="mt-10 flex flex-wrap gap-4"
          >
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-[#6B7280]">
                <div className="p-1 rounded-md bg-[#F1F3F5] border border-[#D1D5DB]/60">
                  <Icon className="w-3.5 h-3.5 text-[#1A56DB]" />
                </div>
                {label}
              </div>
            ))}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
