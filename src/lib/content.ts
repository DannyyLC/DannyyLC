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

/**
 * Formación. Julio y no agosto: hay que contar el propedéutico, que arrancó
 * antes que las clases regulares.
 */
const EDUCATION_START = "2023-07";
const EDUCATION_END = "2027-12";

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

/**
 * La línea del hero.
 *
 * Dos versiones anteriores cerraban en un logro —una empresa construida— y
 * las dos sonaban a que la carrera ya había llegado a algún lado. No es el
 * caso: sigue en curso. Esta explica la mecánica de la página (el zoom hacia
 * afuera) sin resolverla en un final.
 */
const THESIS: Record<Lang, string> = {
  en: "This page is a zoom pulling outward: every level you cross is another step of what I've built so far, and it's still being written.",
  es: "Esta página es un zoom hacia afuera: cada nivel que cruzas es otro paso de lo que llevo construido, y todavía se sigue escribiendo.",
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
    "I study Computer Systems Engineering at the UAA, and I've been building complete software since before finishing the degree: not just what a user sees, but what runs behind it and the cloud it lives on.",
    "Where I go deepest is AI: systems that look up and use information on their own, understand context, and give answers you can actually trust.",
    "What I care about most is what happens after the demo: that a system holds up under real load, that it doesn't fall over when something fails, that there's a plan when things go wrong. It's the unglamorous half of the work, and it's the half that decides whether something is still running six months later.",
  ],
  es: [
    "Estudio Ingeniería en Sistemas Computacionales en la UAA, y llevo desde antes de terminar la carrera construyendo software completo: no solo lo que ve un usuario, sino también lo que corre detrás y la nube donde vive todo.",
    "Donde más profundizo es en inteligencia artificial: sistemas que buscan y usan información por su cuenta, entienden el contexto, y dan respuestas en las que se puede confiar.",
    "Lo que más me importa es lo que pasa después de la demo: que un sistema aguante cuando hay muchos usuarios, que no se caiga si algo falla, que haya un plan si las cosas salen mal. Es la parte menos vistosa del trabajo, y es la que decide si algo sigue funcionando seis meses después.",
  ],
};

/**
 * Formación, idioma, habilidades blandas y certificaciones.
 *
 * Viven en `about` (10⁰), junto a la bio — son datos personales, no técnicos,
 * así que no tenía sentido meterlos en `stack`. `EDUCATION.period` sale de
 * las mismas fechas que usa el resto del sitio para no escribir el rango a
 * mano; la escuela y la carrera sí son nombres propios y no se traducen salvo
 * el nombre de la carrera, que sí cambia con el idioma.
 */
const DEGREE: Record<Lang, string> = {
  en: "Computer Systems Engineering",
  es: "Ingeniería en Sistemas Computacionales",
};

const SCHOOL = "Universidad Autónoma de Aguascalientes";

/** Una sola línea, sin justificarla — el examen de colocación de la UAA queda implícito. */
const LANGUAGE_LINE: Record<Lang, string> = {
  en: "English — C1",
  es: "Inglés — C1",
};

const SOFT_SKILLS: Record<Lang, readonly string[]> = {
  en: [
    "Teamwork",
    "Effective communication",
    "Leadership",
    "Problem solving",
    "Time management",
  ],
  es: [
    "Trabajo en equipo",
    "Comunicación efectiva",
    "Liderazgo",
    "Resolución de problemas",
    "Organización y gestión del tiempo",
  ],
};

/**
 * Curadas, no las 25 que existen: la mayoría son cursos introductorios de
 * Platzi que ya cubre de sobra dominar el stack a nivel profesional —
 * listarlos todos se lee como relleno. Estas 4 aportan algo que el resto del
 * sitio no dice. `issuer` es la llave que mapea al logo en `tech-icons.ts` —
 * no se traduce, es nombre propio, igual que `title`.
 */
type CertIssuer = "The Linux Foundation" | "Google" | "Platzi";

