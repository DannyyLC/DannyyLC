"use client";

import { useLang, setLang } from "@/lib/i18n";
import type { Lang } from "@/lib/content";

/**
 * Cambio de idioma. Discreto a propósito: dos iniciales en una esquina fija,
 * en el mismo lenguaje visual que el resto del sitio —mono, versalitas,
 * blanco sobre ash según cuál esté activo— y no un selector con bandera o
 * globo que llamaría la atención sobre sí mismo en una página que por lo
 * demás es puro tipo sobre negro.
 *
 * Vive fuera de `ZoomStage`, como hijo directo de `page.tsx`: `position:
 * fixed` lo saca del flujo igual que a `ScaleHUD`, pero a diferencia de ese
 * HUD —oculto por debajo de `md`— este control tiene que alcanzarse también
 * en móvil, así que no hereda su breakpoint.
 */
export default function LanguageToggle() {
  const lang = useLang();

  return (
    <div
      className="fixed top-5 right-5 z-50 flex items-center gap-1.5 font-mono text-[0.65rem] tracking-[0.18em] uppercase sm:top-6 sm:right-6"
      role="group"
      aria-label="Language"
    >
      <LangOption code="en" label="EN" active={lang === "en"} />
      <span className="text-ash-500" aria-hidden="true">
        /
      </span>
      <LangOption code="es" label="ES" active={lang === "es"} />
    </div>
  );
}

function LangOption({
  code,
  label,
  active,
}: {
  code: Lang;
  label: string;
  active: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => setLang(code)}
      aria-pressed={active}
      aria-label={code === "en" ? "English" : "Español"}
      className={`transition-colors ${
        active ? "text-white" : "text-ash-400 hover:text-ash-100"
      }`}
    >
      {label}
    </button>
  );
}
