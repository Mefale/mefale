import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Fija la raíz del proyecto: evita que Turbopack la infiera mal cuando
    // hay otro package-lock.json en un directorio padre (p. ej. $HOME).
    root: path.resolve(__dirname),
  },
  experimental: {
    // Tree-shaking más agresivo de barrels grandes → menos JS en el cliente.
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  images: {
    // Las imágenes de Cloudinary rara vez cambian: cachear 30 días evita
    // re-optimizarlas cada hora.
    minimumCacheTTL: 2592000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
