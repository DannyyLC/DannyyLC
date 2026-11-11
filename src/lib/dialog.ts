"use client";

import { useEffect, useRef, type RefObject } from "react";
import { getLenis } from "@/lib/lenis";

/**
 * Lo que comparten las dos vistas detalladas (`ProjectPanel`, `RolePanel`)
 * mientras están abiertas:
 *
 * - el scroll de la página se detiene, así que el zoom se queda donde estaba;
 * - el foco entra al panel, Tab da la vuelta dentro de él y Escape lo cierra;
 * - al cerrar, el foco vuelve a quien lo abrió.
 *
 * `initialFocus` es lo que recibe el foco al abrir: el botón de cerrar.
 */
export function useDialog(
  panel: RefObject<HTMLElement | null>,
  initialFocus: RefObject<HTMLElement | null>,
  close: () => void,
) {
  // `close` suele ser una función nueva en cada render de quien abre el
  // panel. Se guarda en un ref para que el efecto de abajo corra una sola vez:
  // si dependiera de ella, cada render soltaría y volvería a detener el scroll
  // y movería el foco a media vida del diálogo.
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const lenis = getLenis();
    lenis?.stop();
    initialFocus.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = panel.current?.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])",
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;

      if (e.shiftKey && current === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      lenis?.start();
      opener?.focus({ preventScroll: true });
    };
  }, [panel, initialFocus]);
}
