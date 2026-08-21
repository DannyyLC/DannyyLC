import LevelShell from "./LevelShell";
import { COMPANY, IDENTITY } from "@/lib/content";

/**
 * La compañía.
 *
 * Aquí va la marca, no la cara: el retrato se mudó a `about`, donde llega en la
 * segunda pantalla en vez de en la quinta. Este nivel trata de Fractal, así que
 * lo que corresponde en la columna es su logotipo.
 *
 * El logo va en SVG y no en PNG por el zoom: este nivel cruza la pantalla a
 * escala 6 antes de asentarse en 1, y un mapa de bits a seis aumentos se
 * deshace. Además sus trazos ya son blancos, así que encaja en el
 * monocromático sin tocarlo.
 */
export default function L5Company() {
  return (
    <LevelShell>
      <div className="grid gap-8 sm:grid-cols-[13rem_1fr] sm:gap-10">
        <CompanyMark />

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
 * Marca de la compañía.
 *
 * El recuadro es cuadrado, no 3:4 como el del retrato. Una caja vertical con un
 * logotipo cuadrado dentro deja franjas muertas arriba y abajo por geometría, y
 * el logo se ve pequeño por más que se agrande: el problema no era su tamaño
 * sino la forma del hueco. Igualada la proporción, el logo ocupa el 88% del
 * ancho y el aire que queda es margen deliberado, no sobra.
 *
 * El relleno no baja de 12px: por debajo de eso el logo empieza a tocar las
 * marcas de encuadre de las esquinas y el recuadro deja de leerse como un
 * marco para parecer un borde recortado.
 */
function CompanyMark() {
  return (
    <div className="relative flex aspect-square w-full max-w-52 items-center justify-center border border-white/12 p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logos/fractal.svg"
        alt="Fractal"
        className="w-full"
        width={1024}
        height={1024}
      />

      <span className="absolute top-2 left-2 h-2 w-2 border-t border-l border-white/40" />
      <span className="absolute right-2 bottom-2 h-2 w-2 border-r border-b border-white/40" />
    </div>
  );
}
