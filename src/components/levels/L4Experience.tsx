"use client";

import { useEffect, useRef } from "react";
import { EXPERIENCE, TIMELINE_ORIGIN, TIMELINE_END } from "@/lib/content";

/** Ancho de una tarjeta. */
const CARD = 360;
/** Separación entre nodos consecutivos sobre la espina. */
const GAP = 430;
/** Aire a los lados de la pista. */
const PAD = 80;
/** Largo del tallo que une el nodo con su tarjeta. */
const STEM = 56;
/**
 * Alto reservado a una tarjeta.
 *
 * Es `minHeight`, no altura fija: una tarjeta con texto largo crece. Por eso
 * las de arriba se anclan por su borde INFERIOR —crecen alejándose de la
 * espina— y no por el superior, que las hacía crecer hacia abajo hasta
 * cruzarla. Este número solo tiene que dar para que la pista reserve sitio.
 */
const CARD_H = 225;

const months = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  const [oy, om] = TIMELINE_ORIGIN.split("-").map(Number);
  return (y - oy) * 12 + (m - om);
};

const SPAN = months(TIMELINE_END);

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const COUNT_WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six"];

/** Offset en meses desde el origen → `May 2025`. */
function monthLabel(offset: number) {
  const [oy, om] = TIMELINE_ORIGIN.split("-").map(Number);
  const total = oy * 12 + (om - 1) + offset;
  return `${MONTH_NAMES[total % 12]} ${Math.floor(total / 12)}`;
}

/**
 * La frase sobre concurrencia, calculada desde las fechas.
 *
 * El dato que este nivel existe para contar es que varios puestos corrieron a
 * la vez. La versión anterior lo enseñaba con un diagrama de Gantt de cinco
 * carriles y rejilla mensual: técnicamente exacto e ilegible. Una frase lo dice
 * sin que nadie tenga que descifrar un eje.
 */
function concurrencySentence() {
  const counts = Array.from({ length: SPAN + 1 }, (_, i) =>
    EXPERIENCE.filter((r) => {
      const s = months(r.from);
      const e = r.to ? months(r.to) : SPAN;
      return i >= s && i <= e;
    }).length,
  );

  const peak = Math.max(...counts);
  if (peak < 2) return null;

  const from = counts.indexOf(peak);
  let to = from;
  while (to + 1 <= SPAN && counts[to + 1] === peak) to++;

  return `${COUNT_WORDS[peak]} of them ran at the same time, between ${monthLabel(from)} and ${monthLabel(to)}.`;
}

/** Estático: sale de datos que no cambian en runtime. */
const SENTENCE = concurrencySentence();

/**
 * La línea corre del más antiguo al más reciente.
 *
 * `EXPERIENCE` está en orden inverso, que es como se lee un CV y como lo sirve
 * la capa semántica. Aquí hay que darle la vuelta: una línea de tiempo cuyos
 * nodos van de nuevo a viejo de izquierda a derecha contradice lo único que el
 * lector da por hecho al ver una línea horizontal.
 */
const ORDERED = [...EXPERIENCE].sort(
  (a, b) => months(a.from) - months(b.from),
);

/**
 * Experiencia — una espina con tarjetas colgando.
 *
 * Los nodos van repartidos a distancias iguales, no proporcionales a la fecha.
 * Lo proporcional fue lo que hundió a la versión anterior: dos puestos que
 * empiezan el mismo mes caen uno encima del otro, y dos que empiezan con un mes
 * de diferencia dejan las tarjetas solapadas. Repartidos parejo, cada tarjeta
 * tiene su sitio y el periodo exacto se lee escrito dentro, que es donde se lee
 * sin esfuerzo.
 *
 * La línea sigue significando tiempo —izquierda antes, derecha después— y eso
 * es todo lo que hay que entender para leer el nivel.
 */
