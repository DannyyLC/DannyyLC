"use client";

import { useLang, setLang } from "@/lib/i18n";
import type { Lang } from "@/lib/content";

/**
 * Cambio de idioma. Discreto a propósito: dos iniciales, en el mismo
 * lenguaje visual que el resto del sitio —mono, versalitas, blanco sobre ash
 * según cuál esté activo— y no un selector con bandera o globo que llamaría
 * la atención sobre sí mismo en una página que por lo demás es puro tipo
 * sobre negro.
 *
 * Ya no es un control flotante propio: vive embebido dentro del panel de
 * `NavMenu`, que es quien decide su posición fija en la página. Antes se
 * montaba como hijo directo de `page.tsx` con su propio `position: fixed`
 * para alcanzarse en móvil sin depender del breakpoint de `ScaleHUD`; ese
 * requisito lo hereda ahora `NavMenu` en su lugar.
 */
export default function LanguageToggle() {
  const lang = useLang();

  return (
    <div
      className="flex items-center gap-1.5 font-mono text-[0.65rem] tracking-[0.18em] uppercase"
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
