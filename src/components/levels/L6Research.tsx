"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import LevelShell from "./LevelShell";
import { RESEARCH } from "@/lib/content";

/**
 * 10⁵ — la investigación.
 *
 * Este nivel existe porque los números se ganaron su propio momento. "8.9% de
 * reducción en distancia coseno sobre 252 preguntas" es lo único en todo el
 * sitio que está medido contra una línea base, y enterrarlo en una lista de
 * viñetas sería desperdiciarlo.
 *
 * Los contadores corren cuando el nivel entra en foco, no al montar: montado
 * está desde el primer frame, a escala 6⁵ y fuera de cuadro.
 */
export default function L6Research({ active }: { active?: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!active || prefersReducedMotion()) return;

      const nodes = gsap.utils.toArray<HTMLElement>("[data-count]");

      nodes.forEach((node) => {
        const target = Number(node.dataset.count);
        const decimals = (node.dataset.count ?? "").split(".")[1]?.length ?? 0;
        const proxy = { n: 0 };

        gsap.to(proxy, {
          n: target,
          duration: 1.4,
          ease: "power2.out",
          onUpdate: () => {
            node.textContent = proxy.n.toFixed(decimals);
          },
        });
      });
    },
    { scope: root, dependencies: [active] },
  );

  return (
    <div ref={root}>
      <LevelShell>
        <h2 className="max-w-lg text-lg leading-snug text-white sm:text-xl">
          {RESEARCH.title}
        </h2>
        <p className="mt-2 font-mono text-[0.65rem] tracking-[0.15em] text-ash-300 uppercase">
          {RESEARCH.institution} · {RESEARCH.projectId} · {RESEARCH.period}
        </p>

        <p className="mt-5 max-w-xl text-sm leading-relaxed text-ash-200">
          {RESEARCH.body}
        </p>

        <dl className="mt-10 grid grid-cols-3 gap-px bg-white/10">
          {RESEARCH.metrics.map((m) => (
            <div key={m.label} className="bg-black py-6 pr-4">
              <dt className="sr-only">{m.label}</dt>
              <dd>
                <span className="font-mono text-3xl text-white tabular-nums sm:text-5xl">
                  <span data-count={m.value}>{active ? "0" : m.value}</span>
                  {m.unit}
                </span>
                <span className="mt-2 block max-w-[10rem] text-[0.7rem] leading-snug text-ash-300">
                  {m.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </LevelShell>
    </div>
  );
}
