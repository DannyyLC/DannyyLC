import LevelShell from "./LevelShell";
import { CONTACT } from "@/lib/content";

/**
 * 10⁸ — el punto.
 *
 * El zoom cierra donde abrió: en un punto de luz sobre negro. El caret del
 * primer nivel era esto mismo visto de cerca, y decirlo así —cerrando el
 * círculo en vez de con un formulario— es lo que convierte el recorrido en una
 * historia y no en una lista de secciones.
 */
export default function L9Contact() {
  return (
    <LevelShell frame={false} centered>
      <div className="flex flex-col items-center text-center">
        <span className="h-1.5 w-1.5 rotate-45 bg-white shadow-[0_0_18px_rgba(255,255,255,0.85)]" />

        <h2 className="mt-10 text-xl text-white sm:text-2xl">
          {CONTACT.headline}
        </h2>

        <p className="mt-4 max-w-md text-sm leading-relaxed text-ash-200">
          {CONTACT.body}
        </p>

        <ul className="mt-10 grid gap-px bg-white/10 sm:grid-cols-4">
          {CONTACT.links.map((link) => (
            <li key={link.label} className="bg-black">
              <a
                href={link.href}
                target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noreferrer"
                className="group block px-5 py-4 transition-colors hover:bg-white/4"
              >
                <span className="block font-mono text-[0.55rem] tracking-[0.2em] text-ash-400 uppercase">
                  {link.label}
                </span>
                <span className="mt-1.5 block font-mono text-xs text-ash-100 transition-colors group-hover:text-white">
                  <Breakable value={link.value} />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </LevelShell>
  );
}

/**
 * Un correo es una sola palabra para el navegador, así que sin ayuda o se
 * desborda o hay que romperlo por cualquier letra —y parte el dominio a la
 * mitad—. Esto ofrece un punto de corte antes de la arroba, que es donde una
 * dirección se lee partida de forma natural.
 */
function Breakable({ value }: { value: string }) {
  const at = value.indexOf("@");
  if (at === -1) return <>{value}</>;

  return (
    <>
      {value.slice(0, at)}
      <wbr />
      {value.slice(at)}
    </>
  );
}
