"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, Lock, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email o contraseña incorrectos.");
    } else {
      router.push("/admin/import");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      {/* Hairline superior */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1A56DB] via-[#1A56DB]/40 to-transparent" />

      {/* Volver al sitio */}
      <Link
        href="/"
        className="fixed top-4 left-4 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Volver al sitio
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#0F172A] shadow-sm mb-4">
            <Zap className="w-6 h-6 text-white" strokeWidth={2.5} fill="currentColor" />
          </div>
          <h1 className="text-gray-900 font-bold text-xl tracking-tight">
            Distribuidora Graser
          </h1>
          <p className="text-gray-500 text-sm mt-1">Panel de administración</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Lock className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-400">Acceso privado</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1A56DB] focus:ring-1 focus:ring-[#1A56DB]/20 transition-colors"
                placeholder="admin@graser.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                Contraseña
              </label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1A56DB] focus:ring-1 focus:ring-[#1A56DB]/20 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 bg-[#1A56DB] hover:bg-[#1A56DB]/90 disabled:opacity-50 text-white font-medium text-sm rounded-lg px-4 py-2.5 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? "Verificando…" : "Ingresar"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Solo para uso interno de Distribuidora Graser
        </p>
      </motion.div>
    </div>
  );
}
