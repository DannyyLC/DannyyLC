"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { subscribePointer } from "@/lib/pointer";
import { IDENTITY } from "@/lib/content";
import portrait from "@/assets/portrait.png";

/**
 * El retrato.
 *
 * Duotono a negro puro por CSS (`grayscale contrast-125`), no por archivo: el
 * original en `src/assets/portrait.png` queda a color, así que si algún día
 * cambia el tratamiento visual es un cambio de clase, no un reprocesado de
 * imagen.
 *
 * El fondo sí sale del archivo, no del componente: un recorte por color no
 * servía porque la camisa y el fondo original eran del mismo blanco, así que
 * `portrait.png` ya viene segmentado (fondo transparente) desde un modelo de
 * detección de persona corrido una sola vez sobre la foto. Con eso, y con la
 * imagen ya en el aspecto 3:4 del marco, no hace falta `object-position`.
 *
 * Importado como módulo y no servido desde `public/` a propósito: un
 * `<Image src="/portrait.png" />` necesitaría anteponerle `basePath` a mano
 * (`next.config.ts` lo deriva del nombre del repo en build), y ese cálculo no
 * vive en ningún otro componente de cliente. La importación estática deja que
 * el bundler resuelva la ruta con el prefijo correcto solo.
 *
 * Ese fondo transparente es lo que permite la profundidad: detrás de la figura
 * va una retícula fina, y las dos se mueven con el cursor a ritmos distintos y
 * en sentidos opuestos —la figura, que está cerca, más; la retícula, lejos,
 * menos—. Las dos sobresalen del marco lo mismo que se desplazan, para que al
 * moverse nunca enseñen un borde.
 */

/** Recorrido de cada plano, en px, con el cursor en el borde de la pantalla. */
const FIGURE_SHIFT = 7;
const GRID_SHIFT = 4;

export default function PortraitSlot() {
  const grid = useRef<HTMLDivElement>(null);
  const figure = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      subscribePointer((x, y) => {
        if (grid.current) {
          grid.current.style.transform = `translate3d(${(x * GRID_SHIFT).toFixed(2)}px, ${(y * GRID_SHIFT).toFixed(2)}px, 0)`;
        }
        if (figure.current) {
          figure.current.style.transform = `translate3d(${(-x * FIGURE_SHIFT).toFixed(2)}px, ${(-y * FIGURE_SHIFT).toFixed(2)}px, 0)`;
        }
      }),
    [],
  );

  return (
    <div className="relative aspect-3/4 w-full max-w-52 overflow-hidden border border-white/12">
      {/* Retícula de hairlines: líneas sueltas, no un relleno. */}
      <div
        ref={grid}
        aria-hidden="true"
        className="absolute -inset-2"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      <div ref={figure} className="absolute -inset-2">
        <Image
          src={portrait}
          alt={IDENTITY.name}
          fill
          sizes="14rem"
          className="object-cover grayscale contrast-125"
        />
      </div>

      {/* Marcas de encuadre, como visor de cámara */}
      <span className="absolute top-2 left-2 h-2 w-2 border-t border-l border-white/40" />
      <span className="absolute right-2 bottom-2 h-2 w-2 border-r border-b border-white/40" />
    </div>
  );
}
