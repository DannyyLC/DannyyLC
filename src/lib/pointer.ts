"use client";

import { gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * La posición del cursor, suavizada y compartida.
 *
 * Varios efectos reaccionan al cursor —el paralaje del zoom, el retrato, la
 * marca de Fractal— y todos necesitan lo mismo: la posición normalizada a
 * [-1, 1] desde el centro de la pantalla, interpolada para que no tiemble. Un
 * solo listener y un solo tick la calculan una vez por frame; cada suscriptor
 * escribe su propia transform.
 *
 * No viaja como custom property en un ancestro común a propósito: una variable
 * heredada que cambia en cada frame recalcula el estilo de todo el subárbol,
 * que aquí son los siete niveles completos. Un callback toca solo lo que mueve.
 */
type Listener = (x: number, y: number) => void;

const listeners = new Set<Listener>();

/** Destino (cursor real) y valor suavizado. */
let tx = 0;
let ty = 0;
let x = 0;
let y = 0;
let running = false;

/** Fracción del camino que se recorre por frame a 60 fps. */
const EASE = 0.09;

const onMove = (e: PointerEvent) => {
  if (e.pointerType !== "mouse") return;
  tx = (e.clientX / window.innerWidth) * 2 - 1;
  ty = (e.clientY / window.innerHeight) * 2 - 1;
};

const tick = () => {
  const dx = tx - x;
  const dy = ty - y;
  // En reposo no se llama a nadie: sin esto cada suscriptor reescribiría su
  // transform sesenta veces por segundo con el mismo valor.
  if (Math.abs(dx) < 0.0005 && Math.abs(dy) < 0.0005) return;

  // Corregido por el tiempo real del frame, para que a 120 Hz no vaya al doble.
  const k = 1 - (1 - EASE) ** gsap.ticker.deltaRatio(60);
  x += dx * k;
  y += dy * k;

  for (const fn of listeners) fn(x, y);
};

/**
 * Suscribe `fn` a la posición suavizada. Devuelve la función para darse de baja.
 *
 * Sin cursor fino (táctil) o bajo `prefers-reduced-motion` no hace nada: el
 * suscriptor se queda con su estado de reposo, que es el que sirve el marcado.
 */
export function subscribePointer(fn: Listener): () => void {
  if (
    typeof window === "undefined" ||
    prefersReducedMotion() ||
    !window.matchMedia("(hover: hover) and (pointer: fine)").matches
  ) {
    return () => {};
  }

  listeners.add(fn);
  if (!running) {
    window.addEventListener("pointermove", onMove, { passive: true });
    gsap.ticker.add(tick);
    running = true;
  }

  // Quien llega tarde arranca en la posición actual, no en el centro.
  fn(x, y);

  return () => {
    listeners.delete(fn);
    if (listeners.size === 0 && running) {
      window.removeEventListener("pointermove", onMove);
      gsap.ticker.remove(tick);
      running = false;
    }
  };
}
