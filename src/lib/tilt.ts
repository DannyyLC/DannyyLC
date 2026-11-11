"use client";

import { useEffect, type RefObject } from "react";
import { prefersReducedMotion } from "@/lib/gsap";

/** Inclinación máxima, en grados, con el cursor en el borde de la tarjeta. */
const MAX_DEG = 5;

/**
 * Inclina hacia el cursor las tarjetas marcadas con `data-tilt` dentro de
 * `container`, y mueve el brillo que llevan debajo.
 *
 * Un solo listener delegado en el contenedor, no uno por tarjeta. El resultado
 * viaja como custom properties (`--rx`, `--ry`, `--mx`, `--my`) sobre la
 * tarjeta, que es la misma vía que usa `--local`: cambia en cada movimiento del
 * cursor y como estado de React sería un render por evento. La transform y el
 * brillo los resuelve la clase `.tilt` en `globals.css`.
 */
export function useTilt(container: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = container.current;
    if (!root) return;
    if (prefersReducedMotion()) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let current: HTMLElement | null = null;

    const release = () => {
      if (!current) return;
      current.style.setProperty("--rx", "0");
      current.style.setProperty("--ry", "0");
      current.removeAttribute("data-tilting");
      current = null;
    };

    const onMove = (e: PointerEvent) => {
      const card = (e.target as Element).closest<HTMLElement>("[data-tilt]");
      if (card !== current) release();
      if (!card) return;
      current = card;

      const r = card.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top) / r.height;

      card.setAttribute("data-tilting", "");
      card.style.setProperty("--mx", `${(nx * 100).toFixed(1)}%`);
      card.style.setProperty("--my", `${(ny * 100).toFixed(1)}%`);
      // La tarjeta se hunde donde está el cursor: el borde bajo él se aleja.
      card.style.setProperty("--ry", ((nx - 0.5) * 2 * MAX_DEG).toFixed(2));
      card.style.setProperty("--rx", ((0.5 - ny) * 2 * MAX_DEG).toFixed(2));
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", release);
    return () => {
      release();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", release);
    };
  }, [container]);
}
