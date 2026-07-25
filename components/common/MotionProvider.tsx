"use client";

import { LazyMotion, domAnimation } from "framer-motion";

/**
 * Carga diferida del motor de framer-motion.
 *
 * Con LazyMotion + el feature bundle `domAnimation` (animaciones, variantes,
 * exit/AnimatePresence), el núcleo pesado de framer-motion no entra en el
 * bundle inicial del cliente: se descarga de forma diferida. Los componentes
 * del storefront usan `m` (en vez de `motion`) para aprovecharlo.
 *
 * `strict` obliga a usar `m.*` en lugar de `motion.*` dentro de este árbol,
 * evitando que un import olvidado vuelva a arrastrar el bundle completo.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
