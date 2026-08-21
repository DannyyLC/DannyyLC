"use client";

import ZoomStage, { type Level } from "./ZoomStage";

import L0Cursor from "@/components/levels/L0Cursor";
import L1Line from "@/components/levels/L1Line";
import L2Skills from "@/components/levels/L2Skills";
import L3System from "@/components/levels/L3System";
import L4Products from "@/components/levels/L4Products";
import L5Work from "@/components/levels/L5Work";
import L6Research from "@/components/levels/L6Research";
import L7Company from "@/components/levels/L7Company";
import L8Territory from "@/components/levels/L8Territory";
import L9Contact from "@/components/levels/L9Contact";

/**
 * Los diez niveles del zoom, del más pequeño al más grande.
 *
 * El orden es la historia: un caret → una línea → una función → un sistema →
 * un producto → clientes → investigación → una compañía → un territorio → un
 * punto. Reordenarlos rompe la premisa, porque cada nivel tiene que ser
 * plausiblemente el contexto del anterior.
 *
 * El registro vive en un módulo de cliente y no en `page.tsx` porque una
 * referencia a componente es una función, y las funciones no cruzan la frontera
 * de servidor a cliente. Así `page.tsx` sigue siendo Server Component y la
 * versión semántica del sitio se renderiza en el servidor.
 */
const LEVELS: Level[] = [
  { exp: -1, name: "the cursor", Component: L0Cursor },
  { exp: 0, name: "the line", Component: L1Line },
  { exp: 1, name: "the function", Component: L2Skills },
  { exp: 2, name: "the system", Component: L3System },
  { exp: 3, name: "the product", Component: L4Products },
  { exp: 4, name: "the work", Component: L5Work },
  { exp: 5, name: "the research", Component: L6Research },
  { exp: 6, name: "the company", Component: L7Company },
  { exp: 7, name: "the territory", Component: L8Territory },
  { exp: 8, name: "the point", Component: L9Contact },
];

export default function ZoomRoot() {
  return <ZoomStage levels={LEVELS} />;
}
