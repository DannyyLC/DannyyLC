/**
 * La señal de "el nombre ya terminó de teclearse".
 *
 * El inicio encadena tres cosas que viven en componentes distintos: el caret
 * termina de escribir (`L0Cursor`), el dial se calibra (`ScaleHUD`) y el polvo
 * suelta una onda desde el caret (`ZoomStage` → `DepthDust`). Esto es lo único
 * que las une: un aviso que se dispara una vez por carga.
 *
 * Quien se suscribe tarde recibe el aviso de inmediato, así que el orden de
 * montaje no importa.
 */
let done = false;
const waiting = new Set<() => void>();

export function markIntroDone(): void {
  if (done) return;
  done = true;
  for (const fn of waiting) fn();
  waiting.clear();
}

export function onIntroDone(fn: () => void): () => void {
  if (done) {
    fn();
    return () => {};
  }
  waiting.add(fn);
  return () => {
    waiting.delete(fn);
  };
}
