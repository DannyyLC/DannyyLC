"use client";

import LevelShell from "./LevelShell";
import PortraitSlot from "@/components/ui/PortraitSlot";
import { useContent } from "@/lib/i18n";
import { TECH_ICON_PATHS } from "@/lib/tech-icons";

/**
 * La línea.
 *
 * Un paso atrás desde el caret: ahora se ve la línea completa que estaba
 * escribiendo, y alrededor de ella, quién la escribe.
 *
 * El retrato entra aquí, en la segunda pantalla. Estaba en el nivel de la
 * compañía —quinto de siete— y llegar a la cara del autor tan tarde es
 * demasiado para una página que trata sobre él.
 *
 * Formación, idioma, habilidades blandas y certificaciones viven aquí abajo
 * de la bio: son datos personales, no técnicos, así que no van en `stack`.
 */
export default function L1Line() {
  const { BIO, EDUCATION, LANGUAGE, SOFT_SKILLS, CERTIFICATIONS, UI } = useContent();

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

          <div className="space-y-1 pt-1">
            <p className="font-mono text-[0.6rem] tracking-[0.2em] text-ash-300 uppercase">
              {EDUCATION.degree} · {EDUCATION.school} · {EDUCATION.period}
            </p>
            <p className="font-mono text-[0.6rem] tracking-[0.2em] text-ash-400 uppercase">
              {LANGUAGE}
            </p>
          </div>

          <div>
            <p className="font-mono text-[0.55rem] tracking-[0.22em] text-ash-400 uppercase">
              {UI.softSkillsLabel}
            </p>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
              {SOFT_SKILLS.map((skill) => (
                <li key={skill} className="flex items-center gap-2 text-xs text-ash-200">
                  <span
                    className="h-1 w-1 shrink-0 rotate-45 bg-white/50"
                    aria-hidden
                  />
                  {skill}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[0.55rem] tracking-[0.22em] text-ash-400 uppercase">
              {UI.certificationsLabel}
            </p>
            <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {CERTIFICATIONS.map((c) => (
                <li
                  key={c.title}
                  className="flex items-start gap-2.5 border border-white/10 p-2.5"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ash-300"
                    fill="currentColor"
                    role="img"
                    aria-label={c.issuer}
                  >
                    <path d={TECH_ICON_PATHS[c.issuer]} />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-[0.7rem] leading-snug text-ash-100">{c.title}</p>
                    <p className="mt-0.5 font-mono text-[0.55rem] text-ash-400">
                      {c.issuer} · {c.date}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </LevelShell>
  );
}
