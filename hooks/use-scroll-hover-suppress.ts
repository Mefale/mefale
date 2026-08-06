"use client";

import { useEffect, useRef } from "react";

// Con mouse, el cursor queda quieto mientras el contenido se mueve debajo al
// scrollear: cada card que pasa bajo el cursor dispara su propio :hover
// (shadow/border/transform), encadenando muchos repaints chicos y bajando el
// FPS percibido. Desactivar pointer-events (que corta :hover) mientras se
// scrollea evita ese churn; se reactiva un instante después de que para.
export function useScrollHoverSuppress<T extends HTMLElement>(
  scrollTarget: "self" | "window" = "window"
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const target: EventTarget = scrollTarget === "self" ? el : window;
    let timeout: ReturnType<typeof setTimeout>;

    function handleScroll() {
      el!.style.pointerEvents = "none";
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        el!.style.pointerEvents = "";
      }, 120);
    }

    target.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      target.removeEventListener("scroll", handleScroll);
      clearTimeout(timeout);
    };
  }, [scrollTarget]);

  return ref;
}
