"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
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

    useImperativeHandle(ref, () => ({
      update(p, progress) {
        // Girar el grupo entero es un solo write de atributo. Colocar cada
        // marca por separado serían ocho, y el resultado en pantalla es idéntico.
        major.current?.setAttribute(
          "transform",
          `rotate(${-p * STEP} ${CX} ${CY})`,
        );
        minor.current?.setAttribute(
          "transform",
          `rotate(${-progress * MINOR_SWEEP} ${CX} ${CY})`,
        );

        // La marca bajo el índice se enciende; el resto se apaga con la
        // distancia. Sin esto las ocho pesan igual y no se sabe cuál se lee.
        for (let i = 0; i < marks.current.length; i++) {
          const el = marks.current[i];
          if (!el) continue;
          const d = Math.abs(i - p);
          const o = 0.12 + 0.88 * clamp01(1 - d / 1.4);
          el.setAttribute("stroke-opacity", o.toFixed(3));
          el.setAttribute("stroke-width", d < 0.5 ? "1.6" : "1");
        }
      },
    }));

    const current = levels[active] ?? levels[0];

    return (
      <div className="pointer-events-none fixed inset-y-0 left-0 z-50 hidden items-center md:flex">
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

          <g ref={minor}>
            {MINOR_TICKS.map((deg) => (
              <line
                key={deg}
                {...tick(MINOR_IN, MINOR_OUT, deg)}
                stroke="rgba(255,255,255,0.30)"
                strokeWidth="1"
              />
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
        </div>
      </div>
    );
  },
);

export default ScaleHUD;
