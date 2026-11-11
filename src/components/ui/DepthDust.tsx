"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

/** Lo que `ZoomStage` entrega en cada frame. */
export type DustFrame = {
  /** Posición virtual del zoom. */
  p: number;
  /** Factor de zoom entre niveles: el mismo `K` del escenario. */
  k: number;
  /** Desplazamiento del punto de fuga por el cursor, en px. */
  ox: number;
  oy: number;
  /** 0 → 1 a lo largo del último tramo del recorrido. */
  finale: number;
  /** Hacia dónde colapsa el polvo al final, en px del escenario. NaN = centro. */
  tx: number;
  ty: number;
};

export type DustHandle = {
  update: (frame: DustFrame) => void;
};

const COUNT = 340;
/** Opacidad de la partícula más brillante, en pleno tránsito. */
const MAX_ALPHA = 0.75;
/** Cuánto queda del polvo con el zoom quieto en un nivel, donde hay que leer. */
const REST = 0.3;
const TAU = Math.PI * 2;

/** PRNG con semilla: el campo es el mismo en cada visita, no un ruido nuevo. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Cada partícula vive en una profundidad `f` dentro de un ciclo de DOS niveles.
 *
 * Dos y no uno: la partícula se dibuja a escala `K^d` con `d` en [-1, 1), así
 * que recorre el camino completo —de enorme y recortada a diminuta en el punto
 * de fuga— antes de reciclarse, y el reciclaje cae justo en los extremos, donde
 * su opacidad ya es cero. Con un ciclo de un nivel saltaría a media pantalla.
 */
const PARTICLES = (() => {
  const rnd = mulberry32(0x5eed);
  return Array.from({ length: COUNT }, () => ({
    // Algo más allá del borde, para que a escala 1 el campo cubra la pantalla.
    x: (rnd() * 2 - 1) * 1.2,
    y: (rnd() * 2 - 1) * 1.2,
    f: rnd() * 2,
    a: 0.35 + rnd() * 0.65,
    r: 0.6 + rnd() * 0.7,
  }));
})();

const smoothstep = (n: number) => n * n * (3 - 2 * n);

type Size = { w: number; h: number; dpr: number };

/** Pinta un frame. Fuera del componente: no depende de nada del render. */
function paint(el: HTMLCanvasElement | null, size: Size, frame: DustFrame) {
  const ctx = el?.getContext("2d");
  const { w, h, dpr } = size;
  if (!ctx || w === 0 || h === 0) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#ffffff";

  const { p, k, ox, oy } = frame;
  const cx = w / 2;
  const cy = h / 2;
  const targetX = Number.isNaN(frame.tx) ? cx : frame.tx;
  const targetY = Number.isNaN(frame.ty) ? cy : frame.ty;

  const e = smoothstep(Math.min(1, Math.max(0, frame.finale)));
  // Quieto en un nivel, tenue; a media transición, pleno. En el cierre sube
  // a pleno para que el colapso se vea.
  const transit = Math.sin(Math.PI * (p - Math.floor(p)));
  const rest = REST + (1 - REST) * transit;
  const intensity = rest + (1 - rest) * e;
  // Acelera hacia el punto y se apaga solo al llegar.
  const pull = e * e * e;
  const fade = 1 - e ** 8;

  for (const q of PARTICLES) {
    const d = ((((q.f - p) % 2) + 2) % 2) - 1;
    const win = 1 - d * d;
    let alpha = q.a * win * win * intensity * fade * MAX_ALPHA;
    // Más allá del último nivel no hay nada: lo que vendría de fuera se apaga.
    if (d > 0) alpha *= 1 - e;
    if (alpha < 0.01) continue;

    const s = k ** d;
    // Misma proyección que las capas: escala alrededor del punto de fuga,
    // que el cursor desplaza.
    let px = cx + ox * (1 - s) + q.x * s * cx;
    let py = cy + oy * (1 - s) + q.y * s * cy;
    px += (targetX - px) * pull;
    py += (targetY - py) * pull;
    if (px < -4 || px > w + 4 || py < -4 || py > h + 4) continue;

    const r = q.r * Math.min(1.8, Math.max(0.55, Math.sqrt(s)));
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, TAU);
    ctx.fill();
  }
}

/**
 * El polvo entre escalas.
 *
 * Entre un nivel y el siguiente solo había negro: nada le confirmaba al ojo que
 * se estaba alejando salvo las marcas de esquina. Estos puntos escalan con la
 * misma `p` que las capas pero en profundidades intermedias, así que siempre
 * hay algo cruzando la pantalla a media transición.
 *
 * Son puntos sueltos sobre un canvas transparente, no un velo: el fondo sigue
 * siendo negro puro. Con el zoom quieto se atenúan para no competir con el
 * texto, y en el último tramo dejan de llegar partículas nuevas y las que
 * quedan colapsan en el punto de luz del cierre.
 *
 * No tiene estado propio de animación: se pinta cuando `ZoomStage` lo llama,
 * derivado de la posición actual, igual que las capas.
 */
const DepthDust = forwardRef<DustHandle>(function DepthDust(_, ref) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const last = useRef<DustFrame | null>(null);
  const size = useRef<Size>({ w: 0, h: 0, dpr: 1 });

  useImperativeHandle(ref, () => ({
    update(frame) {
      last.current = frame;
      paint(canvas.current, size.current, frame);
    },
  }));

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = el.clientWidth;
      const h = el.clientHeight;
      size.current = { w, h, dpr };
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      // Cambiar el tamaño borra el canvas: se repinta el último frame.
      if (last.current) paint(el, size.current, last.current);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <canvas
      ref={canvas}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
});

export default DepthDust;
