import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Distribuidora Graser | Materiales Electricos e Iluminacion",
    template: "%s | Distribuidora Graser",
  },
  description: "Distribuidora de materiales electricos e iluminacion.",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: "Distribuidora Graser | Materiales Electricos e Iluminacion",
    description: "Distribuidora de materiales electricos e iluminacion.",
  },
  icons: {
    icon: [
      { url: "/dgs-favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/dgs-favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/dgs-favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: "/dgs-favicon-180.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-scroll-behavior="smooth" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased min-h-screen" style={{ backgroundColor: "#FFFFFF", color: "#0F172A" }}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
