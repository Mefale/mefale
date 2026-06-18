import { getProducts } from "@/lib/sheets/products";
import ProductsClient from "./ProductsClient";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getProducts();
  return <ProductsClient products={products} />;
}
