"use client";

import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import ScaleHUD, { type DialHandle } from "@/components/ui/ScaleHUD";
import NavMenu from "@/components/ui/NavMenu";
import DepthDust, { type DustHandle } from "@/components/ui/DepthDust";
import { subscribePointer } from "@/lib/pointer";
import { onIntroDone } from "@/lib/intro";
import { setZoomNav } from "@/lib/zoom-nav";
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

/**
 * Cuánto desplaza el cursor el punto de fuga, en px, de centro a borde.
 *
 * Es la misma proyección que daría `perspective` + `translateZ` moviendo el
 * `perspective-origin`, escrita a mano: una capa a escala `s` se corre
 * `o × (1 − s)`. La que se está leyendo (s = 1) no se mueve nada; la que sale
 * sigue al cursor y la que entra va al revés, y eso las despega en profundidad.
 * Se hace con `translate` + `scale` y no con 3D real para no cambiar el camino
 * de rasterizado del texto, que a escala 6 es lo más frágil del sitio.
 */
const PARALLAX = 28;

/**
 * Desenfoque máximo de un nivel que sale, en px de pantalla.
 *
 * Solo el que sale: el que entra tiene que poder leerse en cuanto asoma. Poner
 * esto en 0 apaga el efecto entero, que es lo primero que hay que probar si el
 * zoom pierde frames — `filter` sobre una capa a pantalla completa es lo más
 * caro de pintar que hay aquí.
 */
const BLUR_MAX = 5;
/** Tope en px locales: el filtro se aplica antes de la escala y hay que compensarla. */
const BLUR_LOCAL_CAP = 16;

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
  const dust = useRef<DustHandle>(null);

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
  const scrollToLevel = (i: number, local = 0) => {
    const lenis = getLenis();
    const r = root.current;
    if (!lenis || !r || total === 0) return;

    // `local` avanza dentro de la estancia del nivel: es lo que deja caer en
    // una tarjeta concreta de una pista y no siempre en la primera.
    const within = clamp01(local) * (levels[i].dwell ?? 0);
    const progress = (levelStart(levels, i) + within) / total;
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

  // Publica el salto para `zoomTo` (ver `lib/zoom-nav.ts`). Sin dependencias a
  // propósito: las dos funciones se recrean en cada render y cierran sobre
  // `active` y `reduced`, así que se registra siempre la vigente.
  useEffect(() => {
    setZoomNav((key, local) => {
      const i = levels.findIndex((level) => level.key === key);
      if (i < 0) return;
      if (reduced) scrollToSection(i);
      else scrollToLevel(i, local);
    });
    return () => setZoomNav(null);
  });

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
      // Último desenfoque escrito por capa, por la misma razón.
      const lastBlur = els.map(() => 0);

      // Desplazamiento del punto de fuga por el cursor, en px.
      let ox = 0;
      let oy = 0;

      // El punto de luz del cierre: hacia ahí colapsa el polvo al final.
      const point = root.current?.querySelector<HTMLElement>("[data-zoom-point]");

      /**
       * Centro del punto en coordenadas del escenario, con su capa a escala 1.
       *
       * Por la cadena de `offsetParent` y no con `getBoundingClientRect`: los
       * offsets ignoran las transforms, y la capa casi siempre está escalada
       * cuando esto se pregunta.
       */
      const measurePoint = (): [number, number] => {
        const stage = viewport.current;
        if (!point || !stage) return [Number.NaN, Number.NaN];
        let x = point.offsetWidth / 2;
        let y = point.offsetHeight / 2;
        let el: HTMLElement | null = point;
        while (el && el !== stage) {
          x += el.offsetLeft;
          y += el.offsetTop;
          el = el.offsetParent as HTMLElement | null;
        }
        return [x, y];
      };

      const draw = (p: number, dwellLevel: number, local: number) => {
        // Último tramo del recorrido, 0 → 1. Solo ahí hace falta saber dónde
        // está el punto, y se mide en el momento: el titular cambia de alto
        // con el idioma y el punto se mueve con él.
        const finale = clamp01(p - (els.length - 2));
        const [tx, ty] =
          finale > 0 ? measurePoint() : [Number.NaN, Number.NaN];
        dust.current?.update({ p, k: K, ox, oy, finale, tx, ty });

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
            els[i].style.willChange = "transform, opacity, filter";
            painted[i] = true;
          }

          const s = K ** d;
          els[i].style.transform =
            ox !== 0 || oy !== 0
              ? `translate(${(ox * (1 - s)).toFixed(2)}px, ${(oy * (1 - s)).toFixed(2)}px) scale(${s})`
              : `scale(${s})`;

          // Profundidad de campo: el nivel que sale se desenfoca además de
          // apagarse, como una lente que cambia de foco. El filtro se aplica
          // antes de la escala, así que se divide entre ella para que el
          // desenfoque en pantalla sea el que dice `BLUR_MAX`.
          //
          // Pasado `OUT_SPAN` la capa ya es invisible y el filtro se quita: un
          // desenfoque sobre algo con opacidad 0 se paga igual y no se ve.
          const screenBlur =
            d < 0 && -d < OUT_SPAN ? (-d / OUT_SPAN) * BLUR_MAX : 0;
          const blur =
            Math.round(Math.min(BLUR_LOCAL_CAP, screenBlur / s) * 10) / 10;
          if (lastBlur[i] !== blur) {
            els[i].style.filter = blur > 0 ? `blur(${blur}px)` : "none";
            lastBlur[i] = blur;
          }

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
      // Lo último que se pintó, para repintar cuando lo que cambia es el cursor
      // y no el scroll.
      let lastP = 0;
      let lastDwell = -1;
      let lastLocalValue = 0;

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

        lastP = p;
        lastDwell = dwellLevel;
        lastLocalValue = local;
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

      // Después del pintado inicial: la suscripción llama de inmediato con la
      // posición actual del cursor, y `draw` necesita una `p` real que repintar.
      const unsubscribe = subscribePointer((x, y) => {
        ox = x * PARALLAX;
        oy = y * PARALLAX;
        draw(lastP, lastDwell, lastLocalValue);
      });

      // La onda de polvo sale del caret cuando el nombre termina de teclearse.
      // Solo si de verdad se está viendo el primer nivel: al recargar a media
      // página el nombre se teclea igual, fuera de cuadro, y una onda saliendo
      // de un punto cualquiera no significaría nada.
      const offIntro = onIntroDone(() => {
        if (lastP > 0.25) return;
        const caret = root.current?.querySelector("[data-zoom-origin]");
        const stage = viewport.current;
        if (!caret || !stage) return;
        const c = caret.getBoundingClientRect();
        const s = stage.getBoundingClientRect();
        dust.current?.burst(
          c.left + c.width / 2 - s.left,
          c.top + c.height / 2 - s.top,
        );
      });

      return () => {
        offIntro();
        unsubscribe();
        st.kill();
      };
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
        {/* Detrás de todas las capas: va primero en el DOM. */}
        <DepthDust ref={dust} />

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
