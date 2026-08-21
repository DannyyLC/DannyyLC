"use client";

import type { RefObject } from "react";
import type { Level } from "@/components/scroll/ZoomStage";

/**
 * El elemento firma: un lector de escala fijo en la esquina.
 *
 * Su trabajo no es decorar, es hacer que el zoom se **lea** como intencional.
 * Sin una referencia numérica, un zoom continuo se siente como una transición
 * bonita; con ella se siente como un descenso medido, y el visitante entiende
 * a los dos segundos que la página tiene una estructura y no solo un efecto.
 */
export default function ScaleHUD({
  levels,
  active,
  railRef,
}: {
  levels: Level[];
  active: number;
  railRef: RefObject<HTMLDivElement | null>;
}) {
  const current = levels[active] ?? levels[0];

  return (
    <div className="pointer-events-none fixed inset-y-0 left-0 z-50 hidden w-24 flex-col justify-center md:flex">
      {/* Riel: la posición absoluta dentro del sitio entero. */}
      <div className="absolute top-1/2 left-8 h-40 w-px -translate-y-1/2 bg-white/12">
        <div
          ref={railRef}
          className="absolute inset-x-0 top-0 h-full origin-top bg-white/70"
          style={{ transform: "scaleY(0)" }}
        />
      </div>

      {/* Marcas de nivel. La activa se ilumina. */}
      <ul className="absolute top-1/2 left-8 flex h-40 -translate-y-1/2 flex-col justify-between">
        {levels.map((level, i) => (
          <li key={level.exp} className="relative">
            <span
              className={`absolute top-1/2 left-0 block h-px -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
                i === active ? "w-2 bg-white" : "w-1 bg-white/30"
              }`}
            />
          </li>
        ))}
      </ul>

      {/* Lectura de escala. */}
      <div className="absolute top-1/2 left-14 -translate-y-1/2 font-mono">
        <p className="text-sm leading-none text-white tabular-nums">
          10<sup className="text-[0.65em]">{current.exp}</sup>
        </p>
        <p className="mt-2 text-[0.6rem] leading-none tracking-[0.18em] whitespace-nowrap text-ash-300 uppercase">
          {current.name}
        </p>
      </div>
    </div>
  );
}
