"use client";

import { useCallback, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useDialog } from "@/lib/dialog";
import { useContent } from "@/lib/i18n";
import type { Content } from "@/lib/content";

type Project = Content["PROJECTS"][number];

/** Lo mínimo de un rectángulo que hace falta para animar desde él. */
export type Origin = { left: number; top: number; width: number; height: number };

/**
 * La vista detallada de un proyecto.
 *
 * La tarjeta de la pista es para recorrer: dice qué es y con qué está hecho.
 * Esto es para quien se detuvo en una — el problema, lo que construí, lo que
 * decidí y qué resultó, con sitio para leerlo. El detalle técnico vivía en un
 * `<details>` dentro de la tarjeta, que la hacía crecer en plena pista en arco;
 * ahora es una sección más de aquí.
 *
 * Se monta en `document.body` con un portal, por dos razones. La capa del
 * nivel lleva `transform`, y un `position: fixed` dentro de un ancestro
 * transformado deja de ser relativo a la pantalla. Y el escenario entero va
 * `aria-hidden`: un diálogo ahí dentro no existiría para un lector de pantalla.
 *
 * Abre creciendo desde el rectángulo de la tarjeta (`origin`) y cierra
 * volviendo a él, así que se lee como la misma tarjeta que se despliega y no
 * como una ventana que aparece encima.
 */
export default function ProjectPanel({
  project,
  origin,
  onClose,
}: {
  project: Project;
  origin: Origin | null;
  onClose: () => void;
}) {
  const { UI } = useContent();
  const titleId = useId();
  const overlay = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);

  /** La transform que lleva el panel a ocupar el rectángulo de la tarjeta. */
  const collapsed = useCallback(() => {
    const el = panel.current;
    if (!el || !origin) return null;
    // `offset*` y no `getBoundingClientRect`: a media animación el panel ya
    // está transformado y el rectángulo mediría la transform, no el destino.
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const parent = overlay.current?.getBoundingClientRect();
    if (!parent || w === 0 || h === 0) return null;
    return {
      x: origin.left - (parent.left + el.offsetLeft),
      y: origin.top - (parent.top + el.offsetTop),
      scaleX: origin.width / w,
      scaleY: origin.height / h,
    };
  }, [origin]);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;

    const from = collapsed();
    if (prefersReducedMotion() || !from) {
      onClose();
      return;
    }

    gsap
      .timeline({ onComplete: onClose })
      .to("[data-panel-content]", { opacity: 0, duration: 0.15 }, 0)
      .to(panel.current, { ...from, duration: 0.4, ease: "power3.inOut" }, 0)
      .to("[data-panel-backdrop]", { opacity: 0, duration: 0.4 }, 0)
      .to(panel.current, { opacity: 0, duration: 0.15 }, 0.25);
  }, [collapsed, onClose]);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.fromTo(
        "[data-panel-backdrop]",
        { opacity: 0 },
        { opacity: 1, duration: 0.35, ease: "power1.out" },
      );

      const from = collapsed();
      if (from) {
        gsap.fromTo(
          panel.current,
          { ...from, transformOrigin: "0 0" },
          { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.6, ease: "expo.out" },
        );
      }
      // El contenido entra cuando el marco ya casi tiene su forma: estirado a
      // la proporción de la tarjeta, el texto se vería deformado.
      gsap.fromTo(
        "[data-panel-content]",
        { opacity: 0 },
        { opacity: 1, duration: 0.4, delay: from ? 0.22 : 0, ease: "power1.out" },
      );
    },
    { scope: overlay },
  );

  useDialog(panel, closeButton, close);

  const sections = [
    { label: UI.panel.problem, body: project.problem },
    { label: UI.panel.built, body: project.built },
    { label: UI.panel.decisions, body: project.decisions },
    { label: UI.panel.result, body: project.result },
    { label: UI.seeTechnical, body: project.technical },
  ].filter((s): s is { label: string; body: string } => Boolean(s.body));

  return createPortal(
    <div
      ref={overlay}
      className="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-8"
      // Lenis ignora la rueda aquí dentro: el panel hace scroll nativo.
      data-lenis-prevent
    >
      {/* Negro sobre negro: oscurece el nivel de atrás sin levantar nada. */}
      <div
        data-panel-backdrop
        className="absolute inset-0 bg-black/85"
        onClick={close}
      />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-full w-full max-w-3xl flex-col border border-white/15 bg-black"
      >
        <span className="absolute top-2 left-2 h-3 w-3 border-t border-l border-white/40" />
        <span className="absolute top-2 right-2 h-3 w-3 border-t border-r border-white/40" />
        <span className="absolute bottom-2 left-2 h-3 w-3 border-b border-l border-white/40" />
        <span className="absolute right-2 bottom-2 h-3 w-3 border-r border-b border-white/40" />

        <div data-panel-content className="flex min-h-0 flex-col">
          <header className="flex items-start justify-between gap-6 px-6 pt-8 pb-6 sm:px-10 sm:pt-10">
            <div className="min-w-0">
              <h2
                id={titleId}
                className="font-mono text-2xl text-white sm:text-3xl"
              >
                {project.name}
              </h2>
              <p className="mt-2 font-mono text-[0.65rem] tracking-[0.18em] text-ash-300 uppercase">
                {project.what}
              </p>
              <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.65rem] text-ash-200">
                <span>{project.client}</span>
                <span className="h-1 w-1 rotate-45 bg-white/60" aria-hidden />
                <span>{project.role}</span>
              </p>
            </div>

            <button
              ref={closeButton}
              type="button"
              onClick={close}
              className="shrink-0 py-2 font-mono text-[0.6rem] tracking-[0.18em] text-ash-200 uppercase transition-colors hover:text-white"
            >
              {UI.close} <span aria-hidden>✕</span>
            </button>
          </header>

          <div className="min-h-0 overflow-y-auto overscroll-contain px-6 pb-8 sm:px-10 sm:pb-10">
            {project.metrics && project.metrics.length > 0 && (
              <dl className="mb-8 flex flex-wrap gap-x-12 gap-y-5 border-y border-white/10 py-6">
                {project.metrics.map((m) => (
                  <div key={m.label}>
                    <dd className="font-mono text-3xl text-white tabular-nums sm:text-4xl">
                      {m.value}
                    </dd>
                    <dt className="mt-2 font-mono text-[0.6rem] tracking-[0.18em] text-ash-300 uppercase">
                      {m.label}
                    </dt>
                  </div>
                ))}
              </dl>
            )}

            <div className="space-y-6">
              {sections.map((s) => (
                <section
                  key={s.label}
                  className="grid gap-2 sm:grid-cols-[9.5rem_1fr] sm:gap-8"
                >
                  <h3 className="pt-0.5 font-mono text-[0.6rem] tracking-[0.2em] text-ash-300 uppercase">
                    {s.label}
                  </h3>
                  <p className="text-sm leading-relaxed text-ash-100">{s.body}</p>
                </section>
              ))}
            </div>

            <ul className="mt-8 flex flex-wrap gap-2 border-t border-white/10 pt-6">
              {project.stack.map((tech) => (
                <li
                  key={tech}
                  className="border border-white/12 px-2.5 py-1 font-mono text-[0.6rem] text-ash-200"
                >
                  {tech}
                </li>
              ))}
            </ul>

            {project.href && (
              <a
                href={project.href}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 border-b border-white/30 pb-0.5 font-mono text-xs text-white transition-colors hover:border-white"
              >
                {new URL(project.href).host} <span aria-hidden>↗</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
