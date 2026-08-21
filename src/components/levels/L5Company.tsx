import LevelShell from "./LevelShell";
import { COMPANY, IDENTITY } from "@/lib/content";

/**
 * La compañía.
 *
 * El único nivel donde aparece una cara. Va aquí y no en el hero a propósito:
 * abrir con un retrato convierte el sitio en un perfil, y este sitio es un
 * recorrido por sistemas que resulta que tienen un autor. Se llega a la persona
 * después de ver lo que construyó.
 */
export default function L5Company() {
  return (
    <LevelShell>
      <div className="grid gap-8 sm:grid-cols-[13rem_1fr] sm:gap-10">
        <PortraitSlot />

        <div>
          {/* Su papel encabeza, no el nombre de la empresa. Al revés el nivel
              se leía como un "sobre nosotros" y no como parte de su historia. */}
          <h2 className="font-mono text-lg text-white sm:text-xl">
            {COMPANY.role}
          </h2>
          <p className="mt-1 font-mono text-[0.6rem] tracking-[0.2em] text-ash-300 uppercase">
            {COMPANY.name} · since {COMPANY.since}
          </p>

          <p className="mt-5 max-w-xl text-sm leading-relaxed text-ash-200">
            {COMPANY.body}
          </p>

          <ul className="mt-6 space-y-2">
            {COMPANY.pillars.map((p) => (
              <li key={p.label} className="flex gap-3 text-xs">
                <span className="mt-[0.4rem] h-1 w-1 shrink-0 rotate-45 bg-white/50" />
                <span className="font-mono text-ash-200">{p.label}</span>
                <span className="text-ash-400">{p.body}</span>
              </li>
            ))}
          </ul>

          <a
            href={COMPANY.url}
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-block border-b border-white/30 pb-0.5 font-mono text-xs text-white transition-colors hover:border-white"
          >
            {IDENTITY.companyDomain} ↗
          </a>
        </div>
      </div>
    </LevelShell>
  );
}

/**
 * Hueco del retrato.
 *
 * Placeholder a propósito y no una silueta genérica: cuando llegue la foto real
 * entra aquí en duotono a negro puro y el encuadre no se mueve ni un pixel.
 * Sustituir por <Image /> con `grayscale contrast-125` y este mismo aspecto.
 */
function PortraitSlot() {
  return (
    <div className="relative aspect-3/4 w-full max-w-52 border border-white/12">
      <div className="star-dust twinkle absolute inset-0" />

      <div className="absolute inset-0 flex items-end p-3">
        <p className="font-mono text-[0.55rem] leading-relaxed tracking-[0.15em] text-ash-400 uppercase">
          portrait
          <br />
          pending
        </p>
      </div>

      {/* Marcas de encuadre, como visor de cámara */}
      <span className="absolute top-2 left-2 h-2 w-2 border-t border-l border-white/40" />
      <span className="absolute right-2 bottom-2 h-2 w-2 border-r border-b border-white/40" />
    </div>
  );
}
