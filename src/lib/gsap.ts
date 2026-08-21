"use client";

// Punto único de registro de plugins de GSAP.
// Importar siempre desde aquí para evitar registros duplicados entre componentes.

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

  // El escenario del zoom mide 1000vh; en móvil la barra de direcciones que
  // aparece y desaparece dispara un resize por cada gesto y recalcularía el
  // sticky a mitad del scroll.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/** `true` si el usuario pidió menos movimiento. Seguro en SSR. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
