"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/**
 * La marca de Fractal, dibujándose.
 *
 * El logotipo son dos formas rellenas, no trazos, así que el recurso habitual
 * —animar `stroke-dashoffset` para que una línea se dibuje sola— no aplica: no
 * hay línea que recorrer. Lo que se anima es un `clipPath` que barre de abajo
 * hacia arriba y va destapando cada forma.
 *
 * Barre hacia arriba y no hacia abajo porque el chevron apunta hacia arriba: la
 * revelación sigue la dirección de la figura y se lee como si creciera, no como
 * si cayera. Las dos formas van escalonadas, para que se note que son dos.
 *
 * Va inline y no como `<img>` por esto mismo: un archivo externo no deja
 * animar sus partes. Y en SVG porque el nivel cruza la pantalla a escala 6
 * antes de asentarse en 1, donde un mapa de bits se deshace.
 */
export default function FractalMark({ active }: { active?: boolean }) {
  const root = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const wipes = gsap.utils.toArray<SVGRectElement>("[data-wipe]");
      if (wipes.length === 0) return;

      if (!active) {
        // Fuera de foco se deja completamente visible: si el nivel se abandona
        // a media animación, volver no debe encontrar el logo a medio dibujar.
        gsap.set(wipes, { attr: { y: 0, height: 1024 } });
        return;
      }

      gsap.fromTo(
        wipes,
        { attr: { y: 1024, height: 0 } },
        {
          attr: { y: 0, height: 1024 },
          duration: 0.9,
          ease: "power2.out",
          stagger: 0.18,
        },
      );
    },
    { scope: root, dependencies: [active] },
  );

  return (
    <svg
      ref={root}
      viewBox="0 0 1024 1024"
      className="w-full"
      role="img"
      aria-label="Fractal"
    >
      <defs>
        <clipPath id="fractal-wipe-0">
          <rect data-wipe x="0" y="0" width="1024" height="1024" />
        </clipPath>
        <clipPath id="fractal-wipe-1">
          <rect data-wipe x="0" y="0" width="1024" height="1024" />
        </clipPath>
      </defs>

      <path fill="currentColor" clipPath="url(#fractal-wipe-0)" d="M583.435425,364.039764 C560.203735,325.700500 536.972107,287.361237 513.740479,249.021973 C513.119629,249.072769 512.498840,249.123581 511.878021,249.174377 C463.416992,329.324860 414.955963,409.475311 365.877289,490.647278 C383.270386,490.647278 399.076721,490.496033 414.876709,490.745728 C419.232635,490.814545 421.860535,489.490692 424.164032,485.733856 C447.835144,447.127502 471.675079,408.624664 495.457733,370.086670 C501.026306,361.063232 506.556519,352.016113 512.667480,342.062653 C516.932739,348.805237 520.680542,354.620819 524.321228,360.502747 C550.083862,402.125275 575.864563,443.736755 601.505371,485.434235 C603.865906,489.272949 606.496338,490.870026 611.111389,490.760437 C624.598633,490.440186 638.098389,490.662933 651.593079,490.626190 C653.702820,490.620422 655.968933,491.105194 659.000122,488.575928 C633.919861,447.282043 608.839600,405.988129 583.435425,364.039764z" />
      <path fill="currentColor" clipPath="url(#fractal-wipe-1)" d="M625.648743,595.785889 C619.286377,585.624329 612.892212,575.482544 606.567139,565.297852 C576.872742,517.483521 547.204834,469.652710 517.505676,421.841339 C513.849915,415.956177 511.891876,416.083649 508.188873,422.045319 C466.719116,488.810364 425.288116,555.599609 383.718353,622.302368 C353.068359,671.483337 322.220490,720.540894 291.508759,769.683472 C290.412781,771.437134 288.686829,773.023743 288.929718,775.389832 C290.602783,777.183533 292.723114,776.618103 294.650452,776.623413 C310.479431,776.666992 326.310089,776.532715 342.136658,776.732666 C345.981689,776.781250 348.185486,775.375549 350.174042,772.210449 C364.081970,750.073730 378.292145,728.125488 392.047699,705.895447 C394.909882,701.270020 398.123993,699.877441 403.353394,699.884583 C496.494965,700.011902 589.636841,699.961853 682.778625,699.905518 C684.823120,699.904236 687.092651,700.611145 689.620972,698.286865 C668.439636,664.363892 647.225281,630.388000 625.648743,595.785889z M502.999939,645.317627 C478.591156,645.317749 454.682404,645.317749 429.006653,645.317749 C457.326935,600.179626 484.773254,556.434448 512.826416,511.722107 C540.926270,556.245117 568.566345,600.039551 597.142700,645.317505 C564.876038,645.317505 534.187988,645.317505 502.999939,645.317627z" />
    </svg>
  );
}
