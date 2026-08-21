import LevelShell from "./LevelShell";
import { SYSTEM } from "@/lib/content";

/**
 * 10² — el sistema.
 *
 * La arquitectura de Tesseract, en SVG. Va en SVG y no en cajas de HTML por una
 * razón concreta del zoom: este nivel se cruza en pantalla a escala 6 antes de
 * asentarse en 1, y un trazo vectorial aguanta esa ampliación sin romperse.
 * Un borde de 1px de CSS a escala 6 se ve como un borde de 6px.
 */
export default function L3System() {
  return (
    <LevelShell>
      <h2 className="font-mono text-lg text-white sm:text-xl">{SYSTEM.name}</h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-ash-200">
        {SYSTEM.tagline}
      </p>

      <svg
        viewBox="0 0 520 230"
        className="mt-8 w-full font-mono"
        role="img"
        aria-label="Tesseract architecture: web client and gateway and agents, with a Postgres store"
      >
        <g
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1"
          fill="none"
          vectorEffect="non-scaling-stroke"
        >
          {/* Aristas. Se detienen antes del nodo para dejarle sitio al diamante. */}
          <path d="M130 52 H196" />
          <path d="M320 52 H386" />
          <path d="M260 88 V146" />

          {/* Puntas: diamantes, no flechas. Es el motivo de la casa. */}
          <rect x="193" y="49" width="6" height="6" transform="rotate(45 196 52)" fill="rgba(255,255,255,0.5)" stroke="none" />
          <rect x="383" y="49" width="6" height="6" transform="rotate(45 386 52)" fill="rgba(255,255,255,0.5)" stroke="none" />
          <rect x="257" y="143" width="6" height="6" transform="rotate(45 260 146)" fill="rgba(255,255,255,0.5)" stroke="none" />

          {/* Nodos. 72 de alto: las tres líneas de texto necesitan 58 más aire. */}
          <rect x="10" y="16" width="120" height="72" />
          <rect x="200" y="16" width="120" height="72" />
          <rect x="390" y="16" width="120" height="72" />
          <rect x="200" y="150" width="120" height="72" />
        </g>

        <g textAnchor="middle">
          {SYSTEM.nodes.map((node, i) => {
            const pos = [
              { x: 70, y: 16 },
              { x: 260, y: 16 },
              { x: 450, y: 16 },
              { x: 260, y: 150 },
            ][i];
            return (
              <g key={node.id}>
                <text x={pos.x} y={pos.y + 26} fill="#ededed" fontSize="12">
                  {node.label}
                </text>
                <text x={pos.x} y={pos.y + 44} fill="#6b6b6b" fontSize="9">
                  {node.stack}
                </text>
                <text x={pos.x} y={pos.y + 58} fill="#3d3d3d" fontSize="7.5">
                  {node.note}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      <p className="mt-8 font-mono text-[0.6rem] tracking-[0.2em] text-ash-300 uppercase">
        {SYSTEM.mechanicsLead}
      </p>

      <ul className="mt-4 grid gap-5 sm:grid-cols-3">
        {SYSTEM.mechanics.map((m) => (
          <li key={m.title}>
            <p className="font-mono text-[0.7rem] text-white">{m.title}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-ash-300">
              {m.body}
            </p>
          </li>
        ))}
      </ul>
    </LevelShell>
  );
}
