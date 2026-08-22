/**
 * Todo el contenido del sitio, en un solo lugar — en los dos idiomas que
 * soporta.
 *
 * Los niveles del zoom se numeran por su exponente de escala: el sitio empieza
 * en 10⁻¹ (un caret) y termina en 10⁸ (un punto de luz). Ese exponente no es
 * decoración — es el índice narrativo y lo que muestra el HUD.
 *
 * Cada dato vive en una de dos formas: **invariante** (nombres, fechas, URLs,
 * nombres de tecnologías — no se traducen porque no son idioma, son
 * identidad) o **de texto**, guardado por idioma en los diccionarios `TEXT`.
 * `getContent(lang)` los junta. Un componente nunca importa un texto suelto:
 * llama a `useContent()` (en `@/lib/i18n`) y lee de ahí, así que sigue siendo
 * cierto que los componentes no llevan texto propio.
 */

export type Lang = "en" | "es";

export const IDENTITY = {
  name: "Daniel Limón Cervantes",
  shortName: "Daniel Limón",
  /**
   * Solo para <title> y OG, donde hace falta un sustantivo buscable. El hero
   * usa `DOMAINS`, que dice más. "Engineer" a secas se quedaba corto: no
   * mencionaba ni IA ni infraestructura.
   *
   * Fijo en inglés: la metadata se congela en el HTML el día de la
   * exportación estática y no puede reaccionar al idioma elegido en cliente.
   */
  role: "AI systems engineer & founder",
  location: "Aguascalientes, México",
  email: "cervantesdaniellimon50m@gmail.com",
  github: "https://github.com/DannyyLC",
  githubHandle: "DannyyLC",
  linkedin: "https://www.linkedin.com/in/daniellimonc",
  linkedinHandle: "daniellimonc",
  company: "Fractal",
  companyUrl: "https://fractalops.com.mx",
  companyDomain: "fractalops.com.mx",
} as const;

/** Origen del eje de la línea de tiempo. Todo se mide en meses desde aquí. */
export const TIMELINE_ORIGIN = "2025-01";
/** Fin del eje. Deja aire a la derecha para lo que sigue en curso. */
export const TIMELINE_END = "2026-12";

/** Mes en que arrancó Fractal. Coincide con `EXPERIENCE_BASE[0].from`. */
const FRACTAL_FOUNDED = "2025-01";

// ─────────────────────────────────────────────────────────────────────────
// Fechas: un solo formateador por idioma, para no escribir dos veces el
// mismo periodo a mano y arriesgar que se desincronicen.
// ─────────────────────────────────────────────────────────────────────────

const MONTHS_FULL: Record<Lang, readonly string[]> = {
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  es: [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ],
};

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

/** Abreviatura de tres letras, derivada del nombre completo y no repetida a mano. */
const MONTHS_ABBR: Record<Lang, readonly string[]> = {
  en: MONTHS_FULL.en.map((m) => m.slice(0, 3)),
  es: MONTHS_FULL.es.map((m) => cap(m.slice(0, 3))),
};

function monthYear(ym: string, lang: Lang, full: boolean): string {
  const [y, m] = ym.split("-").map(Number);
  const name = (full ? MONTHS_FULL : MONTHS_ABBR)[lang][m - 1];
  return full && lang === "es" ? `${name} de ${y}` : `${name} ${y}`;
}

/**
 * `"Jan 2025 — present"` / `"Ene 2025 — presente"`.
 *
 * Cuando las dos fechas caen en el mismo año, el año no se repite del lado
 * izquierdo — `"Apr — Oct 2025"`, no `"Apr 2025 — Oct 2025"`.
 */
function formatPeriod(from: string, to: string | null, lang: Lang): string {
  const present = lang === "es" ? "presente" : "present";
  if (to === null) return `${monthYear(from, lang, false)} — ${present}`;

  const fy = Number(from.slice(0, 4));
  const ty = Number(to.slice(0, 4));
  if (fy === ty) {
    const fm = Number(from.slice(5, 7));
    return `${MONTHS_ABBR[lang][fm - 1]} — ${monthYear(to, lang, false)}`;
  }
  return `${monthYear(from, lang, false)} — ${monthYear(to, lang, false)}`;
}

