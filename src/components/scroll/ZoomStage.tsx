"use client";

import { useRef, useState, type ComponentType } from "react";
import { ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import ScaleHUD from "@/components/ui/ScaleHUD";

export type Level = {
  /** Exponente de escala. Es el índice narrativo y lo que muestra el HUD. */
  exp: number;
  /** Nombre corto del nivel, en versalitas en el HUD. */
  name: string;
  /**
   * Recibe `active` cuando es el nivel en foco. Sirve para arrancar animaciones
   * que no pueden depender de ScrollTrigger: dentro del escenario sticky las
   * capas nunca se mueven respecto al viewport, así que un trigger por posición
   * no dispararía nunca.
   */
  Component: ComponentType<{ active?: boolean }>;
};

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
  const root = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const rail = useRef<HTMLDivElement>(null);

  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);

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

      const draw = (p: number) => {
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
        }
      };

      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        // Sin `scrub`: Lenis ya interpola la posición y ScrollTrigger.update se
        // dispara desde su evento. Añadir scrub encima mete un segundo lag.
        onUpdate: (self) => {
          const p = self.progress * (levels.length - 1);
          draw(p);

          if (rail.current) {
            rail.current.style.transform = `scaleY(${self.progress})`;
          }

          const next = Math.round(p);
          setActive((prev) => (prev === next ? prev : next));
        },
      });

      draw(0);
      return () => st.kill();
    },
    { scope: root, dependencies: [levels.length] },
  );

  // Fallback sin movimiento: un documento normal.
  if (reduced) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-32 px-6 py-32">
        {levels.map(({ exp, name, Component }) => (
          <section key={exp} aria-label={name}>
            {/* Sin el exponente: fuera del zoom la escala no significa nada.
                El nombre sí sirve de encabezado en el documento apilado. */}
            <p className="mb-8 font-mono text-xs tracking-[0.2em] text-ash-300 uppercase">
              {name}
            </p>
            <Component />
          </section>
        ))}
      </div>
    );
  }

  return (
    <div ref={root} style={{ height: `${levels.length * 100}vh` }}>
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

      <ScaleHUD levels={levels} active={active} railRef={rail} />
    </div>
  );
}
