"use client";

import LevelShell from "./LevelShell";
import PortraitSlot from "@/components/ui/PortraitSlot";
import { useContent } from "@/lib/i18n";

/**
 * La línea.
 *
 * Un paso atrás desde el caret: ahora se ve la línea completa que estaba
 * escribiendo, y alrededor de ella, quién la escribe.
 *
 * El retrato entra aquí, en la segunda pantalla. Estaba en el nivel de la
 * compañía —quinto de siete— y llegar a la cara del autor tan tarde es
 * demasiado para una página que trata sobre él.
 */
export default function L1Line() {
  const { BIO } = useContent();

  return (
    <LevelShell>
      <p className="font-mono text-sm text-ash-200 sm:text-base">
        <span className="text-ash-400">const</span> daniel ={" "}
        <span className="text-white">build</span>
        <span className="text-ash-400">(</span>
        <span className="text-ash-200">systems, that, survive, production</span>
        <span className="text-ash-400">)</span>
      </p>

      <div className="mt-10 grid gap-8 sm:grid-cols-[13rem_1fr] sm:gap-10">
        <PortraitSlot />

        <div className="space-y-5 border-l border-white/12 pl-6">
          {BIO.map((line) => (
            <p
              key={line.slice(0, 24)}
              className="text-sm leading-relaxed text-ash-200"
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </LevelShell>
  );
}
