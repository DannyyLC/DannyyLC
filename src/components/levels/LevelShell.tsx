import type { ReactNode } from "react";

/**
 * Envoltura común de todos los niveles del zoom.
 *
 * El marco de hairline es lo que hace creíble el efecto. Sin él, tres capas
 * escaladas y fundidas se leen como un cross-fade cualquiera; con él, el ojo
 * tiene un borde que seguir mientras se encoge hacia el centro, y el cerebro
 * lo interpreta como "eso que estaba viendo ahora está lejos".
 *
 * Las esquinas son marcas, no un rectángulo cerrado: un borde completo a escala
 * 6 se convierte en una caja gruesa que tapa el nivel de atrás.
 */
export default function LevelShell({
  children,
  frame = true,
  centered = false,
  wide = false,
}: {
  children: ReactNode;
  frame?: boolean;
  /** Para los niveles que componen al centro. */
  centered?: boolean;
  /**
   * Marco más ancho. Para contenido que gana con el espacio horizontal —el
   * carrusel de tecnologías, donde el ancho se traduce en más logos visibles a
   * la vez— y no para texto, que a esta medida se vuelve incómodo de leer.
   */
  wide?: boolean;
}) {
  return (
    <div className="relative flex h-screen w-screen items-center justify-center px-6">
      <div className={`relative w-full ${wide ? "max-w-6xl" : "max-w-4xl"}`}>
        {frame && <CornerMarks />}

        <div className={`px-4 py-10 md:px-12 ${centered ? "text-center" : ""}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

function CornerMarks() {
  const base = "absolute h-3 w-3 border-white/25";
  return (
    <>
      <span className={`${base} top-0 left-0 border-t border-l`} />
      <span className={`${base} top-0 right-0 border-t border-r`} />
      <span className={`${base} bottom-0 left-0 border-b border-l`} />
      <span className={`${base} right-0 bottom-0 border-r border-b`} />
    </>
  );
}
