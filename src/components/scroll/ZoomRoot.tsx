"use client";

import ZoomStage, { type Level } from "./ZoomStage";

import L0Cursor from "@/components/levels/L0Cursor";
import L1Line from "@/components/levels/L1Line";
import L2Skills from "@/components/levels/L2Skills";
import L3Projects from "@/components/levels/L3Projects";
import L4Experience from "@/components/levels/L4Experience";
import L5Company from "@/components/levels/L5Company";
import L6Territory from "@/components/levels/L6Territory";
import L7Contact from "@/components/levels/L7Contact";

/**
 * Los ocho niveles del zoom, del más pequeño al más grande.
 *
 * El orden es la historia: un caret → una línea → un stack → lo que construyó →
 * para quién lo hizo → la compañía que dirige → el lugar donde ocurre → un
 * punto. Reordenarlos rompe la premisa, porque cada nivel tiene que ser
 * plausiblemente el contexto del anterior.
 *
 * Antes eran diez. La arquitectura interna de Tesseract tenía nivel propio —y
 * es privada, no va en una página pública—, además de que el producto volvía a
 * salir un nivel después; y la investigación de la UAA también tenía el suyo,
 * cuando es un empleo y su resultado pertenece a la fila de ese empleo. Cuatro
 * niveles se volvieron dos: uno responde "qué construiste" y el otro "quién te
 * contrató y cuándo".
 *
 * El registro vive en un módulo de cliente y no en `page.tsx` porque una
 * referencia a componente es una función, y las funciones no cruzan la frontera
 * de servidor a cliente. Así `page.tsx` sigue siendo Server Component y la
 * versión semántica del sitio se renderiza en el servidor.
 */
const LEVELS: Level[] = [
  { exp: -1, name: "intro", Component: L0Cursor },
  { exp: 0, name: "about", Component: L1Line },
  { exp: 1, name: "stack", Component: L2Skills },
  // El único nivel con estancia: el zoom se detiene y ese tramo se gasta
  // cruzando la pista de proyectos en horizontal.
  { exp: 2, name: "projects", dwell: 1.5, Component: L3Projects },
  { exp: 3, name: "experience", Component: L4Experience },
  { exp: 4, name: "company", Component: L5Company },
  { exp: 5, name: "territory", Component: L6Territory },
  { exp: 6, name: "contact", Component: L7Contact },
];

export default function ZoomRoot() {
  return <ZoomStage levels={LEVELS} />;
}