function monthsFromOrigin(ym: string): number {
  const [y, m] = ym.split("-").map(Number);
  const [oy, om] = TIMELINE_ORIGIN.split("-").map(Number);
  return (y - oy) * 12 + (m - om);
}

/** Offset en meses desde el origen → `"May 2025"` / `"mayo de 2025"`. */
function monthLabelOffset(offset: number, lang: Lang): string {
  const [oy, om] = TIMELINE_ORIGIN.split("-").map(Number);
  const total = oy * 12 + (om - 1) + offset;
  const y = Math.floor(total / 12);
  const m = total % 12;
  return lang === "es" ? `${MONTHS_FULL.es[m]} de ${y}` : `${MONTHS_FULL.en[m]} ${y}`;
}

/**
 * La línea del hero.
 *
 * La anterior —"every system on this page started as one blinking cursor"— era
 * una metáfora que no se sostenía sola: no decía qué iba a pasar ni de quién
 * era lo que se estaba viendo. Esta explica la mecánica de la página y coloca
 * el logro en la misma frase, sin recurrir a un título.
 */
const THESIS: Record<Lang, string> = {
  en: "This page starts at a cursor and pulls back until it reaches a company I built.",
  es: "Esta página empieza en un cursor y se aleja hasta llegar a una empresa que construí.",
};

/**
 * Tres dominios, no un puesto.
 *
 * "Engineer" se lee como "programador" y no dice nada de IA ni de
 * infraestructura, que es donde está la diferencia. Un puesto describe un
 * casillero; estos tres describen el alcance real.
 */
const DOMAINS: Record<Lang, readonly string[]> = {
  en: ["AI", "Full-stack", "Infrastructure"],
  es: ["IA", "Full-stack", "Infraestructura"],
};

/**
 * Nivel 10⁰ — qué sabe hacer.
 *
 * Este nivel es sobre capacidad, no sobre cargos. La versión anterior dedicaba
 * dos de tres párrafos a Fractal, y un portafolio que dice "CEO" tres veces se
 * puede sustituir por un nombre en el landing de la empresa. Que es fundador se
 * cuenta en 10⁶, una sola vez, donde toca.
 *
 * Cada afirmación aquí está respaldada por algo verificable en `PROJECTS`,
 * `EXPERIENCE` o el 8.9% de la investigación. Nada de adjetivos sin evidencia
 * detrás.
 */
const BIO: Record<Lang, readonly string[]> = {
  en: [
    "I am a Computer Systems Engineering student at the Universidad Autónoma de Aguascalientes, graduating December 2027.",
    "I build whole systems, not slices of them. A project of mine usually has a React or Next.js front end, a NestJS, FastAPI or Spring Boot service behind it, PostgreSQL or MongoDB underneath, and a pipeline that puts all of it on GCP without anyone touching a server.",
    "AI is where I go deepest: multi-agent retrieval on LangGraph, RAG over vector stores, MCP for tool orchestration, and conversation systems that keep their state while routing across model providers. I measure the results — my research at the UAA cut cosine distance by 8.9% across 252 standardized questions.",
    "What I care about is the part that comes after the demo: locking, token budgets, provider failover, backups, the cold path at 2 a.m. It is the unglamorous half, and it decides whether a system is still running six months later.",
  ],
  es: [
    "Soy estudiante de Ingeniería en Sistemas Computacionales en la Universidad Autónoma de Aguascalientes; me gradúo en diciembre de 2027.",
    "Construyo sistemas completos, no partes sueltas. Un proyecto mío suele tener un frontend en React o Next.js, un servicio en NestJS, FastAPI o Spring Boot detrás, PostgreSQL o MongoDB debajo, y un pipeline que sube todo a GCP sin que nadie toque un servidor.",
    "Donde más profundizo es en IA: recuperación multiagente sobre LangGraph, RAG sobre bases vectoriales, MCP para orquestar herramientas, y sistemas de conversación que conservan su estado mientras enrutan entre proveedores de modelos. Mido los resultados — mi investigación en la UAA redujo la distancia coseno 8.9% sobre 252 preguntas estandarizadas.",
    "Lo que me importa es lo que viene después de la demo: locking, presupuestos de tokens, failover entre proveedores, respaldos, la guardia fría de las 2 a.m. Es la mitad menos vistosa, y es la que decide si un sistema sigue corriendo seis meses después.",
  ],
};

