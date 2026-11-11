"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { onIntroDone } from "@/lib/intro";
import type { Level } from "@/components/scroll/ZoomStage";
import { useContent } from "@/lib/i18n";

/** Lo que `ZoomStage` llama en cada frame para mover el dial. */
export type DialHandle = {
  update: (p: number, progress: number) => void;
};

/**
 * Centro de la rueda, muy a la izquierda del viewBox.
 *
 * El truco del dial de cámara es que la rueda es enorme y solo se asoma su
 * borde derecho: así las marcas se mueven casi en vertical, con una curvatura
 * apenas perceptible, que es exactamente cómo se ve un anillo de enfoque de
 * canto. Una rueda pequeña y completa se leería como un reloj.
 */
const CX = -330;
const CY = 310;

/** Radios de cada anillo, medidos desde `CX`. Restarles 330 da la x en pantalla. */
const RIM_OUTER = 400;
const MAJOR_IN = 372;
const MAJOR_OUT = 396;
const MINOR_IN = 344;
const MINOR_OUT = 356;
const RIM_INNER = 340;
const INDEX_R = 410;
/** Dónde va grabado el exponente de cada marca, por fuera del canto. */
const LABEL_R = 407;

/** Grados entre un nivel y el siguiente en el anillo exterior. */
const STEP = 7;

/**
 * Vuelta completa del anillo fino a lo largo de todo el sitio.
 *
 * No es múltiplo de `STEP` a propósito: si los dos anillos avanzaran en
 * proporción entera se verían acoplados, como una sola pieza. Desfasados se
 * leen como dos ruedas de un mismo tren, que es la sensación buscada.
 */
const MINOR_SWEEP = 143;

/** Marcas del anillo fino, en toda la circunferencia. */
const MINOR_TICKS = Array.from({ length: 72 }, (_, i) => i * 5);

/**
 * Redondeo a milésimas antes de que el valor llegue al DOM.
 *
 * La especificación de ECMAScript no obliga a `Math.sin` ni `Math.cos` a
 * devolver el resultado correctamente redondeado: cada implementación puede
 * diferir en el último bit. Node y Chrome corren builds distintos de V8, así
 * que el servidor calculaba `-132.68970589524017` donde el cliente calculaba
 * `-132.6897058952401`, React comparaba los atributos como texto, veía dos
 * cadenas distintas y avisaba de un desajuste de hidratación en cada una de
 * las 72 marcas del anillo fino.
 *
 * La discrepancia es de ~1e-13 unidades de viewBox — diez órdenes de magnitud
 * por debajo de un pixel. Tres decimales sobran para dibujar y hacen que ambos
 * lados escriban exactamente la misma cadena.
 */
const round3 = (n: number) => Math.round(n * 1000) / 1000;

function polar(r: number, deg: number) {
  const a = (deg * Math.PI) / 180;
  return {
    x: round3(CX + r * Math.cos(a)),
    y: round3(CY + r * Math.sin(a)),
  };
}

