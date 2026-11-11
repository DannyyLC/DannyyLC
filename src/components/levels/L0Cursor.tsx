"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useContent } from "@/lib/i18n";
import { markIntroDone } from "@/lib/intro";

/** Segundos por carácter. Ritmo de tecleo, no de animación. */
const CPS = 0.052;

/**
 * El cursor.
 *
 * El nivel más pequeño del sitio y su tesis. No hay imagen, no hay fondo, no
 * hay adorno: un caret que escribe un nombre sobre negro. Si esto no aguanta
 * cinco segundos de silencio, el resto del zoom tampoco va a aguantar.
 */
export default function L0Cursor() {
  const { IDENTITY, DOMAINS, THESIS, UI } = useContent();
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
        markIntroDone();
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
          // El dial se calibra y el polvo suelta su onda a partir de aquí.
          markIntroDone();
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
      className="relative flex h-screen w-screen flex-col items-center justify-center px-6 text-center"
    >
      {/* El marco del primer nivel, casi en los bordes de la pantalla.
          Los demás niveles tienen marcas de esquina que el ojo sigue mientras
          se encogen; este no tenía ninguna, así que el primer alejamiento era
          el único sin nada que lo delatara. Van grandes y pegadas al borde
          para que se lean como el límite de lo que cabe en pantalla. */}
      <div className="pointer-events-none absolute inset-14 md:inset-16" aria-hidden="true">
        <span className="absolute top-0 left-0 h-10 w-10 border-t border-l border-white/15" />
        <span className="absolute top-0 right-0 h-10 w-10 border-t border-r border-white/15" />
        <span className="absolute bottom-0 left-0 h-10 w-10 border-b border-l border-white/15" />
        <span className="absolute right-0 bottom-0 h-10 w-10 border-r border-b border-white/15" />
      </div>

      <h1 className="relative inline-block font-mono text-2xl font-medium tracking-tight text-white sm:text-4xl md:text-5xl">
        <span className="hero-name">{IDENTITY.name}</span>
        <span
          ref={caret}
          aria-hidden="true"
          // `data-zoom-origin`: de aquí sale la onda de polvo al terminar de
          // teclear. El glow es el mismo del punto final — el sitio empieza y
          // termina en una luz.
          data-zoom-origin
          className="absolute top-1/2 left-0 block w-[0.5ch] bg-white shadow-[0_0_16px_rgba(255,255,255,0.75)]"
          style={{ height: "0.92em" }}
        />
      </h1>

      <p className="hero-domains mt-7 font-mono text-[0.7rem] tracking-[0.25em] text-ash-200 uppercase sm:text-xs">
        {DOMAINS.join(" · ")}
      </p>

      <p className="hero-thesis mt-14 max-w-lg text-sm leading-relaxed text-ash-300 sm:text-base">
        {THESIS}
      </p>

      {/* La indicación de scroll: el texto, y debajo una línea por la que cae
          un diamante, el mismo del índice del dial. Antes era solo el texto en
          `ash-400`, que sobre negro casi no existía, y es lo único de esta
          pantalla que le pide algo a quien llega. */}
      <div className="hero-cue absolute bottom-10 flex flex-col items-center gap-4">
        <p className="font-mono text-[0.6rem] tracking-[0.3em] text-ash-300 uppercase">
          {UI.scrollCue}
        </p>
        <span className="relative block h-10 w-px bg-white/15" aria-hidden="true">
          <span className="cue-drop absolute top-0 -left-[2.5px] block h-1.5 w-1.5 rotate-45 bg-white" />
        </span>
      </div>
    </div>
  );
}