/**
 * Nivel 10¹ — el stack.
 *
 * Fuera quedaron "REST" y "CI/CD": no son tecnologías, son un estilo de API y
 * una práctica, y listarlas junto a Postgres o Docker le resta seriedad al
 * resto. "Docker Compose" también, por redundante con Docker.
 *
 * `LlamaIndex` y `Google ADK` siguen aquí aunque el carrusel no las muestre:
 * no existe logo para ninguna de las dos y una placa suelta se ve como imagen
 * rota, pero sí tienen que aparecer en la capa semántica, que es la que leen
 * los buscadores y los filtros de reclutamiento. `Marquee` se encarga del
 * filtro visual.
 *
 * Los nombres de tecnología no se traducen — son nombres propios. Solo el
 * rótulo del grupo cambia con el idioma, por eso vive aparte en
 * `SKILL_GROUP_LABELS`.
 */
type SkillGroupKey =
  | "languages"
  | "frontend"
  | "backend"
  | "ai-ml"
  | "data"
  | "infra";

const SKILL_GRAPH_BASE: readonly {
  groupKey: SkillGroupKey;
  items: readonly string[];
}[] = [
  { groupKey: "languages", items: ["Python", "TypeScript", "JavaScript", "Java"] },
  {
    groupKey: "frontend",
    items: ["React", "Next.js", "Angular", "Tailwind CSS", "TanStack"],
  },
  {
    groupKey: "backend",
    items: ["NestJS", "FastAPI", "Spring Boot", "Node.js", "Express", "Kafka"],
  },
  {
    groupKey: "ai-ml",
    items: [
      "LangChain",
      "LangGraph",
      "LlamaIndex",
      "Qdrant",
      "PyTorch",
      "TensorFlow",
      "Google ADK",
      "MCP",
      "Pandas",
    ],
  },
  { groupKey: "data", items: ["PostgreSQL", "MongoDB", "Redis", "Prisma"] },
  {
    groupKey: "infra",
    items: ["Docker", "Nginx", "GCP", "GitHub Actions", "GitLab"],
  },
];

const SKILL_GROUP_LABELS: Record<Lang, Record<SkillGroupKey, string>> = {
  en: {
    languages: "Languages",
    frontend: "Frontend",
    backend: "Backend",
    "ai-ml": "AI / ML",
    data: "Data",
    infra: "Infra",
  },
  es: {
    languages: "Lenguajes",
    frontend: "Frontend",
    backend: "Backend",
    "ai-ml": "IA / ML",
    data: "Datos",
    infra: "Infra",
  },
};

/**
 * Proyectos — cosas construidas.
 *
 * El criterio es qué tipo de cosa es, no quién la pagó: aquí van los artefactos
 * y en `EXPERIENCE` los puestos. Por eso QueSO y el agente de RGM se movieron a
 * experiencia —fueron encargos, con cliente y periodo— y la investigación de la
 * UAA vino para acá: es un proyecto de investigación, no un empleo.
 *
 * De Tesseract solo se dice qué es y con qué está hecho. La arquitectura
 * interna —servicios, estado de conversación, locking— es privada y no tiene
 * por qué estar en una página pública; lo que queda aquí es exactamente lo que
 * ya se ve en fractalops.com.mx.
 *
 * `name`, `client` y `stack` no se traducen: son nombres propios y nombres de
 * tecnología. Lo que cambia con el idioma vive en `PROJECT_TEXT`, indexado por
 * `name`.
 */
type ProjectName = "Tesseract" | "Agent-based RAG" | "Axis" | "Fractal Hub";

const PROJECTS_BASE: readonly {
  name: ProjectName;
  client: string;
  stack: readonly string[];
  href?: string;
}[] = [
  {
    name: "Tesseract",
    client: "Fractal",
    stack: ["Next.js", "NestJS", "TypeScript", "PostgreSQL", "Docker"],
    href: "https://app.tesseract.fractalops.com.mx",
  },
  {
    name: "Agent-based RAG",
    client: "Universidad Autónoma de Aguascalientes",
    stack: ["LangGraph", "LangChain", "Python", "Qdrant"],
  },
  {
    name: "Axis",
    client: "Fractal",
    stack: ["Nx", "Prisma", "Expo", "PostgreSQL"],
  },
  {
    name: "Fractal Hub",
    client: "Fractal",
    stack: ["Turborepo", "Next.js", "GSAP", "Three.js"],
    href: "https://fractalops.com.mx",
  },
];

