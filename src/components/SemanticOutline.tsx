import {
  BIO,
  COMPANY,
  CONTACT,
  DOMAINS,
  IDENTITY,
  PRODUCTS,
  RESEARCH,
  SKILL_GRAPH,
  SYSTEM,
  TERRITORY,
  THESIS,
  WORK,
} from "@/lib/content";

/**
 * El sitio en texto plano, para lectores de pantalla y para los rastreadores.
 *
 * El escenario del zoom va `aria-hidden` por una razón mecánica: sus capas se
 * ocultan con `visibility: hidden` para que el navegador no las pinte, y eso
 * también las saca del árbol de accesibilidad. Un lector de pantalla solo
 * alcanzaría los dos o tres niveles visibles en ese instante.
 *
 * Esto no es un resumen ni una versión reducida: es el mismo contenido, en
 * orden, con jerarquía real de encabezados. Se construye desde `content.ts`, no
 * desde los componentes, para no montar dos veces las animaciones de GSAP.
 */
export default function SemanticOutline() {
  return (
    <div className="sr-only">
      <h1>{IDENTITY.name}</h1>
      <p>
        {DOMAINS.join(" · ")} — {IDENTITY.location}
      </p>
      <p>{THESIS}</p>

      <h2>About</h2>
      {BIO.map((line) => (
        <p key={line.slice(0, 24)}>{line}</p>
      ))}

      <h2>Technical skills</h2>
      {SKILL_GRAPH.map((branch) => (
        <p key={branch.group}>
          <strong>{branch.group}:</strong> {branch.items.join(", ")}
        </p>
      ))}

      <h2>{SYSTEM.name}</h2>
      <p>{SYSTEM.tagline}</p>
      {SYSTEM.nodes.map((n) => (
        <p key={n.id}>
          {n.label} — {n.stack}. {n.note}
        </p>
      ))}
      {SYSTEM.mechanics.map((m) => (
        <p key={m.title}>
          <strong>{m.title}:</strong> {m.body}
        </p>
      ))}

      <h2>Products</h2>
      {PRODUCTS.map((p) => (
        <section key={p.name}>
          <h3>
            {p.name} — {p.what}
          </h3>
          <p>{p.role}</p>
          <p>{p.detail}</p>
          <p>{p.stack.join(", ")}</p>
        </section>
      ))}

      <h2>Work</h2>
      {WORK.map((w) => (
        <section key={w.client}>
          <h3>
            {w.client} — {w.role}
          </h3>
          <p>{w.period}</p>
          <p>{w.detail}</p>
          <p>{w.stack.join(", ")}</p>
        </section>
      ))}

      <h2>{RESEARCH.title}</h2>
      <p>
        {RESEARCH.institution} · {RESEARCH.projectId} · {RESEARCH.period}
      </p>
      <p>{RESEARCH.body}</p>
      {RESEARCH.metrics.map((m) => (
        <p key={m.label}>
          {m.value}
          {m.unit} {m.label}
        </p>
      ))}

      <h2>
        {COMPANY.name} — {COMPANY.role}
      </h2>
      <p>Since {COMPANY.since}</p>
      <p>{COMPANY.body}</p>
      {COMPANY.pillars.map((p) => (
        <p key={p.label}>
          <strong>{p.label}:</strong> {p.body}
        </p>
      ))}
      <p>
        <a href={COMPANY.url}>{COMPANY.domain}</a>
      </p>

      <h2>
        {TERRITORY.city}, {TERRITORY.country}
      </h2>
      <p>{TERRITORY.body}</p>

      <h2>Contact</h2>
      <p>{CONTACT.body}</p>
      <ul>
        {CONTACT.links.map((link) => (
          <li key={link.label}>
            <a href={link.href}>
              {link.label}: {link.value}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
