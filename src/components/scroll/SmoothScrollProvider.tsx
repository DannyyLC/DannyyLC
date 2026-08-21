"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

/**
 * Smooth-scroll con Lenis, sincronizado con el ticker de GSAP.
 *
 * En este sitio no es un lujo: el zoom lee `progress` en cada frame y lo
 * convierte en una potencia. La rueda del mouse entrega saltos discretos, y
 * elevados a la potencia del zoom esos saltos se vuelven brincos de escala
 * enormes. Lenis interpola la posición antes de que ScrollTrigger la lea.
 *
 * Se apaga por completo bajo `prefers-reduced-motion` — ahí el scroll nativo es
 * exactamente lo que el usuario pidió, y `ZoomStage` ya sirve el contenido
 * apilado en ese caso.
 */
export default function SmoothScrollProvider() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      // lerp bajo: suaviza el escalonamiento sin que se sienta que el scroll
      // "flota" o que la página responde tarde.
      lerp: 0.09,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    // ScrollTrigger tiene que leer la posición interpolada de Lenis, no la del
    // navegador, o el zoom va desfasado respecto al scroll real.
    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    // lagSmoothing hace que GSAP "recupere" tiempo tras un frame largo, lo que
    // en scroll interpolado se ve como un salto. Se desactiva.
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, []);

  return null;
}
