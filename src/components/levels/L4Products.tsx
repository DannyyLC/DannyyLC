import LevelShell from "./LevelShell";
import { PRODUCTS, PRODUCTS_LEAD } from "@/lib/content";

/**
 * 10³ — el producto.
 *
 * Lo que se construye una vez y se vende muchas. Tres columnas, sin tarjetas:
 * una caja con fondo propio sobre negro puro introduce un gris que a esta
 * escala se lee como niebla. Las divide una hairline y nada más.
 */
export default function L4Products() {
  return (
    <LevelShell>
      <p className="mb-6 text-sm text-ash-200">{PRODUCTS_LEAD}</p>

      <div className="grid gap-px bg-white/10 sm:grid-cols-3">
        {PRODUCTS.map((p) => (
          <article key={p.name} className="bg-black p-5 sm:p-6">
            <div className="flex items-baseline justify-between">
              <h3 className="font-mono text-base text-white">{p.name}</h3>
              {p.href && (
                <span className="h-1 w-1 rotate-45 bg-white/60" aria-hidden />
              )}
            </div>

            <p className="mt-1 font-mono text-[0.6rem] tracking-[0.18em] text-ash-300 uppercase">
              {p.what}
            </p>

            {/* Su papel, antes que la descripción: es lo que convierte una
                ficha de producto en una pieza de portafolio. */}
            <p className="mt-4 flex items-start gap-2 text-xs text-ash-100">
              <span
                className="mt-[0.35rem] h-1 w-1 shrink-0 rotate-45 bg-white/60"
                aria-hidden
              />
              {p.role}
            </p>

            <p className="mt-3 text-xs leading-relaxed text-ash-200">
              {p.detail}
            </p>

            <p className="mt-5 font-mono text-[0.65rem] leading-relaxed text-ash-400">
              {p.stack.join(" · ")}
            </p>
          </article>
        ))}
      </div>
    </LevelShell>
  );
}
