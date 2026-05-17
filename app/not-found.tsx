import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 text-center"
      style={{ backgroundColor: "#F8FAFC" }}
    >
      <div className="text-[7rem] sm:text-[9rem] font-extrabold leading-none tracking-tighter text-[#0F172A]/10">
        404
      </div>
      <div className="flex flex-col gap-2 -mt-4">
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
          Página no encontrada
        </h1>
        <p className="text-[#64748B]">
          La página que buscás no existe o fue movida.
        </p>
      </div>
      <Button asChild size="lg" className="bg-[#1A56DB] hover:bg-[#1447C0] text-white">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