const PROJECT_TEXT: Record<
  Lang,
  Record<ProjectName, { what: string; role: string; detail: string }>
> = {
  en: {
    Tesseract: {
      what: "AI agent platform",
      role: "Architected and built",
      detail:
        "A platform for building and running AI agents in production. I designed it and took it from an empty repository to a paying deployment.",
    },
    "Agent-based RAG": {
      what: "Research · MP-80-25",
      role: "Built the retrieval system",
      // El 8.9% va dentro de la frase y no como número gigante. Destacarlo en
      // grande lo convertía en la única cosa medible del sitio y por contraste
      // hacía parecer que lo demás no lo estaba.
      detail:
        "A multi-agent retrieval system on LangGraph and LangChain for autonomous information retrieval, benchmarked against several open-source models. It cut cosine distance by 8.9% across 252 standardized questions.",
    },
    Axis: {
      what: "Multi-tenant inventory",
      role: "Architecture and product direction",
      detail:
        "Inventory where every client defines their own attributes. I set the tenancy model and the deployment split that ships it as SaaS, self-hosted, or fully offline.",
    },
    "Fractal Hub": {
      what: "Public surface",
      role: "Architecture and build",
      detail:
        "A Turborepo holding fractalops.com.mx and the Tesseract landing, so marketing ships with the site instead of with the product.",
    },
  },
  es: {
    Tesseract: {
      what: "Plataforma de agentes de IA",
      role: "Arquitecté y construí",
      detail:
        "Una plataforma para construir y correr agentes de IA en producción. La diseñé y la llevé de un repositorio vacío a un despliegue que factura.",
    },
    "Agent-based RAG": {
      what: "Investigación · MP-80-25",
      role: "Construí el sistema de recuperación",
      detail:
        "Un sistema de recuperación multiagente sobre LangGraph y LangChain para recuperación de información autónoma, evaluado contra varios modelos de código abierto. Redujo la distancia coseno 8.9% sobre 252 preguntas estandarizadas.",
    },
    Axis: {
      what: "Inventario multi-tenant",
      role: "Arquitectura y dirección de producto",
      detail:
        "Inventario donde cada cliente define sus propios atributos. Definí el modelo de tenencia y el esquema de despliegue que lo entrega como SaaS, autoalojado, o completamente offline.",
    },
    "Fractal Hub": {
      what: "Superficie pública",
      role: "Arquitectura y construcción",
      detail:
        "Un Turborepo que aloja fractalops.com.mx y el landing de Tesseract, para que marketing se despliegue junto con el sitio y no junto con el producto.",
    },
  },
};

/**
 * Experiencia — puestos, con fechas.
 *
 * Cada puesto lleva `from`/`to` además del periodo, porque el nivel los dibuja
 * como barras sobre un eje común y porque `period` se deriva de ahí — no se
 * escribe a mano en los dos idiomas, para no arriesgar que se desincronicen.
 * Ver `formatPeriod`.
 *
 * `org` no se traduce — es un nombre propio y además la llave que indexa
 * `EXPERIENCE_TEXT`. Ordenada por lo más reciente, con lo que sigue en curso
 * arriba; `L4Experience` la reordena para dibujar la espina.
 */
type Org =
  | "Fractal"
  | "SoftwareSV"
  | "Gobierno de Aguascalientes · UAA"
  | "Solarity Paneles Solares"
  | "Softweb Tecnologías"
  | "RGM Advanced";

