import { TECH_ICON_PATHS } from "@/lib/tech-icons";

/**
 * Segundos por elemento.
 *
 * La duración se calcula desde la cantidad de elementos, no fija, para que
 * todas las filas se muevan a la misma velocidad *en pixeles*. Con una duración
 * fija, una fila de cuatro y una de ocho recorren distancias distintas en el
 * mismo tiempo y la de ocho se ve al doble de rápido.
 */
const SECONDS_PER_ITEM = 3.2;

/**
 * Cuántas placas hacen falta para tapar el ancho visible, con margen.
 *
 * Cada placa mide `w-28` = 112px y el marco más ancho del sitio es `max-w-6xl`
 * = 1152px, o sea ~10.3 placas. 14 deja holgura para pantallas más anchas.
 */
const TILES_TO_COVER = 14;

/**
 * Una fila del carrusel de tecnologías.
 *
 * Las filas alternan dirección: la primera hacia la izquierda, la siguiente
 * hacia la derecha, y así. Ese contrapunto es lo que hace que el bloque se lea
 * como una sola pieza viva en vez de como seis listas que se mueven igual.
 */
export default function Marquee({
  items,
  direction,
}: {
  items: readonly string[];
  direction: "left" | "right";
}) {
  // Solo entra lo que tiene logo.
  //
  // El carrusel es una fila de imágenes: lo que no tiene logo se ve como una
  // imagen rota por más elegante que sea el sustituto. Lo filtrado no se
  // pierde —sigue en `SKILL_GRAPH` y por tanto en la capa semántica, que es la
  // que leen buscadores y filtros de reclutamiento—, simplemente no se dibuja.
  const tiles = items.filter((name) => TECH_ICON_PATHS[name]);
  if (tiles.length === 0) return null;

  // Cuántas copias de la lista van en la pista.
  //
  // La animación desplaza la pista exactamente el ancho de UNA copia. Para que
  // no aparezca un hueco al final del ciclo, lo que queda después de ese
  // desplazamiento —o sea `copies - 1` copias— todavía tiene que tapar el
  // ancho visible. De ahí el `1 +`.
  //
  // La versión anterior pedía solo que el total llegara a 14 placas, que es
  // otra cosa: con 7 elementos daba 2 copias, la pista medía 14 placas y al
  // desplazarse 7 quedaban 7 para tapar 10.3 — tres placas de vacío justo al
  // cerrar el ciclo, que es el parpadeo que se veía en la fila de AI/ML.
  const copies = 1 + Math.ceil(TILES_TO_COVER / tiles.length);

  return (
    <div
      className="relative overflow-hidden"
      // Difumina los extremos en vez de cortarlos en seco: sin esto las placas
      // aparecen y desaparecen de golpe contra el borde y se ve como un bug.
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <div
        className="flex w-max hover:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:transform-none"
        style={{
          animationName: direction === "left" ? "marquee-left" : "marquee-right",
          animationDuration: `${tiles.length * SECONDS_PER_ITEM}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          ["--marquee-shift" as string]: `-${100 / copies}%`,
        }}
      >
        {Array.from({ length: copies }, (_, c) =>
          tiles.map((name) => (
            <TechTile
              key={`${c}-${name}`}
              name={name}
              // Solo la primera copia cuenta como contenido; el resto es relleno
              // visual y no debería leerse dos veces.
              duplicate={c > 0}
            />
          )),
        )}
      </div>
    </div>
  );
}

/** Solo se llama con nombres que ya pasaron el filtro, así que el path existe. */
function TechTile({ name, duplicate }: { name: string; duplicate: boolean }) {
  return (
    <div
      className="group flex w-28 shrink-0 flex-col items-center gap-2.5 px-2"
      aria-hidden={duplicate || undefined}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 text-ash-300 transition-colors duration-300 group-hover:text-white"
        fill="currentColor"
        role="img"
        aria-label={name}
      >
        <path d={TECH_ICON_PATHS[name]} />
      </svg>

      <span className="text-center font-mono text-[0.6rem] leading-none tracking-[0.08em] whitespace-nowrap text-ash-400 transition-colors duration-300 group-hover:text-ash-100">
        {name}
      </span>
    </div>
  );
}
