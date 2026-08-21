import LevelShell from "./LevelShell";
import { WORK } from "@/lib/content";

/**
 * 10⁴ — el trabajo.
 *
 * Encargos reales, con cliente y fecha. Va como tabla y no como galería porque
 * lo que importa aquí es el registro: quién, cuándo, qué se entregó. Una
 * galería de capturas diría menos y pesaría más.
 */
export default function L5Work() {
  return (
    <LevelShell>
      <ul className="divide-y divide-white/10 border-y border-white/10">
        {WORK.map((w) => (
          <li key={w.client} className="grid gap-2 py-4 sm:grid-cols-[13rem_1fr] sm:gap-6">
            <div>
              <p className="text-sm text-white">{w.client}</p>
              <p className="mt-0.5 font-mono text-[0.6rem] tracking-[0.15em] text-ash-300 uppercase">
                {w.role}
              </p>
              <p className="mt-0.5 font-mono text-[0.6rem] text-ash-400 tabular-nums">
                {w.period}
              </p>
            </div>

            <div>
              <p className="text-xs leading-relaxed text-ash-200">{w.detail}</p>
              <p className="mt-2 font-mono text-[0.6rem] text-ash-400">
                {w.stack.join(" · ")}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </LevelShell>
  );
}
