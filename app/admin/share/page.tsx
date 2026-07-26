import { getProducts } from "@/lib/sheets/products";
import ShareClient from "./ShareClient";

export const dynamic = "force-dynamic";

export default async function SharePage() {
  const products = await getProducts();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#0F172A]">Compartir productos</h1>
        <p className="text-sm text-[#64748B] mt-0.5">
          Elegí varios productos y enviáselos a un cliente por WhatsApp. Le llegan
          los links a cada ficha (con foto y precio).
        </p>
      </div>

      <ShareClient products={products} />
    </div>
  );
}
