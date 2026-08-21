import type { NextConfig } from "next";

/**
 * La exportación estática se activa con `PAGES=1`, no por defecto.
 *
 * `output: "export"` renuncia para siempre a las route handlers, las server
 * actions, la generación de OG images en runtime y el ISR. El sitio hoy no usa
 * ninguna, pero dejarlo puesto en el config convertiría una decisión de
 * despliegue en una limitación permanente del proyecto. Así, `pnpm build`
 * sigue siendo un build normal y solo el workflow de Pages exporta.
 */
const pages = process.env.PAGES === "1";

/**
 * Prefijo de ruta cuando el sitio NO vive en la raíz del dominio.
 *
 * Vacío si el repo se llama `<usuario>.github.io` (se sirve en la raíz).
 * `/<repo>` para cualquier otro nombre, o los assets apuntarían a rutas que no
 * existen.
 */
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  ...(pages
    ? {
        output: "export",
        // El optimizador de imágenes necesita un servidor. No hay ninguna
        // imagen en el sitio hoy, pero esto evita que meter un `next/image`
        // más adelante rompa la exportación sin explicar por qué.
        images: { unoptimized: true },
      }
    : {}),
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
