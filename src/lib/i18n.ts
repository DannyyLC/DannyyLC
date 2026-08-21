"use client";

import { useSyncExternalStore } from "react";
import { getContent, type Lang } from "./content";

const STORAGE_KEY = "lang";

/**
 * Estado del idioma, en un store de módulo y no en Context.
 *
 * Es una sola preferencia global para toda la página, no algo que un
 * subárbol necesite anular — igual que `prefersReducedMotion` en `gsap.ts`,
 * no hace falta la maquinaria de un Provider para eso.
 */
let current: Lang = "en";
let listeners: Array<() => void> = [];

function emit() {
  for (const l of listeners) l();
}

function isLang(v: string | null): v is Lang {
  return v === "en" || v === "es";
}

/** Preferencia guardada, o la del navegador si nunca se eligió una. Solo en cliente. */
function detect(): Lang {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch {
    // localStorage puede estar bloqueado (navegación privada, cookies
    // desactivadas). Seguir sin recordar la preferencia es mejor que romper
    // el sitio.
  }
  return navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
}

/**
 * Se llama una sola vez, al montar el sitio (ver `LanguageSync`).
 *
 * El HTML prerenderizado sirve inglés — es lo único que una exportación
 * estática puede saber de antemano — así que el snapshot de servidor de
 * `useLang` es `"en"` y esta función lo corrige ya en cliente. Mismo patrón
 * que describe CLAUDE.md para valores que difieren entre servidor y cliente:
 * nunca se pisa el primer pintado con una constante, se corrige después.
 */
export function initLang() {
  const detected = detect();
  if (detected !== current) {
    current = detected;
    emit();
  }
}

export function setLang(lang: Lang) {
  if (lang === current) return;
  current = lang;
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Igual que arriba: no persistir no debería romper el cambio en curso.
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): Lang {
  return current;
}

function getServerSnapshot(): Lang {
  return "en";
}

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** El contenido del sitio en el idioma activo. Reactivo a `setLang`. */
export function useContent() {
  return getContent(useLang());
}