const CERTIFICATIONS_BASE: readonly {
  issuer: CertIssuer;
  title: string;
  /** Mes de emisión, `YYYY-MM` — se formatea con `monthYear`, no a mano. */
  ym: string;
}[] = [
  { issuer: "The Linux Foundation", title: "Introduction to Linux (LFS101)", ym: "2025-04" },
  { issuer: "Google", title: "Artificial Intelligence and Productivity", ym: "2025-04" },
  { issuer: "Platzi", title: "Entorno de trabajo para Data e IA", ym: "2024-07" },
  { issuer: "Platzi", title: "Redes Neuronales Convolucionales", ym: "2024-08" },
];

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
    infra: "Infrastructure",
  },
  es: {
    languages: "Lenguajes",
    frontend: "Frontend",
    backend: "Backend",
    "ai-ml": "IA / ML",
    data: "Datos",
    infra: "Infraestructura",
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
    stack: ["React", "TanStack", "Nx", "Prisma", "Expo", "PostgreSQL"],
  },
  {
    name: "Fractal Hub",
    client: "Fractal",
    stack: ["Turborepo", "Next.js", "GSAP", "Three.js"],
    href: "https://fractalops.com.mx",
  },
];

/**
 * `detail` es la prosa que se lee de entrada: qué hace el proyecto y por qué
 * importó, sin inventario técnico — para eso ya están los chips de `stack`.
 * `technical` es la capa opcional que se revela con "ver más" (`<details>` en
 * `L3Projects`), para quien sí quiere el nivel de ingeniería.
 */
const PROJECT_TEXT: Record<
  Lang,
  Record<ProjectName, { what: string; role: string; detail: string; technical: string }>
