import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 text-center" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="text-8xl font-bold" style={{ color: "rgba(161,161,170,0.2)" }}>404</div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[#111827]">Página no encontrada</h1>
        <p className="text-[#6B7280]">La página que buscás no existe o fue movida.</p>
      </div>
      <Button asChild className="bg-[#1A56DB] hover:bg-[#1447C0] text-[#FFFFFF]">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
