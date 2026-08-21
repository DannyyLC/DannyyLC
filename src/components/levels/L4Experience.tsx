import LevelShell from "./LevelShell";
import { EXPERIENCE } from "@/lib/content";

/**
 * Experiencia — puestos, con fechas.
 *
 * Va en tabla y no en tarjetas a propósito, aunque el nivel anterior sí las
 * use: aquí lo que se escanea es quién, qué puesto y cuándo, y una tabla
 * entrega esas tres columnas de un vistazo. Que los dos niveles usen formatos
 * distintos no es incoherencia, es que el contenido es distinto — una lista de
 * proyectos se recorre, un historial se escanea.
 */
export default function L4Experience() {
  return (
    <LevelShell>
      <p className="mb-8 text-center font-mono text-sm tracking-[0.3em] text-ash-100 uppercase sm:text-base">
        Experience
      </p>

      <ul className="divide-y divide-white/10 border-y border-white/10">
        {EXPERIENCE.map((role) => (
          <li
            key={role.org}
            className="grid gap-2 py-4 sm:grid-cols-[15rem_1fr] sm:gap-6"
          >
            <div>
              <p className="text-sm text-white">{role.org}</p>
              <p className="mt-0.5 font-mono text-[0.6rem] tracking-[0.15em] text-ash-300 uppercase">
                {role.title}
              </p>
              <p className="mt-0.5 font-mono text-[0.6rem] text-ash-400 tabular-nums">
                {role.period}
              </p>
            </div>

            <div>
              <p className="text-xs leading-relaxed text-ash-200">
                {role.detail}
              </p>

              <p className="mt-2 font-mono text-[0.6rem] text-ash-400">
                {role.stack.join(" · ")}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </LevelShell>
  );
}