const EXPERIENCE_BASE: readonly {
  org: Org;
  /** Inicio, `YYYY-MM`. */
  from: string;
  /** Fin, `YYYY-MM`, o `null` si sigue en curso. */
  to: string | null;
  stack: readonly string[];
}[] = [
  {
    org: "Fractal",
    from: "2025-01",
    to: null,
    stack: ["Next.js", "NestJS", "PostgreSQL", "GCP", "Docker"],
  },
  {
    org: "SoftwareSV",
    // Primer commit del repo el 10 de abril de 2026; el arranque real se toma
    // dos semanas antes, que es lo que él calcula que llevaba el trabajo de
    // diseño previo. Último commit hace días, así que sigue abierto.
    from: "2026-03",
    to: null,
    stack: ["Next.js", "TypeScript", "Spring Boot", "Java 21", "Nginx", "Docker"],
  },
  {
    org: "Gobierno de Aguascalientes · UAA",
    // Primer commit del repo el 4 de mayo de 2026, que coincide con lo que él
    // recuerda del arranque.
    from: "2026-05",
    to: null,
    stack: ["Node.js", "Express", "MongoDB", "Redis", "Angular", "Docker"],
  },
  {
    org: "Solarity Paneles Solares",
    from: "2025-05",
    to: "2026-01",
    stack: ["Next.js", "React", "TypeScript", "Docker", "Tailwind CSS"],
  },
  {
    org: "Softweb Tecnologías",
    from: "2025-04",
    to: "2025-10",
    stack: ["MCP", "RAG", "LangChain"],
  },
  {
    org: "RGM Advanced",
    from: "2025-05",
    to: "2025-08",
    stack: ["LLM agents", "RAG", "Automation"],
  },
];

const EXPERIENCE_TEXT: Record<Lang, Record<Org, { title: string; detail: string }>> = {
  en: {
    Fractal: {
      title: "Co-founder & CEO",
      detail:
        "I own the technical side from zero to production: architecture, product decisions, and the cloud it all runs on.",
    },
    SoftwareSV: {
      title: "Industrial operations platform",
      detail:
        "A multi-tenant platform for running industrial operations: plants, processes, and the work stations they break into. Each station declares the competencies it needs, and every worker is measured against them.",
    },
    "Gobierno de Aguascalientes · UAA": {
      title: "Quality management system",
      detail:
        "Traceability for artisanal cheese production under COFEPRIS norms NOM-243, NOM-251 and NOM-051. Seventy-three endpoints covering milk reception, sanitation, cold chain, inventory, distribution and market withdrawal.",
    },
    "Solarity Paneles Solares": {
      title: "Full Stack Developer",
      detail:
        "Inventory control and project tracking for a solar installer. Field crews are located through the Google Maps API; the whole thing ships through GitHub Actions.",
    },
    "Softweb Tecnologías": {
      title: "AI Consultant",
      detail:
        "Put LLMs into enterprise workflows using MCP for service orchestration, plus an agent joining a document database to the tools a business actually runs on.",
    },
    "RGM Advanced": {
      title: "AI sales agent",
      detail:
        "An agent that runs their sales funnel end to end: it qualifies inbound leads, answers product questions, and hands off to a human at the moment it stops being useful.",
    },
  },
  es: {
    Fractal: {
      title: "Cofundador y CEO",
      detail:
        "Llevo el lado técnico de cero a producción: arquitectura, decisiones de producto, y la nube donde corre todo.",
    },
    SoftwareSV: {
      title: "Plataforma de operaciones industriales",
      detail:
        "Una plataforma multi-tenant para operar plantas industriales: procesos y las estaciones de trabajo en que se dividen. Cada estación declara las competencias que necesita, y a cada trabajador se le mide contra ellas.",
    },
    "Gobierno de Aguascalientes · UAA": {
      title: "Sistema de gestión de calidad",
      detail:
        "Trazabilidad para producción artesanal de queso bajo las normas COFEPRIS NOM-243, NOM-251 y NOM-051. Setenta y tres endpoints que cubren recepción de leche, saneamiento, cadena de frío, inventario, distribución y retiro de mercado.",
    },
    "Solarity Paneles Solares": {
      title: "Desarrollador Full Stack",
      detail:
        "Control de inventario y seguimiento de proyectos para un instalador de paneles solares. Las cuadrillas de campo se ubican con la API de Google Maps; todo se despliega por GitHub Actions.",
    },
    "Softweb Tecnologías": {
      title: "Consultor de IA",
      detail:
        "Metí LLMs a flujos de trabajo empresariales usando MCP para orquestar servicios, más un agente que conecta una base de datos documental con las herramientas que un negocio realmente usa.",
    },
    "RGM Advanced": {
      title: "Agente de IA para ventas",
      detail:
        "Un agente que corre su embudo de ventas de principio a fin: califica leads entrantes, responde preguntas de producto, y transfiere a un humano en el momento exacto en que deja de ser útil.",
    },
  },
};

