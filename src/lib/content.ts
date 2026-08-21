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
export const DOMAINS = ["AI systems", "Full-stack", "Infrastructure"] as const;

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
    items: ["React", "Next.js", "Angular", "Tailwind CSS", "TanStack Query"],
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

/** Nivel 10² — la arquitectura de Tesseract, dibujada. */
export const SYSTEM = {
  name: "Tesseract",
  /**
   * Primera persona a propósito. "An agent platform, not a chatbot wrapper"
   * describía un producto; esto describe a quien lo diseñó, que es de quien
   * trata el sitio.
   */
  tagline:
    "I architected and built it: three services, one shared conversation state, no chatbot wrapper.",
  /** Encabeza los mecanismos: son decisiones suyas, no features del producto. */
  mechanicsLead: "Three problems I had to solve",
  nodes: [
    {
      id: "web",
      label: "web-client",
      stack: "Next.js",
      note: "Operator console",
    },
    {
      id: "gateway",
      label: "gateway",
      stack: "NestJS · Node",
      // Las notas no pasan de ~22 caracteres: más largas se salen de la caja
      // de 120 unidades del diagrama en L3System.
      note: "Auth, routing, limits",
    },
    {
      id: "agents",
      label: "agents",
      stack: "Python",
      note: "Tool use, orchestration",
    },
    {
      id: "store",
      label: "postgres",
      stack: "Prisma",
      note: "Conversation state",
    },
  ],
  /** Lo que de verdad es difícil, y por qué. */
  mechanics: [
    {
      title: "Token-threshold triggers",
      body: "Conversations summarize themselves before they hit the context limit, instead of failing at it.",
    },
    {
      title: "Per-conversation locking",
      body: "Two messages arriving at once cannot interleave and corrupt the same thread's state.",
    },
    {
      title: "Multi-provider routing",
      body: "One interface over several model APIs, so a provider outage is a config change and not an incident.",
    },
  ],
} as const;

type Product = {
  name: string;
  what: string;
  /** Qué hizo él, explícito. Sin esto el nivel se lee como catálogo. */
  role: string;
  detail: string;
  stack: readonly string[];
  /** Solo los productos con superficie pública enlazan a algún lado. */
  href?: string;
};

/**
 * Nivel 10³ — lo que construyó.
 *
 * Cada entrada lleva su papel explícito y está escrita en primera persona. La
 * versión anterior ("Production SaaS for…", "Sold as SaaS…") era copy de
 * catálogo: describía qué vende Fractal, no qué hace él, y convertía su
 * portafolio en el deck de la empresa.
 */
export const PRODUCTS_LEAD = "Three products I build and maintain at Fractal.";

export const PRODUCTS: readonly Product[] = [
  {
    name: "Tesseract",
    what: "AI agent platform",
    role: "Architected and built",
    detail:
      "I designed the whole platform and built it to production: Python agents behind a NestJS gateway, operated from a Next.js console.",
    stack: ["Next.js", "NestJS", "TypeScript", "PostgreSQL", "Docker"],
    href: "https://fractalops.com.mx",
  },
  {
    name: "Axis",
    what: "Multi-tenant inventory",
    role: "Architecture and product direction",
    detail:
      "I set the multi-tenant model that lets every client define their own attributes, and the deployment split that ships it as SaaS, self-hosted, or fully offline.",
    stack: ["Nx", "Prisma", "Expo", "PostgreSQL"],
  },
  {
    name: "Fractal Hub",
    what: "Public surface",
    role: "Architecture and build",
    detail:
      "A Turborepo holding fractalops.com.mx and the Tesseract landing, so marketing ships with the site instead of with the product.",
    stack: ["Turborepo", "Next.js", "GSAP", "Three.js"],
    href: "https://fractalops.com.mx",
  },
] as const;

/** Nivel 10⁴ — trabajo por encargo: se cobra por proyecto. */
export const WORK = [
  {
    client: "RGM Advanced",
    role: "AI sales agent",
    period: "2025",
    detail:
      "Designed and shipped an AI agent that runs their sales funnel end to end — qualifying inbound leads, answering product questions, and handing off to a human at the moment it stops being useful.",
    stack: ["LLM agents", "RAG", "Automation"],
  },
  {
    client: "Solarity Paneles Solares",
    role: "Full Stack Developer",
    period: "May 2025 — Jan 2026",
    detail:
      "Inventory control and project tracking for a solar installer. Field crews are located through the Google Maps API; the whole thing ships through GitHub Actions into Docker Compose.",
    stack: ["Next.js", "React", "TypeScript", "Docker", "Tailwind"],
  },
  {
    client: "Softweb Tecnologías",
    role: "AI Consultant",
    period: "Apr — Oct 2025",
    detail:
      "Put LLMs into enterprise workflows using MCP for service orchestration, plus an agent that joins a document database to the tools a business actually runs on.",
    stack: ["MCP", "RAG", "LangChain"],
  },
  {
    client: "Gobierno de Aguascalientes · UAA",
    role: "Quality management system",
    period: "2026 — present",
    detail:
      "Traceability for artisanal cheese production under COFEPRIS norms NOM-243, NOM-251 and NOM-051. Seventy-three endpoints covering the full cycle: milk reception, sanitation, cold chain, inventory, distribution, and market withdrawal.",
    stack: ["Node.js", "Express", "MongoDB", "Redis", "Angular", "Docker"],
  },
] as const;

/** Nivel 10⁵ — investigación. Los números se ganaron su propio nivel. */
export const RESEARCH = {
  title: "Advanced Agent-based RAG Systems",
  institution: "Universidad Autónoma de Aguascalientes",
  projectId: "MP-80-25",
  period: "Jan — Nov 2025",
  body: "A multi-agent retrieval system built on LangGraph and LangChain, for autonomous information retrieval and contextual response generation.",
  metrics: [
    { value: "8.9", unit: "%", label: "reduction in cosine distance" },
    { value: "252", unit: "", label: "standardized benchmark questions" },
    { value: "5", unit: "+", label: "open-source LLMs compared" },
  ],
} as const;

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

/** Nivel 10⁷ — el territorio. */
export const TERRITORY = {
  city: "Aguascalientes",
  country: "México",
  /** Coordenadas reales de la ciudad; el nivel las dibuja como mira. */
  lat: 21.8853,
  lon: -102.2916,
  body: "All of it is built from a city of two million people in central México — for clients here, and for anyone who scrolled this far.",
} as const;

/** Nivel 10⁸ — el punto. */
export const CONTACT = {
  headline: "Back to a point of light.",
  body: "If you have something that needs to hold state, route across models, and stay up — write to me.",
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
