"use client";

import { useCallback, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useDialog } from "@/lib/dialog";
import { useContent } from "@/lib/i18n";
import type { Content } from "@/lib/content";

type Role = Content["EXPERIENCE"][number];

/**
 * Ancho de la ficha en px. `L4Experience` lo usa para recentrar la tarjeta
 * elegida en el espacio que la ficha deja libre.
 */
export const ROLE_PANEL_WIDTH = 432;

/**
 * La ficha de un puesto.
 *
 * Es otra cosa que la vista de un proyecto y por eso no se parece: un proyecto
 * es algo construido y su panel crece desde la tarjeta hasta ocupar el centro;
 * un puesto es un encargo con cliente y periodo, y su ficha entra de lado y
 * deja la línea de tiempo a la vista. Se abre el expediente sin salir de la
 * cronología.
 *
 * Por dentro repite el motivo del nivel girado noventa grados: una espina
 * vertical con su nodo, de la que cuelgan las secciones.
 *
 * No oscurece el fondo. Quien apaga el resto es `L4Experience`, que atenúa las
 * otras tarjetas; aquí solo hay una capa transparente que cierra al hacer clic
 * fuera. Va en un portal por lo mismo que `ProjectPanel`: la capa del nivel
 * lleva `transform` y el escenario entero es `aria-hidden`.
 */
export default function RolePanel({
  role,
  onClosing,
  onClose,
  onProject,
}: {
  role: Role;
  /** Empieza a cerrarse: el nivel ya puede devolver la pista a su sitio. */
  onClosing: () => void;
  /** Terminó de cerrarse: se desmonta. */
  onClose: () => void;
  /** Se eligió uno de los proyectos enlazados. */
  onProject: (name: string) => void;
}) {
  const { UI } = useContent();
  const titleId = useId();
  const overlay = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    onClosing();

    if (prefersReducedMotion()) {
      onClose();
      return;
    }

    gsap.to(panel.current, {
      xPercent: 100,
      duration: 0.4,
      ease: "power3.in",
      onComplete: onClose,
    });
  }, [onClosing, onClose]);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.fromTo(
        panel.current,
        { xPercent: 100 },
        { xPercent: 0, duration: 0.6, ease: "expo.out" },
      );
      // La espina se dibuja hacia abajo y las secciones cuelgan una tras otra.
      gsap.fromTo(
        "[data-role-spine]",
        { scaleY: 0 },
        { scaleY: 1, duration: 0.9, delay: 0.15, ease: "power2.out" },
      );
      gsap.fromTo(
        "[data-role-item]",
        { opacity: 0, x: 14 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          delay: 0.2,
          stagger: 0.07,
          ease: "power2.out",
        },
      );
    },
    { scope: overlay },
  );

  useDialog(panel, closeButton, close);

  const sections = [
    { label: UI.role.assignment, body: role.assignment },
    { label: UI.role.delivered, body: role.delivered },
    { label: UI.role.result, body: role.result },
  ].filter((s): s is { label: string; body: string } => Boolean(s.body));

  return createPortal(
    <div
      ref={overlay}
      className="fixed inset-0 z-60 overflow-hidden"
      // Lenis ignora la rueda aquí dentro: la ficha hace scroll nativo.
      data-lenis-prevent
    >
      {/* Transparente: solo sirve para cerrar al hacer clic fuera. */}
      <div className="absolute inset-0" onClick={close} />

      <aside
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-y-0 right-0 flex w-full flex-col border-l border-white/15 bg-black"
        style={{ maxWidth: ROLE_PANEL_WIDTH }}
      >
        <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain py-10 pr-8 pl-16">
          {/* La espina, vertical, con su nodo a la altura del nombre. */}
          <span
            data-role-spine
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-8 w-px origin-top bg-linear-to-b from-transparent via-white/40 to-transparent"
          />
          <span
            aria-hidden="true"
            className="absolute top-[4.6rem] left-[calc(2rem-3.5px)] h-2 w-2 rotate-45 bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)]"
          />

          <div data-role-item className="flex items-center justify-between gap-4">
            <p className="flex items-center gap-2 font-mono text-[0.6rem] tracking-[0.18em] text-ash-200 uppercase">
              {/* En curso: punto lleno. Concluido: hueco. */}
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full border border-white/70 ${role.ongoing ? "bg-white" : ""}`}
              />
              {role.ongoing ? UI.role.ongoing : UI.role.completed}
            </p>

            <button
              ref={closeButton}
              type="button"
              onClick={close}
              className="shrink-0 font-mono text-[0.6rem] tracking-[0.18em] text-ash-200 uppercase transition-colors hover:text-white"
            >
              {UI.close} <span aria-hidden>✕</span>
            </button>
          </div>

          <div data-role-item className="mt-6">
            <h2 id={titleId} className="text-2xl leading-tight text-white">
              {role.org}
            </h2>
            <p className="mt-2 font-mono text-[0.65rem] tracking-[0.12em] text-ash-200 uppercase">
              {role.title}
            </p>
            <p className="mt-2 font-mono text-[0.6rem] tracking-[0.18em] text-ash-300 uppercase tabular-nums">
              {role.period}
            </p>
          </div>

          <p data-role-item className="mt-8 text-sm leading-relaxed text-ash-100">
            {role.detail}
          </p>

          {sections.map((s) => (
            <section key={s.label} data-role-item className="relative mt-8">
              {/* Marca sobre la espina: cada sección cuelga de ella. */}
              <span
                aria-hidden="true"
                className="absolute top-[0.3rem] -left-8 h-px w-4 bg-white/40"
              />
              <h3 className="font-mono text-[0.6rem] tracking-[0.2em] text-ash-300 uppercase">
                {s.label}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ash-100">{s.body}</p>
            </section>
          ))}

          {role.projects.length > 0 && (
            <section data-role-item className="relative mt-8">
              <span
                aria-hidden="true"
                className="absolute top-[0.3rem] -left-8 h-px w-4 bg-white/40"
              />
              <h3 className="font-mono text-[0.6rem] tracking-[0.2em] text-ash-300 uppercase">
                {UI.relatedProjects}
              </h3>
              <ul className="mt-3 space-y-2">
                {role.projects.map((name) => (
                  <li key={name}>
                    <button
                      type="button"
                      onClick={() => onProject(name)}
                      className="flex items-center gap-2 border-b border-white/25 pb-px font-mono text-xs text-ash-100 transition-colors hover:border-white hover:text-white"
                    >
                      {name} <span aria-hidden>↗</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <ul
            data-role-item
            className="mt-10 flex flex-wrap gap-2 border-t border-white/10 pt-6"
          >
            {role.stack.map((tech) => (
              <li
                key={tech}
                className="border border-white/12 px-2.5 py-1 font-mono text-[0.6rem] text-ash-200"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
