"use client";

import { useMemo, useRef, useState, type ComponentType } from "react";
import { ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import ScaleHUD, { type DialHandle } from "@/components/ui/ScaleHUD";
import NavMenu from "@/components/ui/NavMenu";
import { getLenis } from "@/lib/lenis";
import { useContent } from "@/lib/i18n";
import type { LevelKey } from "@/lib/content";

export type Level = {
  /** Exponente de escala. Es el índice narrativo y lo que muestra el HUD. */
  exp: number;
  /** Identificador del nivel. `UI.levelLabels[key]` da el rótulo visible, por idioma. */
  key: LevelKey;
  /**
   * Pantallas de scroll que el zoom se detiene en este nivel antes de seguir.
   *
   * Durante la estancia la escala no cambia y el tramo se gasta en un progreso
   * local de 0 a 1, que la capa recibe como la variable CSS `--local`. Es lo
   * que permite recorrer una pista horizontal sin romper el zoom: se congela,
   * lo cruzas de lado, y sigue alejándose.
   */
  dwell?: number;
  /**
   * Recibe `active` cuando es el nivel en foco. Sirve para arrancar animaciones
   * que no pueden depender de ScrollTrigger: dentro del escenario sticky las
   * capas nunca se mueven respecto al viewport, así que un trigger por posición
   * no dispararía nunca.
   */
  Component: ComponentType<{ active?: boolean }>;
};

/**
 * Un tramo del recorrido: o el zoom está quieto en un nivel, o va de uno al
 * siguiente. Se arma una vez y se recorre en cada frame.
 */
type Segment = {
  kind: "dwell" | "move";
  /** Nivel donde se está quieto, o nivel de partida del movimiento. */
  level: number;
  /** Longitud en pantallas de scroll. */
  len: number;
  /** Dónde empieza, acumulado desde el inicio. */
  start: number;
};

function buildSegments(levels: Level[]): { segments: Segment[]; total: number } {
  const segments: Segment[] = [];
  let start = 0;

  for (let i = 0; i < levels.length; i++) {
    const dwell = levels[i].dwell ?? 0;
    if (dwell > 0) {
      segments.push({ kind: "dwell", level: i, len: dwell, start });
      start += dwell;
    }
    if (i < levels.length - 1) {
      segments.push({ kind: "move", level: i, len: 1, start });
      start += 1;
    }
  }

  return { segments, total: start };
}

/**
 * En qué `t` (misma unidad que `Segment.start`) arranca el nivel `i`, con
 * `local = 0` si tiene estancia. Es la misma suma que arma `buildSegments`,
 * cortada antes de `i` — se usa para que `NavMenu` sepa a qué progreso de
 * scroll saltar, sin mantener una segunda tabla que se pueda desincronizar.
 */
function levelStart(levels: Level[], i: number): number {
  let start = 0;
  for (let j = 0; j < i; j++) start += (levels[j].dwell ?? 0) + 1;
  return start;
}

/**
 * Factor de zoom entre un nivel y el siguiente.
 *
 * Con 6, un nivel entra en cuadro ocupando ~6× la pantalla (recortado, se
 * intuye) y sale ocupando ~1/6. Más alto se siente un salto y no un zoom; más
 * bajo y los niveles se pisan visualmente porque tres a la vez son legibles.
 */
const K = 6;

/** Cuándo aparece un nivel que todavía está por delante (grande, recortado). */
const IN_SPAN = 0.85;
/**
 * Cuánto sobrevive un nivel ya rebasado.
 *
 * Tiene que ser menor que 1: a `d = -1` el nivel siguiente ya está a escala 1 y
 * es lo que se está leyendo. Con 1.7 el anterior seguía al 40% de opacidad
 * encima del texto nuevo y competía con él. A 0.8 se apaga del todo antes de
 * que el nuevo se asiente, y el encogimiento todavía se alcanza a ver.
 */
const OUT_SPAN = 0.8;

/** Fuera de esta ventana un nivel no se toca ni se pinta. */
const CULL = 2;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const smoothstep = (n: number) => n * n * (3 - 2 * n);

/**
 * El sitio entero: un solo zoom continuo hacia afuera.
 *
 * Cada nivel vive en su propia capa a pantalla completa, todas apiladas en el
 * mismo centro. El scroll mueve una posición virtual `p` a lo largo de los
 * niveles, y la capa `i` se dibuja a `K^(i - p)`:
 *
 *   p = i      → escala 1. Es "el" nivel, se lee.
 *   p < i      → escala > 1. Todavía no llegas: está a tu alrededor, recortado.
 *   p > i      → escala < 1. Ya lo rebasaste: se encoge hacia el punto de fuga.
 *
 * Esa es toda la ilusión. No hay anidamiento real de DOM — lo que la vende es
 * que las tres capas visibles comparten centro y que el marco (`ZoomFrame`) de
 * la capa que sale sigue encogiendo dentro de la que entra.
 *
 * Bajo `prefers-reduced-motion` no se suaviza el efecto: se desmonta. El
 * contenido se apila como documento y se lee de arriba a abajo.
 */
export default function ZoomStage({ levels }: { levels: Level[] }) {
  const { UI } = useContent();
  const root = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const dial = useRef<DialHandle>(null);

  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);

  const { segments, total } = useMemo(() => buildSegments(levels), [levels]);

  /**
   * Salto animado a un nivel, para `NavMenu`. Reutiliza el mismo mapeo
   * progreso→scroll que ya usa `ScrollTrigger` (`start:"top top", end:"bottom
   * bottom"` sobre `root`): `scrollY = root.offsetTop + progress *
   * (root.offsetHeight - innerHeight)`. Al llamar `lenis.scrollTo`, Lenis
   * emite `"scroll"` durante todo el tween, que ya alimenta
   * `ScrollTrigger.update` → `apply()` — el zoom pasa visiblemente por cada
   * nivel intermedio, igual que con scroll orgánico, sin tocar `draw()`.
   */
  const scrollToLevel = (i: number) => {
    const lenis = getLenis();
    const r = root.current;
    if (!lenis || !r || total === 0) return;

    const progress = levelStart(levels, i) / total;
    const y = r.offsetTop + progress * (r.offsetHeight - window.innerHeight);

    // Más lejos, más tiempo — para que el paso por los niveles intermedios
    // alcance a sentirse y no sea un corte.
    const distance = Math.abs(active - i);
    const duration = Math.min(2.4, Math.max(1, 0.5 + distance * 0.3));

    lenis.scrollTo(y, { duration, easing: (t: number) => 1 - (1 - t) ** 3 });
  };

  /** Equivalente sin Lenis/GSAP para el fallback de `prefers-reduced-motion`. */
  const scrollToSection = (i: number) => {
    document.getElementById(`level-${levels[i].key}`)?.scrollIntoView({ behavior: "auto" });
  };

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        setReduced(true);
        return;
      }

      const els = layers.current.filter(Boolean) as HTMLDivElement[];
      if (els.length === 0) return;

      // Se escribe `transform` y `opacity` a mano en vez de con
      // `gsap.quickSetter`: quickSetter no enruta "scale" hacia la transform
      // del elemento —la deja en `none` sin avisar— y el zoom entero quedaba
      // plano mientras la opacidad sí respondía. Un write directo además evita
      // la indirección de GSAP en el camino caliente.
      //
      // `visibility` es un write de estilo caro comparado con transform, así
      // que se recuerda el último valor y solo se escribe en el cambio.
      // Arranca en `false` porque el marcado sirve las capas ocultas: si aquí
      // se asumiera `true`, la primera pasada creería que ya están visibles y
      // no escribiría nada — el sitio entero quedaría en negro.
      const painted = els.map(() => false);
      // Último `--local` escrito por capa, para no repetir el write cuando no
      // cambia — que es el caso de todas las capas menos la de la estancia.
      const lastLocal = els.map(() => Number.NaN);

      const draw = (p: number, dwellLevel: number, local: number) => {
        for (let i = 0; i < els.length; i++) {
          const d = i - p;

          if (Math.abs(d) > CULL) {
            if (painted[i]) {
              els[i].style.visibility = "hidden";
              els[i].style.willChange = "auto";
              painted[i] = false;
            }
            continue;
          }

          if (!painted[i]) {
            els[i].style.visibility = "visible";
            els[i].style.willChange = "transform, opacity";
            painted[i] = true;
          }

          els[i].style.transform = `scale(${K ** d})`;

          // Las dos direcciones no usan la misma curva. El que entra sube con
          // smoothstep, que arranca suave y no aparece de golpe. El que sale
          // baja al cuadrado: cae rápido al principio, que es justo cuando
          // estorba la lectura del nivel nuevo, y luego se apaga sin tirón.
          const t = clamp01(d >= 0 ? 1 - d / IN_SPAN : 1 + d / OUT_SPAN);
          els[i].style.opacity = String(d >= 0 ? smoothstep(t) : t * t);

          // Solo el nivel en foco recibe clics: si no, los enlaces de una capa
          // gigante e invisible se comen el cursor de la que sí se está leyendo.
          els[i].style.pointerEvents = Math.abs(d) < 0.5 ? "auto" : "none";

          // El progreso local viaja como variable CSS y no como prop de React.
          // Cambia en cada frame, y pasarlo por props re-renderizaría el nivel
          // sesenta veces por segundo; como custom property lo hereda cualquier
          // descendiente y se resuelve en el compositor.
          //
          // Un nivel ya rebasado se queda en 1, no vuelve a 0. Antes solo se
          // conservaba el valor mientras `dwellLevel` apuntaba a ese nivel, así
          // que en cuanto la estancia terminaba el progreso saltaba a cero de
          // golpe: la pista de proyectos se teletransportaba de la última
          // tarjeta a la primera justo mientras se alejaba, a la vista.
          const next = i === dwellLevel ? local : i < p ? 1 : 0;
          if (lastLocal[i] !== next) {
            els[i].style.setProperty("--local", next.toFixed(5));
            lastLocal[i] = next;
          }
        }
      };

      /**
       * Lleva todo el HUD y las capas a la posición que corresponde a un
       * progreso de scroll dado.
       *
       * Está aparte de `onUpdate` porque hay que invocarla también en el
       * arranque: el navegador restaura el scroll al recargar, así que la
       * página puede nacer a la mitad del recorrido.
       */
      const apply = (progress: number) => {
        // Se recorre la lista de tramos hasta encontrar dónde cae el scroll.
        // Son menos de una docena, así que un barrido lineal por frame es más
        // barato que cualquier estructura para buscarlo.
        const t = progress * total;

        let p = levels.length - 1;
        let dwellLevel = -1;
        let local = 0;

        for (const seg of segments) {
          if (t > seg.start + seg.len) continue;
          const within = clamp01((t - seg.start) / seg.len);
          if (seg.kind === "dwell") {
            p = seg.level;
            dwellLevel = seg.level;
            local = within;
          } else {
            p = seg.level + within;
          }
          break;
        }

        draw(p, dwellLevel, local);

        // El dial exterior sigue la posición del zoom y el interior el scroll
        // bruto, así que necesita las dos cifras: durante una estancia `p` se
        // queda quieto y `progress` no.
        dial.current?.update(p, progress);

        const next = Math.round(p);
        setActive((prev) => (prev === next ? prev : next));
      };

      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        // Sin `scrub`: Lenis ya interpola la posición y ScrollTrigger.update se
        // dispara desde su evento. Añadir scrub encima mete un segundo lag.
        onUpdate: (self) => apply(self.progress),
      });

      // Pintado inicial desde la posición real, no desde cero.
      //
      // Antes esto era `draw(0, -1, 0)` y corría después de crear el trigger.
      // Al recargar con el scroll restaurado, ScrollTrigger ya había pintado el
      // nivel correcto y esta línea lo repisaba con el primero. Solo se
      // desincronizaba el zoom, porque llamaba a `draw` y no al dial: el
      // resultado era el nombre en pantalla, el dial al final y la barra de
      // scroll abajo.
      apply(st.progress);

      return () => st.kill();
    },
    { scope: root, dependencies: [levels.length, segments, total] },
  );

  // Fallback sin movimiento: un documento normal.
  if (reduced) {
    return (
      <>
        <NavMenu levels={levels} active={null} onSelect={scrollToSection} />
        <div className="mx-auto flex max-w-3xl flex-col gap-32 px-6 py-32">
          {levels.map(({ exp, key, Component }) => (
            <section key={exp} id={`level-${key}`} aria-label={UI.levelLabels[key]}>
              {/* Sin el exponente: fuera del zoom la escala no significa nada.
                  El nombre sí sirve de encabezado en el documento apilado. */}
              <p className="mb-8 font-mono text-xs tracking-[0.2em] text-ash-300 uppercase">
                {UI.levelLabels[key]}
              </p>
              <Component />
            </section>
          ))}
        </div>
      </>
    );
  }

  return (
    <div ref={root} style={{ height: `${(total + 1) * 100}vh` }}>
      <div
        ref={viewport}
        className="sticky top-0 h-screen overflow-hidden"
        // El zoom no se puede navegar con teclado, así que el contenido real
        // también existe apilado para lectores de pantalla (ver `page.tsx`).
        aria-hidden="true"
      >
        {levels.map(({ exp, Component }, i) => (
          <div
            key={exp}
            ref={(el) => {
              layers.current[i] = el;
            }}
            className="absolute inset-0 grid place-items-center"
            style={{ visibility: "hidden" }}
          >
            <Component active={active === i} />
          </div>
        ))}
      </div>

      <ScaleHUD ref={dial} levels={levels} active={active} />
      <NavMenu levels={levels} active={active} onSelect={scrollToLevel} />
    </div>
  );
}
