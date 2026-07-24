import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getOrders } from "@/lib/sheets/orders";
import { buildOrderInvoicePdf } from "@/lib/pdf/order-invoice";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;

  const orders = await getOrders();
  // Pedidos legacy no tienen UUID: se referencian como "row-<numeroDeFila>"
  const order = orders.find((o) => (o.id ? o.id === id : `row-${o.rowNumber}` === id));

  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
  }

  const pdf = await buildOrderInvoicePdf(order);
  const orderNumber = String(Math.max(order.rowNumber - 1, 0)).padStart(4, "0");

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      // inline → se abre en el visor del navegador, no se descarga
      "Content-Disposition": `inline; filename="pedido-${orderNumber}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
