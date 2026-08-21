"use client";

import { useEffect } from "react";
import { initLang, useLang } from "@/lib/i18n";

/**
 * Pasa el sitio de "en" —lo único que el HTML prerenderizado puede servir— al
 * idioma real del visitante, ya en cliente. Ver `initLang` en `i18n.ts`.
 *
 * No pinta nada: solo dispara la detección una vez al montar y mantiene
 * `<html lang>` sincronizado con el idioma activo, que es lo que un lector de
 * pantalla usa para elegir el motor de voz correcto.
 */
export default function LanguageSync() {
  const lang = useLang();

  useEffect(() => {
    initLang();
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return null;
}
