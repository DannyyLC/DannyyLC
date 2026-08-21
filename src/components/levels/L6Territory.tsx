import LevelShell from "./LevelShell";
import { TERRITORY } from "@/lib/content";

/**
 * El territorio.
 *
 * A esta escala ya no hay interfaz que mostrar, solo un lugar. Una mira sobre
 * las coordenadas reales de Aguascalientes: el zoom lleva siete niveles
 * alejándose y aquí, por fin, lo que se ve es un punto en un mapa.
 */
export default function L6Territory() {
  return (
    <LevelShell frame={false} centered>
      <div className="flex flex-col items-center text-center">
        <svg
          viewBox="0 0 240 240"
          className="w-48 sm:w-64"
          role="img"
          aria-label={`Crosshair marking ${TERRITORY.city}, ${TERRITORY.country}`}
        >
          <g
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            vectorEffect="non-scaling-stroke"
          >
            <circle cx="120" cy="120" r="112" />
            <circle cx="120" cy="120" r="76" />
            <circle cx="120" cy="120" r="40" />
            {/* Cruz partida: deja el centro libre para el marcador */}
            <path d="M120 0 V96 M120 144 V240 M0 120 H96 M144 120 H240" />
          </g>

          {/* El punto. Diamante, como el resto del sitio. */}
          <rect
            x="115"
            y="115"
            width="10"
            height="10"
            transform="rotate(45 120 120)"
            fill="#ffffff"
          />

          <g
            fontFamily="var(--font-geist-mono), monospace"
            fontSize="8"
            fill="#3d3d3d"
          >
            <text x="120" y="16" textAnchor="middle">
              N
            </text>
            <text x="228" y="123" textAnchor="middle">
              E
            </text>
          </g>
        </svg>

        <p className="mt-8 font-mono text-sm tracking-[0.2em] text-white uppercase">
          {TERRITORY.city}
        </p>
        <p className="mt-1.5 font-mono text-[0.65rem] text-ash-300 tabular-nums">
          {TERRITORY.lat.toFixed(4)}° N · {Math.abs(TERRITORY.lon).toFixed(4)}° W
        </p>

        <p className="mt-7 max-w-md text-sm leading-relaxed text-ash-200">
          {TERRITORY.body}
        </p>
      </div>
    </LevelShell>
  );
}
