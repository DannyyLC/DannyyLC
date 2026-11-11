import type { LevelKey } from "@/lib/content";

/**
 * Saltar a un nivel del zoom desde cualquier componente.
 *
 * `ZoomStage` es quien sabe convertir "nivel + avance dentro de su estancia" en
 * una posición de scroll, y registra aquí cómo hacerlo. Los niveles no reciben
 * props del escenario más allá de `active`, así que esto es lo que deja que una
 * tarjeta de experiencia lleve a una tarjeta de proyectos. Mismo patrón que
 * `lib/lenis.ts`: una variable de módulo, sin reactividad, porque nadie
 * necesita re-renderizar cuando cambia.
 */
type Go = (key: LevelKey, local?: number) => void;

let go: Go | null = null;

export function setZoomNav(fn: Go | null): void {
  go = fn;
}

/**
 * Lleva el zoom al nivel `key`. `local` (0 a 1) es el avance dentro de su
 * estancia: en una pista horizontal, qué tarjeta queda centrada.
 */
export function zoomTo(key: LevelKey, local = 0): void {
  go?.(key, local);
}
