"use client";

import { useEffect, useRef } from "react";
import { PROJECTS } from "@/lib/content";

/**
 * Proyectos — pista horizontal.
 *
 * El zoom se congela aquí (`dwell` en `ZoomRoot`) y ese tramo de scroll se
 * gasta cruzando las tarjetas de lado. Es el único punto del sitio donde el
 * movimiento cambia de eje, y funciona porque una lista de proyectos es
 * justamente lo que se recorre, no algo que se lee de un vistazo.
 *
 * El desplazamiento no pasa por React ni por GSAP: `ZoomStage` escribe el
 * progreso local en la variable CSS `--local` sobre la capa, y aquí la
 * multiplica una `calc()`. Un valor que cambia sesenta veces por segundo como
 * prop sería sesenta renders de React por segundo; como custom property la
 * resuelve el compositor y no toca el hilo principal.
 */
export default function L3Projects() {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const v = viewport.current;
    const t = track.current;
    if (!v || !t) return;

    // Relleno a los lados de media pantalla menos media tarjeta.
    //
    // Con eso la distancia a recorrer sale exactamente `(N-1) × (tarjeta +
    // hueco)`, y esa cifra tiene una propiedad útil: al empezar, la PRIMERA
    // tarjeta queda centrada; al terminar, la ÚLTIMA queda centrada. Sin este
    // relleno la primera arranca pegada al borde izquierdo y solo puede
    // alejarse, y la última apenas asoma justo cuando el tramo se acaba.
    //
    // Se calcula en JS y no con `calc(50vw - …)` porque `vw` incluye el ancho
    // de la barra de scroll y `clientWidth` no; el sitio mide 950vh, así que
    // esa barra siempre está y el centrado saldría corrido unos pixeles.
    const measure = () => {
      const first = t.firstElementChild as HTMLElement | null;
      const pad = Math.max(0, (v.clientWidth - (first?.offsetWidth ?? 0)) / 2);

      t.style.paddingLeft = `${pad}px`;
      t.style.paddingRight = `${pad}px`;

      // Después de escribir el relleno: cambia `scrollWidth`.
      v.style.setProperty(
        "--track-distance",
        `${Math.max(0, t.scrollWidth - v.clientWidth)}px`,
      );
    };

    measure();
    // Solo se observa el viewport. La pista cambia de ancho como consecuencia
    // de escribir su propio relleno, así que observarla se realimentaría.
    const observer = new ResizeObserver(measure);
    observer.observe(v);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col justify-center">
      <p className="mb-10 text-center font-mono text-sm tracking-[0.3em] text-ash-100 uppercase sm:text-base">
        Projects
      </p>

      <div ref={viewport} className="overflow-hidden">
        <div
          ref={track}
          className="flex w-max gap-5"
          style={{
            transform:
              "translate3d(calc(var(--local, 0) * var(--track-distance, 0px) * -1), 0, 0)",
          }}
        >
          {PROJECTS.map((p) => (
            <ProjectCard key={p.name} project={p} />
          ))}
        </div>
      </div>

      {/* Barra de avance: sin ella no hay forma de saber cuánta pista queda,
          y el scroll vertical que mueve algo en horizontal desconcierta si no
          se ve el progreso. */}
      <div className="mx-8 mt-8 h-px bg-white/10 md:mx-16">
        <div
          className="h-full origin-left bg-white/50"
          style={{ transform: "scaleX(var(--local, 0))" }}
        />
      </div>
    </div>
  );
}

function ProjectCard({
  project,
}: {
  project: (typeof PROJECTS)[number];
}) {
  return (
    // Ancho relativo al viewport, no fijo. Con 320px fijos las cinco tarjetas
    // caben enteras en un monitor de 1920 y la distancia a recorrer sale 0: la
    // estancia se convertiría en pantalla y media de scroll sin que nada se
    // mueva. A 28vw las cinco suman 140vw y siempre sobra pista que cruzar.
    <article
      className="flex shrink-0 flex-col border border-white/12 p-6 transition-colors duration-500 hover:border-white/30"
      style={{ width: "max(18rem, 28vw)" }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-mono text-base text-white">{project.name}</h3>
        {project.href && (
          <a
            href={project.href}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[0.6rem] text-ash-300 transition-colors hover:text-white"
          >
            ↗
          </a>
        )}
      </div>

      <p className="mt-1 font-mono text-[0.6rem] tracking-[0.18em] text-ash-300 uppercase">
        {project.what}
      </p>

      <p className="mt-5 font-mono text-[0.6rem] text-ash-400">
        {project.client}
      </p>

      <p className="mt-2 flex items-start gap-2 text-xs text-ash-100">
        <span
          className="mt-[0.35rem] h-1 w-1 shrink-0 rotate-45 bg-white/60"
          aria-hidden
        />
        {project.role}
      </p>

      <p className="mt-4 flex-1 text-xs leading-relaxed text-ash-200">
        {project.detail}
      </p>

      <p className="mt-6 font-mono text-[0.6rem] leading-relaxed text-ash-400">
        {project.stack.join(" · ")}
      </p>
    </article>
  );
}
