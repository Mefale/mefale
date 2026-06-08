import { getProducts } from "@/lib/sheets/products";
import OffersClient from "./OffersClient";

export default async function OfertasPage() {
  const products = await getProducts();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">
        Gestionar ofertas
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        Buscá un producto, marcalo en oferta y establecé su precio de descuento.
        Los cambios se guardan directamente en el catálogo.
      </p>

      <OffersClient products={products} />
    </div>
  );
}