export default function L4Experience() {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  // Relativo al contenedor interior: el relleno lo aplica la pista exterior.
  const nodeX = (i: number) => CARD / 2 + i * GAP;
  const contentWidth = CARD + (ORDERED.length - 1) * GAP;
  const trackHeight = (STEM + CARD_H) * 2 + 40;
  const midY = trackHeight / 2;

  useEffect(() => {
    const v = viewport.current;
    const t = track.current;
    if (!v || !t) return;

    // Relleno de media pantalla menos media tarjeta a cada lado: así la
    // PRIMERA tarjeta arranca centrada y la ÚLTIMA termina centrada, en vez de
    // que la primera nazca pegada al borde izquierdo —de donde solo puede
    // irse— y la última apenas asome cuando el tramo ya se acabó.
    const measure = () => {
      const pad = Math.max(PAD, (v.clientWidth - CARD) / 2);
      t.style.paddingLeft = `${pad}px`;
      t.style.paddingRight = `${pad}px`;

      // Después de escribir el relleno: cambia `scrollWidth`.
      v.style.setProperty(
        "--track-distance",
        `${Math.max(0, t.scrollWidth - v.clientWidth)}px`,
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(v);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col justify-center">
      <div className="mb-6 px-8 text-center md:px-16">
        <p className="font-mono text-sm tracking-[0.3em] text-ash-100 uppercase sm:text-base">
          Experience
        </p>
        {SENTENCE && (
          <p className="mx-auto mt-3 max-w-lg text-sm text-ash-300">
            {SENTENCE}
          </p>
        )}
      </div>

      <div ref={viewport} className="overflow-hidden">
        <div
          ref={track}
          className="relative"
          style={{
            width: "max-content",
            height: trackHeight,
            transform:
              "translate3d(calc(var(--local, 0) * var(--track-distance, 0px) * -1), 0, 0)",
          }}
        >
          {/* La espina. Se difumina en los extremos para no afirmar que la
              carrera empieza y termina exactamente ahí. */}
          <span
            className="absolute right-0 left-0 h-px bg-linear-to-r from-transparent via-white to-transparent"
            style={{ top: midY }}
          />

          <div
            className="relative"
            style={{ width: contentWidth, height: trackHeight }}
          >
          {ORDERED.map((role, i) => {
            const x = nodeX(i);
            // Alternan arriba y abajo: es lo que deja respirar a las tarjetas y
            // lo que hace que la espina se lea como una línea y no como el
            // borde superior de una fila.
            const above = i % 2 === 0;

            return (
              <div key={role.org}>
                <span
                  className="absolute w-px bg-white/30"
                  style={{
                    left: x,
                    top: above ? midY - STEM : midY,
                    height: STEM,
                  }}
                />

                <span
                  className="absolute h-2 w-2 rotate-45 bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)]"
                  style={{ left: x - 4, top: midY - 4 }}
                />

                <article
                  className="absolute border border-white/15 bg-black p-5 transition-colors duration-500 hover:border-white/35"
                  style={{
                    left: x - CARD / 2,
                    width: CARD,
                    // Arriba: anclada por abajo, crece hacia arriba.
                    // Abajo: anclada por arriba, crece hacia abajo.
                    // En los dos casos el crecimiento se aleja de la espina.
                    ...(above
                      ? { bottom: trackHeight - midY + STEM }
                      : { top: midY + STEM }),
                    minHeight: CARD_H,
                  }}
                >
                  <p className="font-mono text-[0.6rem] tracking-[0.18em] text-ash-300 uppercase tabular-nums">
                    {role.period}
                  </p>
                  <h3 className="mt-2 text-base text-white">{role.org}</h3>
                  <p className="mt-0.5 font-mono text-[0.65rem] tracking-[0.12em] text-ash-200 uppercase">
                    {role.title}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-ash-200">
                    {role.detail}
                  </p>
                  <p className="mt-3 font-mono text-[0.55rem] leading-relaxed text-ash-400">
                    {role.stack.join(" · ")}
                  </p>
                </article>
              </div>
            );
          })}
          </div>
        </div>
      </div>

      <div className="mx-8 mt-6 h-px bg-white/10 md:mx-16">
        <div
          className="h-full origin-left bg-white/50"
          style={{ transform: "scaleX(var(--local, 0))" }}
        />
      </div>
    </div>
  );
}
