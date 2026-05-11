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
          "border border-[#D1D5DB]/60 hover:border-[#1A56DB]/40",
          "h-44 sm:h-52",
          "transition-all duration-300 hover:shadow-lg hover:shadow-[#1A56DB]/5"
        )}
      >
        {/* BG image */}
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#FFFFFF]/90 via-[#FFFFFF]/40 to-transparent" />

        {/* Content */}
        <div className="relative p-4 flex items-end justify-between gap-2">
          <div>
            <h3 className="font-semibold text-[#111827] text-sm leading-tight">
              {category.name}
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-1">
              {category.description}
            </p>
          </div>
          <div className="shrink-0 p-2 rounded-full bg-[#1A56DB]/10 border border-[#1A56DB]/20 group-hover:bg-[#1A56DB]/20 transition-colors">
            <ArrowRight className="w-3.5 h-3.5 text-[#1A56DB]" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
