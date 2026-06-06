"use client";

import { signOut } from "next-auth/react";

export default function AdminSignOut() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="text-xs text-gray-400 hover:text-gray-700 transition-colors w-full text-left"
    >
      Cerrar sesión
    </button>
  );
}
