"use client";

import { useEffect, useRef, useState } from "react";
import { useContent } from "@/lib/i18n";
import LanguageToggle from "./LanguageToggle";
import type { Level } from "@/components/scroll/ZoomStage";

/**
 * El menú de secciones. Cerrado por default, a propósito: una pestaña que
 * hay que abrir, no una barra siempre presente — eso sí le quitaría el
 * estilo a una página que por lo demás es un solo zoom continuo sin chrome
 * fijo más allá del HUD decorativo.
 *
 * Vive en el mismo lugar donde antes estaba `LanguageToggle` a secas, y lo
 * absorbe: abrir el menú es también donde se cambia el idioma, para no sumar
 * un segundo control flotante.
 *
 * Se monta desde `ZoomStage` en sus dos ramas (la del zoom y la de
 * `prefers-reduced-motion`), no desde `page.tsx`, porque necesita `active` —
 * el índice del nivel en foco— que solo existe ahí. Bajo reduced motion
 * `active` no aplica (no hay una noción continua de "nivel actual"), así que
 * esa rama lo pasa como `null` y el menú simplemente no resalta ninguno.
 */
export default function NavMenu({
  levels,
  active,
  onSelect,
}: {
  levels: Level[];
  active: number | null;
  onSelect: (index: number) => void;
}) {
  const { UI } = useContent();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const activeLevel = active !== null ? levels[active] : undefined;

  return (
    <nav
      ref={containerRef}
      aria-label={UI.navLabel}
      className="fixed top-5 right-5 z-50 sm:top-6 sm:right-6"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={UI.navToggle}
        className="flex items-center gap-1.5 font-mono text-[0.65rem] tracking-[0.18em] text-ash-200 uppercase transition-colors hover:text-white"
      >
        {activeLevel ? UI.levelLabels[activeLevel.key] : UI.navToggle}
        <svg
          viewBox="0 0 24 24"
          aria-hidden
          className={`h-2.5 w-2.5 shrink-0 transition-transform duration-200 ${open ? "-rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-3 w-48 max-w-[calc(100vw-2.5rem)] border border-white/12 bg-black p-3">
          <ul className="space-y-2">
            {levels.map((level, i) => (
              <li key={level.exp}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onSelect(i);
                  }}
                  className={`font-mono text-xs uppercase tracking-[0.08em] transition-colors ${
                    i === active ? "text-white" : "text-ash-400 hover:text-ash-100"
                  }`}
                >
                  {UI.levelLabels[level.key]}
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-3 border-t border-white/10 pt-3">
            <LanguageToggle />
          </div>
        </div>
      )}
    </nav>
  );
}
