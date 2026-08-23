/**
 * Genera `src/lib/tech-icons.ts` a partir de simple-icons.
 *
 * Se extraen los paths en vez de importar el paquete en runtime por dos
 * razones: el barrel de simple-icons son ~3000 iconos y depender de que el
 * bundler los sacuda bien es una apuesta innecesaria, y estos paths son datos
 * estáticos que no cambian. Así `simple-icons` se queda en devDependencies y
 * el costo en el cliente es el de 26 cadenas de texto.
 *
 * Para regenerar tras tocar el mapa:  node scripts/gen-tech-icons.mjs
 */
import { writeFile } from "node:fs/promises";
import * as si from "simple-icons";

/**
 * Etiqueta tal como aparece en `content.ts` → clave de simple-icons.
 *
 * Las que no están aquí se dibujan como monograma: REST, LlamaIndex,
 * Google ADK y CI/CD no son marcas y no tienen logo que poner.
 */
const MAP = {
  Python: "siPython",
  TypeScript: "siTypescript",
  JavaScript: "siJavascript",
  // simple-icons retiró el logo de Java por marca registrada; OpenJDK es la
  // implementación libre y es el sustituto correcto.
  Java: "siOpenjdk",
  React: "siReact",
  "Next.js": "siNextdotjs",
  Angular: "siAngular",
  "Tailwind CSS": "siTailwindcss",
  "TanStack": "siTanstack",
  NestJS: "siNestjs",
  FastAPI: "siFastapi",
  "Spring Boot": "siSpringboot",
  "Node.js": "siNodedotjs",
  Express: "siExpress",
  Kafka: "siApachekafka",
  LangChain: "siLangchain",
  LangGraph: "siLanggraph",
  Qdrant: "siQdrant",
  PyTorch: "siPytorch",
  TensorFlow: "siTensorflow",
  MCP: "siModelcontextprotocol",
  Pandas: "siPandas",
  PostgreSQL: "siPostgresql",
  MongoDB: "siMongodb",
  Redis: "siRedis",
  Prisma: "siPrisma",
  Docker: "siDocker",
  Nginx: "siNginx",
  GCP: "siGooglecloud",
  "GitHub Actions": "siGithubactions",
  GitLab: "siGitlab",
  // Emisores de certificaciones (nivel `about`), no tecnologías del stack.
  "The Linux Foundation": "siLinuxfoundation",
  Google: "siGoogle",
  Platzi: "siPlatzi",
};

const entries = [];
const missing = [];

for (const [label, key] of Object.entries(MAP)) {
  const icon = si[key];
  if (!icon?.path) {
    missing.push(`${label} (${key})`);
    continue;
  }
  entries.push(`  ${JSON.stringify(label)}: ${JSON.stringify(icon.path)},`);
}

if (missing.length) {
  console.error("Sin path en simple-icons:", missing.join(", "));
  process.exit(1);
}

const out = `// GENERADO por scripts/gen-tech-icons.mjs — no editar a mano.
// Regenerar:  node scripts/gen-tech-icons.mjs
//
// Cada valor es el atributo \`d\` de un glifo de 24×24 de simple-icons. Se
// pintan con \`fill="currentColor"\`, así que heredan el color del sitio y
// salen monocromáticos sin retocar nada.

export const TECH_ICON_PATHS: Record<string, string> = {
${entries.join("\n")}
};
`;

const dest = new URL("../src/lib/tech-icons.ts", import.meta.url);
await writeFile(dest, out, "utf8");
console.log(`Escritos ${entries.length} iconos en src/lib/tech-icons.ts`);
