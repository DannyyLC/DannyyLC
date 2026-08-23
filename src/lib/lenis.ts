import type Lenis from "lenis";

/**
 * La instancia de Lenis, expuesta fuera de `SmoothScrollProvider`.
 *
 * No es reactiva a propósito —nada necesita re-renderizar cuando cambia—,
 * así que no es un store al estilo `i18n.ts`, solo un getter/setter sobre una
 * variable de módulo. `NavMenu` la necesita para animar el scroll hacia un
 * nivel; bajo `prefers-reduced-motion` nunca se llama a `setLenis` y
 * `getLenis()` devuelve `null`, que es la señal de "no hay scroll animado,
 * usa el fallback".
 */
let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null): void {
  instance = lenis;
}

export function getLenis(): Lenis | null {
  return instance;
}
