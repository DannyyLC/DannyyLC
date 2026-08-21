/**
 * Todo el contenido del sitio, en un solo lugar.
 *
 * Los niveles del zoom se numeran por su exponente de escala: el sitio empieza
 * en 10⁻¹ (un caret) y termina en 10⁸ (un punto de luz). Ese exponente no es
 * decoración — es el índice narrativo y lo que muestra el HUD.
 */

export const IDENTITY = {
  name: "Daniel Limón Cervantes",
  shortName: "Daniel Limón",
  /**
   * Solo para <title> y OG, donde hace falta un sustantivo buscable. El hero
   * usa `DOMAINS`, que dice más. "Engineer" a secas se quedaba corto: no
   * mencionaba ni IA ni infraestructura.
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

/**
 * La línea del hero.
 *
 * La anterior —"every system on this page started as one blinking cursor"— era
 * una metáfora que no se sostenía sola: no decía qué iba a pasar ni de quién
 * era lo que se estaba viendo. Esta explica la mecánica de la página y coloca
 * el logro en la misma frase, sin recurrir a un título.
 */
export const THESIS =
  "This page starts at a cursor and pulls back until it reaches a company I built.";

/**
 * Tres dominios, no un puesto.
 *
 * "Engineer" se lee como "programador" y no dice nada de IA ni de
 * infraestructura, que es donde está la diferencia. Un puesto describe un
 * casillero; estos tres describen el alcance real.
 */
export const DOMAINS = ["AI", "Full-stack", "Infrastructure"] as const;

/**
 * Nivel 10⁰ — qué sabe hacer.
 *
 * Este nivel es sobre capacidad, no sobre cargos. La versión anterior dedicaba
 * dos de tres párrafos a Fractal, y un portafolio que dice "CEO" tres veces se
 * puede sustituir por un nombre en el landing de la empresa. Que es fundador se
 * cuenta en 10⁶, una sola vez, donde toca.
 *
 * Cada afirmación aquí está respaldada por algo verificable en `WORK`,
 * `SYSTEM` o `RESEARCH`. Nada de adjetivos sin evidencia detrás.
 */
export const BIO = [
  "I am a Computer Systems Engineering student at the Universidad Autónoma de Aguascalientes, graduating December 2027.",
  "I build whole systems, not slices of them. A project of mine usually has a React or Next.js front end, a NestJS, FastAPI or Spring Boot service behind it, PostgreSQL or MongoDB underneath, and a pipeline that puts all of it on GCP without anyone touching a server.",
  "AI is where I go deepest: multi-agent retrieval on LangGraph, RAG over vector stores, MCP for tool orchestration, and conversation systems that keep their state while routing across model providers. I measure the results — my research at the UAA cut cosine distance by 8.9% across 252 standardized questions.",
  "What I care about is the part that comes after the demo: locking, token budgets, provider failover, backups, the cold path at 2 a.m. It is the unglamorous half, and it decides whether a system is still running six months later.",
] as const;

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
 */
export const SKILL_GRAPH = [
  { group: "Languages", items: ["Python", "TypeScript", "JavaScript", "Java"] },
  {
    group: "Frontend",
    items: ["React", "Next.js", "Angular", "Tailwind CSS", "TanStack"],
  },
  {
    group: "Backend",
    items: ["NestJS", "FastAPI", "Spring Boot", "Node.js", "Express", "Kafka"],
  },
  {
    group: "AI / ML",
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
  { group: "Data", items: ["PostgreSQL", "MongoDB", "Redis", "Prisma"] },
  {
    group: "Infra",
    items: ["Docker", "Nginx", "GCP", "GitHub Actions", "GitLab"],
  },
] as const;

type Project = {
  name: string;
  what: string;
  /** Dónde se construyó. Distingue producto propio de encargo sin etiqueta. */
  client: string;
  role: string;
  detail: string;
  stack: readonly string[];
  href?: string;
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
 */
export const PROJECTS: readonly Project[] = [
  {
    name: "Tesseract",
    what: "AI agent platform",
    client: "Fractal",
    role: "Architected and built",
    detail:
      "A platform for building and running AI agents in production. I designed it and took it from an empty repository to a paying deployment.",
    stack: ["Next.js", "NestJS", "TypeScript", "PostgreSQL", "Docker"],
    href: "https://app.tesseract.fractalops.com.mx",
  },
  {
    name: "Agent-based RAG",
    what: "Research · MP-80-25",
    client: "Universidad Autónoma de Aguascalientes",
    role: "Built the retrieval system",
    // El 8.9% va dentro de la frase y no como número gigante. Destacarlo en
    // grande lo convertía en la única cosa medible del sitio y por contraste
    // hacía parecer que lo demás no lo estaba.
    detail:
      "A multi-agent retrieval system on LangGraph and LangChain for autonomous information retrieval, benchmarked against several open-source models. It cut cosine distance by 8.9% across 252 standardized questions.",
    stack: ["LangGraph", "LangChain", "Python", "Qdrant"],
  },
  {
    name: "Axis",
    what: "Multi-tenant inventory",
    client: "Fractal",
    role: "Architecture and product direction",
    detail:
      "Inventory where every client defines their own attributes. I set the tenancy model and the deployment split that ships it as SaaS, self-hosted, or fully offline.",
    stack: ["Nx", "Prisma", "Expo", "PostgreSQL"],
  },
  {
    name: "Fractal Hub",
    what: "Public surface",
    client: "Fractal",
    role: "Architecture and build",
    detail:
      "A Turborepo holding fractalops.com.mx and the Tesseract landing, so marketing ships with the site instead of with the product.",
    stack: ["Turborepo", "Next.js", "GSAP", "Three.js"],
    href: "https://fractalops.com.mx",
  },
];

type Role = {
  org: string;
  title: string;
  period: string;
  detail: string;
  stack: readonly string[];
};

/**
 * Experiencia — puestos, con fechas.
 *
 * Va en tabla y no en tarjetas a propósito, aunque el nivel anterior sí las
 * use: lo que se escanea aquí es quién, qué puesto y cuándo, y una tabla
 * entrega esas tres columnas de un vistazo.
 *
 * Ordenada por lo más reciente, con lo que sigue en curso arriba.
 */
export const EXPERIENCE: readonly Role[] = [
  {
    org: "Fractal",
    title: "Co-founder & CEO",
    period: "Jan 2025 — present",
    detail:
      "I own the technical side from zero to production: architecture, product decisions, and the cloud it all runs on.",
    stack: ["Next.js", "NestJS", "PostgreSQL", "GCP", "Docker"],
  },
  {
    org: "Gobierno de Aguascalientes · UAA",
    title: "Quality management system",
    period: "2026 — present",
    detail:
      "Traceability for artisanal cheese production under COFEPRIS norms NOM-243, NOM-251 and NOM-051. Seventy-three endpoints covering milk reception, sanitation, cold chain, inventory, distribution and market withdrawal.",
    stack: ["Node.js", "Express", "MongoDB", "Redis", "Angular", "Docker"],
  },
  {
    org: "Solarity Paneles Solares",
    title: "Full Stack Developer",
    period: "May 2025 — Jan 2026",
    detail:
      "Inventory control and project tracking for a solar installer. Field crews are located through the Google Maps API; the whole thing ships through GitHub Actions.",
    stack: ["Next.js", "React", "TypeScript", "Docker", "Tailwind CSS"],
  },
  {
    org: "Softweb Tecnologías",
    title: "AI Consultant",
    period: "Apr — Oct 2025",
    detail:
      "Put LLMs into enterprise workflows using MCP for service orchestration, plus an agent joining a document database to the tools a business actually runs on.",
    stack: ["MCP", "RAG", "LangChain"],
  },
  {
    org: "RGM Advanced",
    title: "AI sales agent",
    period: "2025",
    detail:
      "An agent that runs their sales funnel end to end: it qualifies inbound leads, answers product questions, and hands off to a human at the moment it stops being useful.",
    stack: ["LLM agents", "RAG", "Automation"],
  },
];

/**
 * Nivel 10⁶ — lo que dirige.
 *
 * El nivel se encabeza con su papel, no con el nombre de la empresa: Fractal
 * queda como el sujeto de la frase y él como el actor. Los pilares dejaron de
 * ser el catálogo de la empresa —"Products · Services · Infrastructure"— para
 * ser el alcance de lo que él decide.
 */
export const COMPANY = {
  name: "Fractal",
  role: "Co-founder & CEO",
  since: "January 2025",
  url: IDENTITY.companyUrl,
  domain: IDENTITY.companyDomain,
  body: "I co-founded Fractal in January 2025 and own the technical side from zero to production. I am the person who decides how it is built, and the person on call when it breaks.",
  pillars: [
    {
      label: "Architecture",
      body: "Every service, schema, and deployment boundary",
    },
    {
      label: "Product",
      body: "What gets built, in what order, and what gets cut",
    },
    { label: "Infrastructure", body: "GCP — Cloud Run, Cloud Storage, IAM" },
  ],
} as const;

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
export const CONTACT = {
  headline: "Back to a point of light.",
  body: "If you have something that needs to hold state, route across models, and stay up — write to me.",
  location: IDENTITY.location,
  links: [
    { label: "Email", value: IDENTITY.email, href: `mailto:${IDENTITY.email}` },
    { label: "GitHub", value: IDENTITY.githubHandle, href: IDENTITY.github },
    {
      label: "LinkedIn",
      value: IDENTITY.linkedinHandle,
      href: IDENTITY.linkedin,
    },
    { label: "Fractal", value: IDENTITY.companyDomain, href: IDENTITY.companyUrl },
  ],
} as const;
