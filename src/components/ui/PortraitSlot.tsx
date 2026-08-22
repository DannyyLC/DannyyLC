import Image from "next/image";
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
 */
export default function PortraitSlot() {
  return (
    <div className="relative aspect-3/4 w-full max-w-52 border border-white/12">
      <Image
        src={portrait}
        alt={IDENTITY.name}
        fill
        sizes="13rem"
        className="object-cover grayscale contrast-125"
      />

      {/* Marcas de encuadre, como visor de cámara */}
      <span className="absolute top-2 left-2 h-2 w-2 border-t border-l border-white/40" />
      <span className="absolute right-2 bottom-2 h-2 w-2 border-r border-b border-white/40" />
    </div>
  );
}