> = {
  en: {
    Tesseract: {
      what: "AI agent platform",
      role: "Architected and built",
      detail:
        "A platform for building and running AI agents in production. I designed it and built it from scratch, and today real clients use it.",
      technical:
        "Next.js on the front end, NestJS and PostgreSQL behind it, everything containerized with Docker. I designed the agent model and the orchestration layer that lets several run in production at once.",
    },
    "Agent-based RAG": {
      what: "Research · MP-80-25",
      role: "Built the retrieval system",
      detail:
        "A research project at the UAA to get an AI to look up information on its own and give better answers. I benchmarked it against several open-source models: 8.9% better accuracy across 252 standardized questions.",
      technical:
        "Multi-agent retrieval on LangGraph and LangChain, with Qdrant as the vector store. Each agent has a distinct role inside the retrieval pipeline.",
    },
    Axis: {
      what: "Multi-tenant inventory",
      role: "Architecture, product, and build",
      detail:
        "An inventory system where every client builds their own fields, instead of the software forcing a fixed structure on them. I decided how it splits across clients and how it ships: cloud-hosted, on their own servers, or fully offline.",
      technical:
        "React and TanStack on the front end, multi-tenant architecture on Nx and Prisma, with Expo for the mobile app and PostgreSQL underneath — a per-client dynamic schema without losing efficient queries.",
    },
    "Fractal Hub": {
      what: "Public surface",
      role: "Architecture and build",
      detail:
        "Fractal's public site and the Tesseract landing page, in one repository, so marketing ships without touching the product.",
      technical: "A Turborepo with Next.js, GSAP for animation, and Three.js for the 3D pieces.",
    },
  },
  es: {
    Tesseract: {
      what: "Plataforma de agentes de IA",
      role: "Diseñé y construí",
      detail:
        "Una plataforma para construir y correr agentes de IA en producción. La diseñé y la construí de cero, y hoy la usan clientes reales.",
      technical:
        "Next.js en el frontend, NestJS y PostgreSQL detrás, todo en Docker. Diseñé el modelo de agentes y la capa que permite correr varios en producción a la vez.",
    },
    "Agent-based RAG": {
      what: "Investigación · MP-80-25",
      role: "Construí el sistema de recuperación",
      detail:
        "Un proyecto de investigación en la UAA para que una IA busque información por su cuenta y dé mejores respuestas. Lo evalué contra varios modelos de código abierto: 8.9% más precisión sobre 252 preguntas estandarizadas.",
      technical:
        "Recuperación multiagente sobre LangGraph y LangChain, con Qdrant como base vectorial. Cada agente tiene un rol distinto dentro del pipeline de recuperación.",
    },
    Axis: {
      what: "Inventario multi-tenant",
      role: "Arquitectura, producto y construcción",
      detail:
        "Un sistema de inventario donde cada cliente arma sus propios campos, en vez de que el software le imponga una estructura fija. Decidí cómo se reparte entre clientes y cómo se entrega: en la nube, en sus propios servidores, o sin conexión.",
      technical:
        "React y TanStack en el frontend, arquitectura multi-tenant sobre Nx y Prisma, con Expo para la app móvil y PostgreSQL de base — esquema dinámico por cliente sin perder consultas eficientes.",
    },
    "Fractal Hub": {
      what: "Superficie pública",
      role: "Arquitectura y construcción",
      detail:
        "El sitio público de Fractal y la página de Tesseract, en un solo repositorio, para que el marketing se actualice sin tocar el producto.",
      technical: "Un monorepo con Turborepo, Next.js, GSAP para animación y Three.js para los elementos 3D.",
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
    stack: ["Next.js", "TypeScript", "Spring Boot", "Java", "PostgreSQL", "Nginx", "Docker"],
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
    stack: ["Next.js", "React", "TypeScript", "Python", "Django", "PostgreSQL", "Docker", "Tailwind CSS"],
  },
  {
    org: "Softweb Tecnologías",
    from: "2025-04",
    to: "2025-10",
    stack: ["Python", "LangChain", "RAG", "MCP"],
  },
  {
    org: "RGM Advanced",
    from: "2025-05",
    to: "2025-08",
    stack: ["Python", "LangGraph", "RAG"],
  },
];

const EXPERIENCE_TEXT: Record<Lang, Record<Org, { title: string; detail: string }>> = {
  en: {
    Fractal: {
      title: "Co-founder & CEO",
      detail:
        "Everything that happens at the company runs through me: architecture, product decisions, team coordination, and the cloud it all runs on.",
    },
    SoftwareSV: {
      title: "Industrial operations platform",
      detail:
        "Software for running industrial plants: it splits the work into stations, each one holding what a worker needs to know, and measures every worker against that.",
    },
    "Gobierno de Aguascalientes · UAA": {
      title: "Quality management system",
      detail:
        "Traceability for artisanal cheese production, under the government's health-safety rules: from the milk coming in to the product going out for sale.",
    },
    "Solarity Paneles Solares": {
      title: "Full Stack Developer",
      detail:
        "Inventory control and project tracking for a solar panel company in Aguascalientes, with field crews located on a live map.",
    },
    "Softweb Tecnologías": {
      title: "AI Consultant",
      detail:
        "Built a RAG-based retrieval agent with a complex permission system on top of the client's database: what it returns depends on whether you're an employee or an outside user.",
    },
    "RGM Advanced": {
      title: "AI sales agent",
      detail:
        "An AI agent that runs the whole sales funnel: answers questions, qualifies interested leads, and hands off to a human right when it's needed.",
    },
  },
  es: {
    Fractal: {
      title: "Cofundador y CEO",
      detail:
        "Todo lo que pasa en la empresa pasa por mí: arquitectura, decisiones de producto, coordinación del equipo, y la nube donde corre todo.",
    },
    SoftwareSV: {
      title: "Plataforma de operaciones industriales",
      detail:
        "Software para operar plantas industriales: divide el trabajo en estaciones, cada una con lo que un trabajador necesita saber, y mide a cada quien contra eso.",
    },
    "Gobierno de Aguascalientes · UAA": {
      title: "Sistema de gestión de calidad",
      detail:
        "Trazabilidad para producción artesanal de queso bajo normas de sanidad del gobierno: desde que llega la leche hasta que el producto sale a la venta.",
    },
    "Solarity Paneles Solares": {
      title: "Desarrollador Full Stack",
      detail:
        "Control de inventario y seguimiento de proyectos para una empresa de paneles solares en Aguascalientes, con las cuadrillas de campo ubicadas en tiempo real en un mapa.",
    },
    "Softweb Tecnologías": {
      title: "Consultor de IA",
      detail:
        "Construí un agente de recuperación de información (RAG) con un sistema de permisos complejo sobre la base de datos del cliente: lo que devuelve depende de si preguntas como empleado o como alguien externo.",
    },
    "RGM Advanced": {
      title: "Agente de IA para ventas",
      detail:
        "Un agente de IA que atiende el embudo de ventas completo: responde preguntas, califica interesados, y pasa a un humano justo cuando hace falta.",
    },
  },
};

/**
 * Nivel 10⁶ — lo que dirige.
 *
 * El nivel se encabeza con su papel, no con el nombre de la empresa: Fractal
 * queda como el sujeto de la frase y él como el actor.
 *
 * Antes había una lista de tres pilares (Arquitectura / Producto /
 * Infraestructura). Se quitó: "Infraestructura" en realidad describía el
 * stack de un solo producto (Tesseract, GCP/Cloud Run/IAM), no de Fractal
 * como empresa, y el resto sonaba a taxonomía sin decir nada concreto. Un
 * párrafo, apoyado en cómo Fractal se describe a sí misma en
 * fractalops.com.mx, dice más con menos: automatización con IA para
 * negocios, y su alcance como cofundador —que es más que "la parte
 * técnica", cubre también hacia dónde va la empresa— sin reducirlo a un
 * cargo.
 */
const COMPANY_TEXT: Record<Lang, { role: string; body: string }> = {
  en: {
    role: "Co-founder & CEO",
    body: "Fractal is the AI automation company I co-founded in January 2025. We help businesses get repetitive work off their plate — customer support, paperwork, content — so that time goes somewhere else. As co-founder, I run the business end to end: I decide what we build, how it gets built, and where the company goes.",
  },
  es: {
    role: "Cofundador y CEO",
    body: "Fractal es la empresa de automatización con inteligencia artificial que cofundé en enero de 2025. Ayudamos a negocios a quitarse de encima el trabajo repetitivo —atención a clientes, papeleo, contenido— para que ese tiempo se vaya a otra cosa. Como cofundador, llevo el negocio de principio a fin: decido qué construimos, cómo se construye, y hacia dónde va la empresa.",
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
    headline: "Let's talk.",
    body: "If you have a project that needs to keep working long after launch — write to me.",
    linkLabels: { email: "Email", github: "GitHub", linkedin: "LinkedIn", fractal: "Fractal" },
  },
  es: {
    headline: "Hablemos.",
    body: "Si tienes un proyecto que necesita seguir funcionando mucho después del lanzamiento — escríbeme.",
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
    softSkillsLabel: string;
    certificationsLabel: string;
    /** Texto del `<summary>` que expande el detalle técnico de un proyecto. */
    seeTechnical: string;
    /** `aria-label` del `<nav>` que envuelve el menú de secciones. */
    navLabel: string;
    /** `aria-label` del botón que abre/cierra el menú — el texto visible es el nivel activo. */
    navToggle: string;
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
    softSkillsLabel: "Soft skills",
    certificationsLabel: "Certifications",
    seeTechnical: "Technical detail",
    navLabel: "Section navigation",
    navToggle: "Open section menu",
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
    softSkillsLabel: "Habilidades blandas",
    certificationsLabel: "Certificaciones",
    seeTechnical: "Detalle técnico",
    navLabel: "Navegación de secciones",
    navToggle: "Abrir menú de secciones",
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
    EDUCATION: {
      school: SCHOOL,
      degree: DEGREE[lang],
      period: formatPeriod(EDUCATION_START, EDUCATION_END, lang),
    },
    LANGUAGE: LANGUAGE_LINE[lang],
    SOFT_SKILLS: SOFT_SKILLS[lang],
    CERTIFICATIONS: CERTIFICATIONS_BASE.map((c) => ({
      ...c,
      date: monthYear(c.ym, lang, false),
    })),
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
