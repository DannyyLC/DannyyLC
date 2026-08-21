"use client";

import LevelShell from "./LevelShell";
import Marquee from "@/components/ui/Marquee";
import { useContent } from "@/lib/i18n";

/**
 * El stack.
 *
 * Seis carruseles, uno por capa, alternando dirección. La versión anterior era
 * un árbol de texto: correcto pero muerto, y en una página que por lo demás es
 * puro tipo sobre negro, un bloque más de texto no aportaba nada. Los logos son
 * lo único figurativo del sitio y funcionan justo aquí: rompen la monotonía sin
 * romper el monocromático, porque van pintados con `currentColor`.
 *
 * Sobre el espaciado: lo que separa visualmente un grupo del siguiente no es la
 * distancia absoluta sino la *proporción* entre el hueco interno del grupo
 * (encabezado→fila) y el externo (fila→siguiente encabezado). Con 16 y 36 px la
 * razón era 2.25:1 y el encabezado se leía pegado a la fila de arriba, o sea
 * ambiguo. Aquí el hueco externo va de 40 a 64 px según la altura de pantalla,
 * lo que mantiene la razón por encima de 3.5:1 sin desbordar en laptops.
 *
 * El presupuesto de altura, por si hay que tocarlo: seis grupos de ~74 px más
 * los cinco huecos más 80 px de padding del shell dan 724 px en modo corto y
 * 844 px en el largo. Por eso el breakpoint está en 900 y no en 860 — a 860 el
 * modo largo cabría por 16 px, que es menos de lo que vale la estimación.
 */
export default function L2Skills() {
  const { SKILL_GRAPH } = useContent();

  return (
    <LevelShell wide>
      <div className="space-y-10 [@media(min-height:900px)]:space-y-16">
        {SKILL_GRAPH.map((branch, i) => (
          <div key={branch.groupKey}>
            <p className="mb-4 text-center font-mono text-[0.6rem] tracking-[0.28em] text-ash-300 uppercase">
              {branch.group}
            </p>

            {/* Cancela el padding horizontal del shell: la pista corre hasta el
                borde del marco y el difuminado de los extremos cae justo ahí,
                en vez de dejar una franja muerta a cada lado. */}
            <div className="-mx-4 md:-mx-12">
              <Marquee
                items={branch.items}
                direction={i % 2 === 0 ? "left" : "right"}
              />
            </div>
          </div>
        ))}
      </div>
    </LevelShell>
  );
}
