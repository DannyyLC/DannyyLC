import LevelShell from "./LevelShell";
import { BIO } from "@/lib/content";

/**
 * 10⁰ — la línea.
 *
 * Un paso atrás desde el caret: ahora se ve la línea completa que estaba
 * escribiendo, y alrededor de ella, quién la escribe.
 */
export default function L1Line() {
  return (
    <LevelShell>
      <p className="font-mono text-sm text-ash-200 sm:text-base">
        <span className="text-ash-400">const</span> daniel ={" "}
        <span className="text-white">build</span>
        <span className="text-ash-400">(</span>
        <span className="text-ash-200">systems, that, survive, production</span>
        <span className="text-ash-400">)</span>
      </p>

      <div className="mt-10 space-y-5 border-l border-white/12 pl-6">
        {BIO.map((line) => (
          <p
            key={line.slice(0, 24)}
            className="max-w-xl text-sm leading-relaxed text-ash-200 sm:text-base"
          >
            {line}
          </p>
        ))}
      </div>
    </LevelShell>
  );
}
