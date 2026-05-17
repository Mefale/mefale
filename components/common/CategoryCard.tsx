"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";

type Props = {
  category: Category;
  index?: number;
};

export function CategoryCard({ category, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: "easeOut" }}
    >
      <Link
        href={`/categorias/${category.slug}`}
        className={cn(
          "group relative flex flex-col justify-end rounded-xl overflow-hidden",
          "border border-[#E2E8F0] hover:border-[#1A56DB]/40",
          "h-44 sm:h-52",
          "transition-all duration-300 shadow-sm hover:shadow-[0_10px_24px_rgba(15,23,42,0.10)]"
        )}
      >
        {/* BG image */}
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-[1.05] transition-transform duration-500"
        />
        {/* Gradient overlay grafito */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/85 via-[#0F172A]/35 to-transparent" />

        {/* Content */}
        <div className="relative p-4 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-bold text-white text-sm leading-tight">
              {category.name}
            </h3>
            <p className="text-xs text-white/70 mt-0.5 line-clamp-1">
              {category.description}
            </p>
          </div>
          <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-white/15 border border-white/20 backdrop-blur-sm group-hover:bg-[#1A56DB] group-hover:border-[#1A56DB] transition-colors">
            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
