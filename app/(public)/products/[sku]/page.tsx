import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Zap } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { getProductBySku } from "@/lib/sheets/products";
import { formatPrice } from "@/utils/format-price";
import { discountPercent } from "@/utils/discount-percent";
import { productUrl, productPath, SITE_NAME } from "@/lib/site";

type Props = {
  params: Promise<{ sku: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sku } = await params;
  const product = await getProductBySku(decodeURIComponent(sku));

  if (!product) {
    return { title: "Producto no encontrado" };
  }

  const price = formatPrice(product.discountPrice ?? product.price);
  const description =
    product.description ||
    `${product.name}${product.brand ? ` — ${product.brand}` : ""}. Precio: ${price}. Consultá por WhatsApp en ${SITE_NAME}.`;
  const path = productPath(product.sku);
  const image = product.images.find(Boolean);

  return {
    title: product.name,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: path,
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { sku } = await params;
  const product = await getProductBySku(decodeURIComponent(sku));

  if (!product) notFound();

  const pct = discountPercent(product);
  const image = product.images.find(Boolean);
  const effectivePrice = product.discountPrice ?? product.price;

  // Datos estructurados para Google (rich snippets de precio/disponibilidad).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    ...(image ? { image: [image] } : {}),
    description: product.description || product.name,
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "ARS",
      price: effectivePrice.toFixed(2),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: productUrl(product.sku),
    },
  };

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Container>
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-[#64748B]">
          <Link href="/" className="hover:text-[#1A56DB] transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#1A56DB] transition-colors">Catálogo</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/products?category=${encodeURIComponent(product.category)}`}
                className="hover:text-[#1A56DB] transition-colors"
              >
                {product.category}
              </Link>
            </>
          )}
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Imagen */}
          <div className="relative aspect-square md:aspect-[4/3] rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] overflow-hidden">
            {image ? (
              <Image
                src={image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-8 mix-blend-multiply"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[#94A3B8]">
                Sin imagen
              </div>
            )}
            {product.offer && (
              <span className="absolute top-4 left-4 flex items-center gap-1 rounded-md bg-[#DC2626] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider leading-none text-white shadow-sm">
                <Zap className="h-3 w-3" strokeWidth={2.5} fill="currentColor" />
                {pct ? `-${pct}%` : "Oferta"}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="text-[11px] text-[#64748B] font-mono uppercase tracking-wider bg-[#F1F5F9] rounded px-2 py-0.5">
                {product.sku}
              </span>
              {product.brand && (
                <span className="text-[11px] font-semibold text-[#1A56DB] uppercase tracking-wider">
                  {product.brand}
                </span>
              )}
              {product.category && (
                <span className="text-[11px] font-medium text-[#64748B] uppercase tracking-wide border border-[#E2E8F0] rounded-full px-2.5 py-0.5">
                  {product.category}
                </span>
              )}
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
              {product.name}
            </h1>

            {product.description && (
              <p className="mt-4 text-sm text-[#475569] leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Precio */}
            <div className="mt-6 pt-6 border-t border-[#F1F5F9]">
              {product.discountPrice ? (
                <div className="flex flex-col gap-1">
                  <span className="text-base text-[#94A3B8] line-through tabular-nums">
                    {formatPrice(product.price)}
                  </span>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl font-extrabold text-[#0F172A] tabular-nums">
                      {formatPrice(product.discountPrice)}
                    </span>
                    {pct && (
                      <span className="text-sm font-bold text-[#16A34A]">
                        {pct}% OFF
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <span className="text-3xl font-extrabold text-[#0F172A] tabular-nums">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            <div className="mt-6 max-w-xs">
              <AddToCartButton product={product} />
            </div>

            <p className="mt-4 text-xs text-[#94A3B8]">
              El precio final lo confirma el vendedor por WhatsApp.
            </p>

            <Link
              href="/products"
              className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-[#64748B] hover:text-[#1A56DB] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al catálogo
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
