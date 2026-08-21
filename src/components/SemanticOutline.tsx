import {
  BIO,
  COMPANY,
  CONTACT,
  DOMAINS,
  EXPERIENCE,
  IDENTITY,
  PROJECTS,
  SKILL_GRAPH,
  THESIS,
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
 *
 * También es donde viven las tecnologías que el carrusel no dibuja por no tener
 * logo. Aquí sí aparecen, que es lo que importa para búsqueda y para los
 * filtros automáticos de reclutamiento.
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

      <h2>Projects</h2>
      {PROJECTS.map((p) => (
        <section key={p.name}>
          <h3>
            {p.name} — {p.what}
          </h3>
          <p>{p.client}</p>
          <p>{p.role}</p>
          <p>{p.detail}</p>
          <p>{p.stack.join(", ")}</p>
        </section>
      ))}

      <h2>Experience</h2>
      {EXPERIENCE.map((role) => (
        <section key={role.org}>
          <h3>
            {role.title} — {role.org}
          </h3>
          <p>{role.period}</p>
          <p>{role.detail}</p>
          <p>{role.stack.join(", ")}</p>
        </section>
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

      <h2>Contact</h2>
      <p>{CONTACT.body}</p>
      <p>{CONTACT.location}</p>
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
