@AGENTS.md

# Portafolio de Daniel Limón

Una sola página que es un zoom continuo hacia afuera: empieza en un caret
parpadeando y termina en un punto de luz, siete niveles de escala más tarde.

**`README.md` no documenta este proyecto.** Es la presentación del perfil de
GitHub —el repo se llama `DannyyLC/DannyyLC`, y un README en su raíz se
renderiza en el perfil— así que no se toca. Este archivo es el único sitio
donde vive el conocimiento del proyecto.

## Comandos

```bash
pnpm dev                        # desarrollo
pnpm build                      # build normal (NO exporta)
PAGES=1 pnpm build              # exportación estática a out/
node scripts/gen-tech-icons.mjs # regenera src/lib/tech-icons.ts
pnpm lint && npx tsc --noEmit
```

## El motor del zoom

`ZoomStage` mantiene una posición virtual `p` a lo largo de los niveles y dibuja
la capa `i` a escala `K^(i - p)`:

| posición | escala | qué se ve |
|---|---|---|
| `p = i` | 1 | es el nivel que se está leyendo |
| `p < i` | > 1 | todavía no llegas: está alrededor, recortado |
| `p > i` | < 1 | ya lo rebasaste: se encoge hacia el punto de fuga |

No hay anidamiento real de DOM. Lo que vende la ilusión es que las capas
visibles comparten centro y que las marcas de esquina de la que sale siguen
encogiendo dentro de la que entra.

Un nivel puede declarar `dwell`: el zoom se congela ahí durante N pantallas de
scroll y ese tramo se gasta en un progreso local de 0 a 1, que la capa recibe
como la variable CSS `--local`. Lo usan `projects` y `experience` para recorrer
sus pistas horizontales. **Viaja como custom property y no como prop de React**
porque cambia en cada frame; como prop serían sesenta renders por segundo.

## Invariantes que costaron encontrar

**Nada se inicializa con constantes: todo se deriva del scroll actual.** Mordió
dos veces. Un `draw(0, …)` de arranque pisaba la posición real al recargar a
media página, y un `--local` que volvía a 0 teletransportaba la pista de
proyectos a la primera tarjeta mientras la capa aún se veía. Por eso el pintado
inicial pasa por `apply(st.progress)` y un nivel ya rebasado conserva `--local`
en 1.

**`gsap.quickSetter(el, "scale")` no enruta a la transform del elemento.** La
deja en `none` sin lanzar error. El zoom entero quedó plano mientras la opacidad
sí respondía, así que parecía funcionar. `ZoomStage` escribe `transform` y
`opacity` a mano.

**Redondear toda geometría trigonométrica antes de que toque el DOM.** La
especificación de ECMAScript no obliga a `Math.sin`/`Math.cos` a devolver el
resultado correctamente redondeado, y Node y Chrome corren builds distintos de
V8. Sin redondeo, 69 de las 72 marcas del dial serializaban distinto en servidor
y cliente y disparaban desajuste de hidratación.

**Nada de `new Date()` en render.** La página se prerrenderiza estática, así que
la fecha se congelaría en el HTML el día de la compilación. Para valores que
difieren entre servidor y cliente, `useSyncExternalStore` con snapshot de
servidor.

**En una pista horizontal, el relleno lateral vale `(ancho de pantalla − ancho
de tarjeta) / 2`.** Con eso la distancia a recorrer sale `(N-1)(tarjeta+hueco)`,
que deja la primera tarjeta centrada al empezar y la última centrada al
terminar. Con relleno fijo, la primera nace pegada al borde y solo puede irse.

**El carrusel necesita una copia más de la que parece.** La pista se desplaza el
ancho de UNA copia, así que lo que queda tras ese desplazamiento —`copies - 1`—
todavía tiene que tapar el marco. Si no, aparece un hueco al cerrar cada ciclo.

**Las tarjetas encima de la espina se anclan por su borde inferior.** `CARD_H`
es un mínimo: ancladas por arriba, una tarjeta con texto largo crece hacia abajo
y cruza la línea.

## Contenido y accesibilidad

`src/lib/content.ts` es la única fuente. Los componentes no llevan texto.

`SemanticOutline` no es decorativo. El escenario va `aria-hidden` porque el
culling usa `visibility: hidden`, que también saca las capas del árbol de
accesibilidad; ese componente sirve el mismo contenido en texto plano para
lectores de pantalla y rastreadores. **Al agregar o mover contenido hay que
actualizarlo.**

Bajo `prefers-reduced-motion` el zoom no se suaviza: se desmonta y el contenido
se apila como documento normal.

El carrusel solo dibuja lo que tiene logo en `tech-icons.ts`. Lo que no lo tiene
sigue en `SKILL_GRAPH` —y por tanto en la capa semántica— pero se filtra.

## Despliegue

`.github/workflows/pages.yml` publica en GitHub Pages con cada push a `main`.
El sitio vive en https://dannyylc.github.io/DannyyLC/

- El `basePath` lo deriva el workflow del nombre del repo: vacío para
  `*.github.io`, `/<repo>` en cualquier otro caso.
- `output: "export"` está detrás de `PAGES=1` a propósito. Fijarlo renunciaría
  para siempre a route handlers, server actions e ISR.
- **`public/.nojekyll` es imprescindible.** Jekyll descarta todo lo que empieza
  con guion bajo, o sea `_next/` entera, y además convierte `README.md` en el
  sitio si no encuentra `index.html`.
- **Settings → Pages → Source** tiene que estar en **GitHub Actions**.

## Trabajar con Daniel

- **Negro puro `#000000`, nunca carbón.** Cualquier levantamiento se lee como
  neblina gris. Foreground `#ededed`, Inter + Geist Mono.
- **Preguntar antes de agregar cualquier tecnología** a sus habilidades o a los
  stacks de proyectos, aunque aparezca en un repo suyo o en su CV. Un stack
  publicado es algo que tiene que defender en entrevista.
- **El QA visual lo hace él.** Verificar corrección por máquina —typecheck,
  build, lint, errores de consola, medir valores cuando una afirmación depende
  de un número— y entregarle el "míralo". No tomar capturas para juzgar diseño.
- La página habla de **él**, no de Fractal. Primera persona, sobre lo que
  construyó y decidió. La empresa se menciona donde toca, una vez.
