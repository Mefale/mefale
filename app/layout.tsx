import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: {
    default: "Distribuidora Graser | Electrónica y Electricidad",
    template: "%s | Distribuidora Graser",
  },
  description:
    "Distribuidora de materiales electricos e iluminacion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased min-h-screen" style={{ backgroundColor: "#FFFFFF", color: "#111827" }}>
        {children}
      </body>
    </html>
  );
}
