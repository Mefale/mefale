import { getProducts } from "@/lib/sheets/products";
import OffersClient from "./OffersClient";

export default async function OfertasPage() {
  const products = await getProducts();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#0F172A]">Gestionar ofertas</h1>
        <p className="text-sm text-[#64748B] mt-0.5">
          Buscá un producto, marcalo en oferta y establecé su precio de descuento.
        </p>
      </div>

      <OffersClient products={products} />
    </div>
  );
}
