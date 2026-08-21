"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import LevelShell from "./LevelShell";
import { CONTACT, IDENTITY } from "@/lib/content";

/** Segundos por carácter. El mismo ritmo del hero, para que sea el mismo gesto. */
const CPS = 0.038;

/**
 * El punto.
 *
 * El zoom cierra donde abrió: en un punto de luz sobre negro.
 *
 * Y con el mismo gesto. El sitio arranca con un caret tecleando su nombre y
 * termina con un caret tecleando su correo — la primera pantalla dice quién es
 * y la última dice cómo escribirle, con la misma mecánica. Cierra el círculo
 * sin necesidad de anunciarlo, y de paso le da un suceso propio al último
 * nivel, que era el tercero seguido sin ninguno.
 */
export default function L6Contact({ active }: { active?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const mail = useRef<HTMLSpanElement>(null);
  const caret = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = mail.current;
      const caretEl = caret.current;
      if (!el || !caretEl) return;

      const full = IDENTITY.email;

      if (!active || prefersReducedMotion()) {
        el.textContent = full;
        caretEl.classList.add("caret");
        return;
      }

      el.textContent = "";
      // Sólido mientras teclea, parpadeante al terminar. Igual que en el hero:
      // una terminal real no parpadea mientras hay escritura.
      caretEl.classList.remove("caret");

      const typed = { n: 0 };
      let painted = -1;

      gsap.to(typed, {
        n: full.length,
        duration: full.length * CPS,
        ease: "none",
        delay: 0.25,
        onUpdate: () => {
          const n = Math.floor(typed.n);
          if (n === painted) return;
          painted = n;
          el.textContent = full.slice(0, n);
        },
        onComplete: () => {
          el.textContent = full;
          caretEl.classList.add("caret");
        },
      });
    },
    { scope: root, dependencies: [active] },
  );

  return (
    <div ref={root}>
      {/* `wide` para que el cierre ocupe la pantalla: es la última cosa que
          se ve y a medida normal quedaba flotando en mucho negro. */}
      <LevelShell frame={false} centered wide>
        <div className="flex flex-col items-center text-center">
          <span className="h-2.5 w-2.5 rotate-45 bg-white shadow-[0_0_28px_rgba(255,255,255,0.9)]" />

          <h2 className="mt-14 text-3xl leading-tight text-white sm:text-5xl">
            {CONTACT.headline}
          </h2>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-ash-200 sm:text-lg">
            {CONTACT.body}
          </p>

          {/* El correo, tecleándose. Es el enlace que de verdad importa, así que
              sale del cuadrilátero de abajo y se queda con el gesto del sitio. */}
          <a
            href={`mailto:${IDENTITY.email}`}
            className="group mt-14 inline-flex items-center font-mono text-base text-white transition-colors hover:text-ash-100 sm:text-2xl"
          >
            <span ref={mail} className="break-all" />
            <span
              ref={caret}
              aria-hidden="true"
              className="ml-0.5 inline-block w-[0.5ch] bg-white"
              style={{ height: "1.05em" }}
            />
          </a>

          <p className="mt-5 font-mono text-[0.7rem] tracking-[0.25em] text-ash-400 uppercase">
            {CONTACT.location}
          </p>

          <ul className="mt-16 w-full max-w-3xl grid gap-px bg-white/10 sm:grid-cols-3">
            {CONTACT.links
              // El correo ya está arriba, tecleándose. Repetirlo en la rejilla
              // le quitaría el peso que acaba de ganarse.
              .filter((link) => !link.href.startsWith("mailto:"))
              .map((link) => (
                <li key={link.label} className="bg-black">
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group block px-6 py-6 transition-colors hover:bg-white/4"
                  >
                    <span className="block font-mono text-[0.6rem] tracking-[0.25em] text-ash-400 uppercase">
                      {link.label}
                    </span>
                    <span className="mt-2.5 block font-mono text-sm text-ash-100 transition-colors group-hover:text-white">
                      {link.value}
                    </span>
                  </a>
                </li>
              ))}
          </ul>
        </div>
      </LevelShell>
    </div>
  );
}
