import { getOrders } from "@/lib/sheets/orders";
import { getProducts } from "@/lib/sheets/products";
import OrdersClient from "./OrdersClient";

export const dynamic = "force-dynamic";

export default async function ControlPedidosPage() {
  const [orders, products] = await Promise.all([getOrders(), getProducts()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#1A56DB] animate-pulse" />
          <h1 className="text-xl font-bold text-[#0F172A]">Control de Pedidos</h1>
        </div>
        <p className="text-sm text-[#64748B] mt-0.5">
          Pedidos recibidos por WhatsApp
        </p>
      </div>
      <OrdersClient initialOrders={orders} products={products} />
    </div>
  );
}
