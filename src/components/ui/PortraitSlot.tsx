"use client";

import { useContent } from "@/lib/i18n";

/**
 * Hueco del retrato.
 *
 * Placeholder a propósito y no una silueta genérica: cuando llegue la foto real
 * entra aquí en duotono a negro puro y el encuadre no se mueve ni un pixel.
 * Sustituir por <Image /> con `grayscale contrast-125` y este mismo aspecto.
 *
 * Vive en `about` y no en el hero. Un retrato difuminado detrás del nombre es
 * el recurso más repetido del género, mete grises en la única pantalla que es
 * negro absoluto, y le pelea la atención al caret, que es el único suceso de
 * esa pantalla. Aquí aparece en la segunda pantalla —lo bastante pronto— y en
 * el sitio que le toca: al lado de quien lo escribe.
 */
export default function PortraitSlot() {
  const { UI } = useContent();

  return (
    <div className="relative aspect-3/4 w-full max-w-52 border border-white/12">
      <div className="star-dust twinkle absolute inset-0" />

      <div className="absolute inset-0 flex items-end p-3">
        <p className="font-mono text-[0.55rem] leading-relaxed tracking-[0.15em] text-ash-400 uppercase">
          {UI.portrait.line1}
          <br />
          {UI.portrait.line2}
        </p>
      </div>

      {/* Marcas de encuadre, como visor de cámara */}
      <span className="absolute top-2 left-2 h-2 w-2 border-t border-l border-white/40" />
      <span className="absolute right-2 bottom-2 h-2 w-2 border-r border-b border-white/40" />
    </div>
  );
}