/**
 * La frase sobre concurrencia, calculada desde las fechas — no escrita a mano
 * por idioma, para que nunca se desincronice de `EXPERIENCE_BASE`.
 *
 * El dato que `L4Experience` existe para contar es que varios puestos
 * corrieron a la vez. Una frase lo dice sin que nadie tenga que descifrar un
 * eje.
 */
const COUNT_WORDS: Record<Lang, readonly string[]> = {
  en: ["No", "One", "Two", "Three", "Four", "Five", "Six"],
  es: ["Ninguno", "Uno", "Dos", "Tres", "Cuatro", "Cinco", "Seis"],
};

function concurrencySentence(lang: Lang): string | null {
  const span = monthsFromOrigin(TIMELINE_END);
  const counts = Array.from({ length: span + 1 }, (_, i) =>
    EXPERIENCE_BASE.filter((r) => {
      const s = monthsFromOrigin(r.from);
      const e = r.to ? monthsFromOrigin(r.to) : span;
      return i >= s && i <= e;
    }).length,
  );

  const peak = Math.max(...counts);
  if (peak < 2) return null;

  const from = counts.indexOf(peak);
  let to = from;
  while (to + 1 <= span && counts[to + 1] === peak) to++;

  const word = COUNT_WORDS[lang][peak];
  const a = monthLabelOffset(from, lang);
  const b = monthLabelOffset(to, lang);
  return lang === "es"
    ? `${word} de ellos corrieron al mismo tiempo, entre ${a} y ${b}.`
    : `${word} of them ran at the same time, between ${a} and ${b}.`;
}

/**
 * Nivel 10⁶ — lo que dirige.
 *
 * El nivel se encabeza con su papel, no con el nombre de la empresa: Fractal
 * queda como el sujeto de la frase y él como el actor. Los pilares dejaron de
 * ser el catálogo de la empresa —"Products · Services · Infrastructure"— para
 * ser el alcance de lo que él decide.
 */
const COMPANY_TEXT: Record<
  Lang,
  {
    role: string;
    body: string;
    pillars: readonly { label: string; body: string }[];
  }
> = {
  en: {
    role: "Co-founder & CEO",
    body: "I co-founded Fractal in January 2025 and own the technical side from zero to production. I am the person who decides how it is built, and the person on call when it breaks.",
    pillars: [
      { label: "Architecture", body: "Every service, schema, and deployment boundary" },
      { label: "Product", body: "What gets built, in what order, and what gets cut" },
      { label: "Infrastructure", body: "GCP — Cloud Run, Cloud Storage, IAM" },
    ],
  },
  es: {
    role: "Cofundador y CEO",
    body: "Cofundé Fractal en enero de 2025 y llevo el lado técnico de cero a producción. Soy quien decide cómo se construye, y quien responde cuando algo truena.",
    pillars: [
      { label: "Arquitectura", body: "Cada servicio, esquema, y frontera de despliegue" },
      { label: "Producto", body: "Qué se construye, en qué orden, y qué se recorta" },
      { label: "Infraestructura", body: "GCP — Cloud Run, Cloud Storage, IAM" },
    ],
  },
};

/**
 * El punto — cierre y contacto.
 *
 * Antes había un nivel de "territorio" entre la compañía y este: una mira sobre
 * las coordenadas de Aguascalientes. Era el único nivel que no decía nada
 * profesional —respondía "¿dónde vives?", que es un dato de una línea y no de
 * una pantalla— y de paso amortiguaba el momento más dramático del zoom. Sin
 * él el cierre va de la compañía directo al punto, sin escalas.
 *
 * La ubicación no se perdió: vive aquí, que es donde alguien que va a
 * escribirte necesita saber tu zona horaria.
 */
type ContactLinkKey = "email" | "github" | "linkedin" | "fractal";

const CONTACT_LINKS_BASE: readonly {
  key: ContactLinkKey;
  value: string;
  href: string;
}[] = [
  { key: "email", value: IDENTITY.email, href: `mailto:${IDENTITY.email}` },
  { key: "github", value: IDENTITY.githubHandle, href: IDENTITY.github },
  { key: "linkedin", value: IDENTITY.linkedinHandle, href: IDENTITY.linkedin },
  { key: "fractal", value: IDENTITY.companyDomain, href: IDENTITY.companyUrl },
];