function tick(rIn: number, rOut: number, deg: number) {
  const a = polar(rIn, deg);
  const b = polar(rOut, deg);
  return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * Calibración de arranque: cuánto giran de más los anillos antes de asentarse.
 *
 * Giran en sentidos opuestos y el fino mucho más, por la misma razón que
 * `MINOR_SWEEP` no es múltiplo de `STEP`: dos ruedas, no una pieza.
 */
const CAL_MAJOR = 34;
const CAL_MINOR = -120;
const CAL_SECONDS = 1.6;

/** Opacidad del anillo fino en reposo y a toda velocidad. */
const MINOR_REST = 0.3;
const MINOR_FAST = 0.9;
/** Fracción del recorrido por segundo a la que el anillo ya está a tope. */
const FAST_SPEED = 0.22;
/** Cuánto conserva el brillo de un frame al siguiente, a 60 fps. */
const GLOW_DECAY = 0.9;

/**
 * El indicador de escala: un dial analógico que gira con el scroll.
 *
 * Antes era una línea recta con puntos. Funcionaba como referencia, pero no
 * decía nada del sitio; un dial sí, porque el sitio entero **es** un mecanismo
 * de escala y esto lo declara desde el primer segundo.
 *
 * Dos anillos giran a ritmos distintos. El exterior lleva una marca por nivel y
 * gira con la posición del zoom, así que se detiene cuando el zoom se detiene
 * —durante la estancia de proyectos, por ejemplo— y eso es verdad: sigues en el
 * mismo nivel. El interior gira con el scroll bruto y no se detiene nunca. Esa
 * discrepancia entre los dos es la que hace que se lea como un tren de
 * engranajes y no como una barra de progreso curva.
 *
 * El índice es fijo, como en un anillo de enfoque real: no se mueve el
 * indicador, se mueve la escala debajo de él.
 */
const ScaleHUD = forwardRef<DialHandle, { levels: Level[]; active: number }>(
  function ScaleHUD({ levels, active }, ref) {
    const { UI } = useContent();
    const major = useRef<SVGGElement>(null);
    const minor = useRef<SVGGElement>(null);
    const marks = useRef<(SVGLineElement | null)[]>([]);
    const engraved = useRef<(SVGTextElement | null)[]>([]);
    const shell = useRef<HTMLDivElement>(null);

    /**
     * Todo lo que decide cómo se ve el dial, en un solo sitio.
     *
     * `p` y `progress` vienen del scroll. `cal` y `glow` son lo único con
     * tiempo propio: `cal` va de 1 a 0 una vez, al calibrarse, y `glow` sube
     * con la velocidad y decae solo. Los dos se SUMAN a lo que dice el scroll
     * y terminan en cero, así que en reposo el dial es exactamente la posición
     * del scroll — no hay estado que pueda quedarse desincronizado.
     */
    const state = useRef({
      p: 0,
      progress: 0,
      cal: 1,
      glow: 0,
      lastProgress: Number.NaN,
      lastTime: 0,
      decaying: false,
    });

    const render = () => {
      const s = state.current;
      const count = marks.current.length;

      // Girar el grupo entero es un solo write de atributo. Colocar cada
      // marca por separado serían ocho, y el resultado en pantalla es idéntico.
      major.current?.setAttribute(
        "transform",
        `rotate(${-s.p * STEP + s.cal * CAL_MAJOR} ${CX} ${CY})`,
      );
      minor.current?.setAttribute(
        "transform",
        `rotate(${-s.progress * MINOR_SWEEP + s.cal * CAL_MINOR} ${CX} ${CY})`,
      );

      // El anillo fino se enciende y engrosa con la velocidad del scroll.
      minor.current?.setAttribute(
        "stroke-opacity",
        (MINOR_REST + (MINOR_FAST - MINOR_REST) * s.glow).toFixed(3),
      );
      minor.current?.setAttribute("stroke-width", (1 + 0.7 * s.glow).toFixed(2));

      for (let i = 0; i < count; i++) {
        const d = Math.abs(i - s.p);

        // Durante la calibración las marcas se encienden una por una, de la
        // primera a la última, en vez de aparecer todas a la vez.
        const lit = clamp01((1 - s.cal) * (count + 2) - i);

        // La marca bajo el índice se enciende; el resto se apaga con la
        // distancia. Sin esto las ocho pesan igual y no se sabe cuál se lee.
        const el = marks.current[i];
        if (el) {
          const o = (0.12 + 0.88 * clamp01(1 - d / 1.4)) * lit;
          el.setAttribute("stroke-opacity", o.toFixed(3));
          el.setAttribute("stroke-width", d < 0.5 ? "1.6" : "1");
        }

        // El exponente grabado hace lo contrario cerca del índice: se apaga,
        // porque ahí ya lo dice el rótulo grande y además lo cruza la línea
        // del índice. Lejos también se apaga, para no llenar el canto.
        const text = engraved.current[i];
        if (text) {
          const near = clamp01((d - 0.3) / 0.5);
          const far = clamp01(1 - (d - 1) / 2.2);
          text.setAttribute("fill-opacity", (0.6 * near * far * lit).toFixed(3));
        }
      }
    };

    useImperativeHandle(ref, () => ({
      update(p, progress) {
        const s = state.current;
        const now = performance.now();

        // Velocidad en fracción del recorrido por segundo. El primer frame no
        // tiene anterior con qué comparar, y tras una pausa larga el cociente
        // no significa nada, así que en los dos casos no cuenta.
        const dt = (now - s.lastTime) / 1000;
        if (!Number.isNaN(s.lastProgress) && dt > 0 && dt < 0.25) {
          const speed = Math.abs(progress - s.lastProgress) / dt;
          s.glow = Math.max(s.glow, clamp01(speed / FAST_SPEED));
        }
        s.lastProgress = progress;
        s.lastTime = now;
        s.p = p;
        s.progress = progress;

        // El brillo tiene que apagarse aunque el scroll ya no mande frames:
        // mientras quede algo, un tick propio lo va bajando.
        if (s.glow > 0 && !s.decaying) {
          s.decaying = true;
          const decay = () => {
            s.glow *= GLOW_DECAY ** gsap.ticker.deltaRatio(60);
            if (s.glow < 0.01) {
              s.glow = 0;
              s.decaying = false;
              gsap.ticker.remove(decay);
            }
            render();
          };
          gsap.ticker.add(decay);
        }

        render();
      },
    }));

    // La calibración: cuando el nombre termina de teclearse, el dial aparece,
    // los anillos dan un barrido en sentidos opuestos y se asientan donde el
    // scroll dice. Hasta entonces el dial no se ve — llega como consecuencia
    // del nombre, no como decorado que ya estaba ahí.
    useEffect(() => {
      const s = state.current;
      let tween: gsap.core.Tween | null = null;

      const off = onIntroDone(() => {
        gsap.to(shell.current, { opacity: 1, duration: 0.5, ease: "power1.out" });
        tween = gsap.to(s, {
          cal: 0,
          duration: CAL_SECONDS,
          ease: "power3.out",
          onUpdate: render,
        });
      });

      return () => {
        off();
        tween?.kill();
      };
    }, []);

    const current = levels[active] ?? levels[0];
    const next = levels[active + 1];

    return (
      <div
        ref={shell}
        className="pointer-events-none fixed inset-y-0 left-0 z-50 hidden items-center md:flex"
        // Invisible hasta la calibración.
        style={{ opacity: 0 }}
      >
        <svg
          viewBox="0 0 100 620"
          preserveAspectRatio="xMinYMid meet"
          className="h-[min(620px,88vh)] w-25 shrink-0"
          aria-hidden="true"
        >
          {/* Cantos de los anillos. Un círculo girado se ve igual, así que
              quedan fuera de los grupos que rotan. */}
          <circle
            cx={CX}
            cy={CY}
            r={RIM_OUTER}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
          />
          <circle
            cx={CX}
            cy={CY}
            r={RIM_INNER}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
          />

          {/* Color y grosor van en el grupo, no en cada línea: así encender
              el anillo con la velocidad son dos writes y no 144. */}
          <g ref={minor} stroke="#ffffff" strokeOpacity={MINOR_REST} strokeWidth="1">
            {MINOR_TICKS.map((deg) => (
              <line key={deg} {...tick(MINOR_IN, MINOR_OUT, deg)} />
            ))}
          </g>

          <g ref={major}>
            {levels.map((level, i) => (
              <line
                key={level.exp}
                ref={(el) => {
                  marks.current[i] = el;
                }}
                {...tick(MAJOR_IN, MAJOR_OUT, i * STEP)}
                stroke="#ffffff"
                strokeOpacity="0.12"
                strokeWidth="1"
              />
            ))}

            {/* El exponente de cada nivel, grabado junto a su marca. Va dentro
                del grupo que gira y se coloca con `rotate`, no con seno y
                coseno: el atributo queda con enteros y servidor y cliente
                escriben la misma cadena. Con esto el dial deja de ser siete
                rayas anónimas y enseña el recorrido entero desde el inicio. */}
            {levels.map((level, i) => (
              <text
                key={level.exp}
                ref={(el) => {
                  engraved.current[i] = el;
                }}
                x={CX + LABEL_R}
                y={CY + 2.5}
                transform={`rotate(${i * STEP} ${CX} ${CY})`}
                fill="#ffffff"
                fillOpacity="0"
                fontSize="7.5"
                className="font-mono"
              >
                10
                <tspan dy="-3" fontSize="5.5">
                  {level.exp}
                </tspan>
              </text>
            ))}
          </g>

          {/* Índice fijo: no se mueve el indicador, se mueve la escala. */}
          <g>
            <line
              x1={CX + RIM_OUTER}
              y1={CY}
              x2={CX + INDEX_R + 8}
              y2={CY}
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="1"
            />
            <rect
              x={CX + INDEX_R - 4}
              y={CY - 4}
              width="8"
              height="8"
              transform={`rotate(45 ${CX + INDEX_R} ${CY})`}
              fill="#ffffff"
            />
          </g>
        </svg>

        <div className="-ml-1 font-mono">
          <p className="text-sm leading-none text-white tabular-nums">
            10<sup className="text-[0.65em]">{current.exp}</sup>
          </p>
          <p className="mt-2 text-[0.6rem] leading-none tracking-[0.18em] whitespace-nowrap text-ash-300 uppercase">
            {UI.levelLabels[current.key]}
          </p>
          {/* A dónde lleva el siguiente tramo. En el último nivel no hay. */}
          {next && (
            <p className="mt-3 flex items-center gap-1.5 text-[0.55rem] leading-none tracking-[0.18em] whitespace-nowrap text-ash-300/70 uppercase">
              <span className="h-1 w-1 rotate-45 border border-ash-300/70" />
              {UI.levelLabels[next.key]}
            </p>
          )}
        </div>
      </div>
    );
  },
);

export default ScaleHUD;
