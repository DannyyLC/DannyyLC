"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { IDENTITY, DOMAINS, THESIS } from "@/lib/content";

/** Segundos por carácter. Ritmo de tecleo, no de animación. */
const CPS = 0.052;

/**
 * 10⁻¹ — el cursor.
 *
 * El nivel más pequeño del sitio y su tesis. No hay imagen, no hay fondo, no
 * hay adorno: un caret que escribe un nombre sobre negro. Si esto no aguanta
 * cinco segundos de silencio, el resto del zoom tampoco va a aguantar.
 */
export default function L0Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const caret = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const caretEl = caret.current;
      if (!caretEl) return;

      const split = new SplitText(".hero-name", { type: "chars" });
      const chars = split.chars as HTMLElement[];

      /** Borde derecho del carácter `n-1`, que es donde va el caret. */
      const edgeAfter = (n: number) => {
        if (n <= 0) return 0;
        const c = chars[Math.min(n, chars.length) - 1];
        return c.offsetLeft + c.offsetWidth;
      };

      if (prefersReducedMotion()) {
        gsap.set(caretEl, { x: edgeAfter(chars.length), yPercent: -50 });
        caretEl.classList.add("caret");
        return () => split.revert();
      }

      gsap.set(chars, { opacity: 0 });
      gsap.set(caretEl, { x: 0, yPercent: -50 });

      // El caret no parpadea mientras se escribe —una terminal real lo deja
      // sólido mientras hay tecleo— y recupera el parpadeo al terminar.
      caretEl.classList.remove("caret");

      const typed = { n: 0 };
      let painted = 0;

      const tl = gsap.timeline({ delay: 0.35 });

      tl.to(typed, {
        n: chars.length,
        duration: chars.length * CPS,
        ease: "none",
        onUpdate: () => {
          const n = Math.floor(typed.n);
          if (n === painted) return;

          // Solo se tocan los caracteres que cambiaron desde el frame anterior.
          for (let k = painted; k < n; k++) chars[k].style.opacity = "1";
          painted = n;

          gsap.set(caretEl, { x: edgeAfter(n) });
        },
        onComplete: () => {
          for (const c of chars) c.style.opacity = "1";
          gsap.set(caretEl, { x: edgeAfter(chars.length) });
          caretEl.classList.add("caret");
        },
      })
        .from(
          ".hero-domains",
          { opacity: 0, y: 6, duration: 0.7, ease: "power2.out" },
          "+=0.2",
        )
        .from(
          ".hero-thesis",
          { opacity: 0, duration: 1.1, ease: "power2.out" },
          "-=0.35",
        )
        .from(".hero-cue", { opacity: 0, duration: 0.8 }, "-=0.5");

      return () => split.revert();
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="flex h-screen w-screen flex-col items-center justify-center px-6 text-center"
    >
      <h1 className="relative inline-block font-mono text-2xl font-medium tracking-tight text-white sm:text-4xl md:text-5xl">
        <span className="hero-name">{IDENTITY.name}</span>
        <span
          ref={caret}
          aria-hidden="true"
          className="absolute top-1/2 left-0 block w-[0.5ch] bg-white"
          style={{ height: "0.92em" }}
        />
      </h1>

      <p className="hero-domains mt-7 font-mono text-[0.7rem] tracking-[0.25em] text-ash-200 uppercase sm:text-xs">
        {DOMAINS.join(" · ")}
      </p>

      <p className="hero-thesis mt-14 max-w-lg text-sm leading-relaxed text-ash-300 sm:text-base">
        {THESIS}
      </p>

      <p className="hero-cue absolute bottom-12 font-mono text-[0.6rem] tracking-[0.3em] text-ash-400 uppercase">
        scroll to pull back
      </p>
    </div>
  );
}