const CONTACT_TEXT: Record<
  Lang,
  {
    headline: string;
    body: string;
    linkLabels: Record<ContactLinkKey, string>;
  }
> = {
  en: {
    headline: "Back to a point of light.",
    body: "If you have something that needs to hold state, route across models, and stay up — write to me.",
    linkLabels: { email: "Email", github: "GitHub", linkedin: "LinkedIn", fractal: "Fractal" },
  },
  es: {
    headline: "De vuelta a un punto de luz.",
    body: "Si tienes algo que necesita conservar estado, enrutar entre modelos, y seguir en pie — escríbeme.",
    linkLabels: { email: "Correo", github: "GitHub", linkedin: "LinkedIn", fractal: "Fractal" },
  },
};

/**
 * Rótulos de interfaz: lo poco que no vive en un bloque de contenido con
 * nombre propio (encabezados de sección, el gancho del hero, los siete
 * nombres cortos que muestra el HUD).
 */
export type LevelKey =
  | "intro"
  | "about"
  | "stack"
  | "projects"
  | "experience"
  | "company"
  | "contact";

const UI_TEXT: Record<
  Lang,
  {
    scrollCue: string;
    levelLabels: Record<LevelKey, string>;
    projectsHeading: string;
    experienceHeading: string;
    since: string;
    semantic: {
      about: string;
      technicalSkills: string;
      projects: string;
      experience: string;
      contact: string;
    };
  }
> = {
  en: {
    scrollCue: "scroll to pull back",
    levelLabels: {
      intro: "intro",
      about: "about",
      stack: "stack",
      projects: "projects",
      experience: "experience",
      company: "company",
      contact: "contact",
    },
    projectsHeading: "Projects",
    experienceHeading: "Experience",
    since: "since",
    semantic: {
      about: "About",
      technicalSkills: "Technical skills",
      projects: "Projects",
      experience: "Experience",
      contact: "Contact",
    },
  },
  es: {
    scrollCue: "desliza para alejarte",
    levelLabels: {
      intro: "inicio",
      about: "sobre mí",
      stack: "stack",
      projects: "proyectos",
      experience: "experiencia",
      company: "compañía",
      contact: "contacto",
    },
    projectsHeading: "Proyectos",
    experienceHeading: "Experiencia",
    since: "desde",
    semantic: {
      about: "Sobre mí",
      technicalSkills: "Habilidades técnicas",
      projects: "Proyectos",
      experience: "Experiencia",
      contact: "Contacto",
    },
  },
};

/** Todo el contenido del sitio, para un idioma dado. */
export function getContent(lang: Lang) {
  return {
    lang,
    IDENTITY,
    TIMELINE_ORIGIN,
    TIMELINE_END,
    THESIS: THESIS[lang],
    DOMAINS: DOMAINS[lang],
    BIO: BIO[lang],
    SKILL_GRAPH: SKILL_GRAPH_BASE.map((g) => ({
      groupKey: g.groupKey,
      group: SKILL_GROUP_LABELS[lang][g.groupKey],
      items: g.items,
    })),
    PROJECTS: PROJECTS_BASE.map((p) => ({ ...p, ...PROJECT_TEXT[lang][p.name] })),
    EXPERIENCE: EXPERIENCE_BASE.map((r) => ({
      ...r,
      ...EXPERIENCE_TEXT[lang][r.org],
      period: formatPeriod(r.from, r.to, lang),
    })),
    EXPERIENCE_SENTENCE: concurrencySentence(lang),
    COMPANY: {
      name: IDENTITY.company,
      sinceLabel: monthYear(FRACTAL_FOUNDED, lang, true),
      url: IDENTITY.companyUrl,
      domain: IDENTITY.companyDomain,
      ...COMPANY_TEXT[lang],
    },
    CONTACT: {
      ...CONTACT_TEXT[lang],
      location: IDENTITY.location,
      links: CONTACT_LINKS_BASE.map((l) => ({
        ...l,
        label: CONTACT_TEXT[lang].linkLabels[l.key],
      })),
    },
    UI: UI_TEXT[lang],
  };
}

export type Content = ReturnType<typeof getContent>;
