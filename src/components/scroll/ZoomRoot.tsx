"use client";

import ZoomStage, { type Level } from "./ZoomStage";

import L0Cursor from "@/components/levels/L0Cursor";
import L1Line from "@/components/levels/L1Line";
import L2Skills from "@/components/levels/L2Skills";
import L3Projects from "@/components/levels/L3Projects";
import L4Experience from "@/components/levels/L4Experience";
import L5Company from "@/components/levels/L5Company";
import L6Contact from "@/components/levels/L6Contact";

/**
 * Los siete niveles del zoom, del más pequeño al más grande.
 *
 * El orden era la historia: un caret → una línea → un stack → lo que
 * construyó → para quién lo hizo → la compañía que dirige → un punto, cada
 * nivel plausiblemente el contexto del anterior. Se cambió por orden de
 * importancia (ver el comentario de `LEVELS`): la premisa del zoom sobrevive
 * porque lo que la vende es la mecánica —capas que comparten centro y marcos
 * que encogen—, no que el stack contenga literalmente a los proyectos. Lo que
 * no se mueve son los extremos: el caret abre y el punto cierra.
 *
 * Hubo un nivel de "territorio" entre la compañía y el cierre. Era el único que
 * no decía nada profesional —contestaba "¿dónde vives?"— y amortiguaba el
 * alejamiento final. La ubicación se mudó a contacto, en una línea.
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
/*
 * El orden va de lo más importante a lo menos, porque quien llega con prisa
 * —un reclutador con treinta segundos— lee los primeros niveles y se va.
 * Proyectos y experiencia suben justo detrás de "sobre mí", y el stack baja al
 * final: el muro de logos era lo primero que se veía después de la cara, y es
 * lo que menos dice de alguien. Los números de archivo (`L2Skills`, `L3Projects`…)
 * son del orden anterior; el orden vale lo que dice esta lista.
 *
 * `exp` sigue a la posición, no al componente: el dial y el HUD lo leen como
 * "a qué escala estás", y tiene que crecer de uno en uno de arriba abajo.
 */
const LEVELS: Level[] = [
  { exp: -1, key: "intro", Component: L0Cursor },
  { exp: 0, key: "about", Component: L1Line },
  // Primera estancia: el zoom se detiene y ese tramo se gasta cruzando la
  // pista de proyectos en horizontal.
  { exp: 1, key: "projects", dwell: 1.5, Component: L3Projects },
  // Segunda estancia: la línea de tiempo se recorre en horizontal, igual que
  // proyectos, pero la lectura es otra — allá se pasa una lista, aquí se
  // atraviesa el tiempo y las barras se quedan quietas mientras corre la rejilla.
  { exp: 2, key: "experience", dwell: 1.5, Component: L4Experience },
  { exp: 3, key: "company", Component: L5Company },
  { exp: 4, key: "stack", Component: L2Skills },
  { exp: 5, key: "contact", Component: L6Contact },
];

export default function ZoomRoot() {
  return <ZoomStage levels={LEVELS} />;
}
