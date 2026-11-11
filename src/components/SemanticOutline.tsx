"use client";

import { useContent } from "@/lib/i18n";

/**
 * El sitio en texto plano, para lectores de pantalla y para los rastreadores.
 *
 * El escenario del zoom va `aria-hidden` por una razón mecánica: sus capas se
 * ocultan con `visibility: hidden` para que el navegador no las pinte, y eso
 * también las saca del árbol de accesibilidad. Un lector de pantalla solo
 * alcanzaría los dos o tres niveles visibles en ese instante.
 *
 * Esto no es un resumen ni una versión reducida: es el mismo contenido, en
 * orden, con jerarquía real de encabezados. Se construye desde `content.ts`
 * (vía `useContent`), no desde los componentes, para no montar dos veces las
 * animaciones de GSAP. Es un componente de cliente —no Server— porque tiene
 * que reaccionar al mismo cambio de idioma que el resto del sitio.
 *
 * También es donde viven las tecnologías que el carrusel no dibuja por no tener
 * logo. Aquí sí aparecen, que es lo que importa para búsqueda y para los
 * filtros automáticos de reclutamiento.
 */
export default function SemanticOutline() {
  const {
    IDENTITY,
    DOMAINS,
    THESIS,
    BIO,
    EDUCATION,
    LANGUAGE,
    SOFT_SKILLS,
    CERTIFICATIONS,
    SKILL_GRAPH,
    PROJECTS,
    EXPERIENCE,
    COMPANY,
    CONTACT,
    UI,
  } = useContent();

  return (
    <div className="sr-only">
      <h1>{IDENTITY.name}</h1>
      <p>
        {DOMAINS.join(" · ")} — {IDENTITY.location}
      </p>
      <p>{THESIS}</p>

      <h2>{UI.semantic.about}</h2>
      {BIO.map((line) => (
        <p key={line.slice(0, 24)}>{line}</p>
      ))}
      <p>
        {EDUCATION.degree} — {EDUCATION.school}, {EDUCATION.period}
      </p>
      <p>{LANGUAGE}</p>
      <p>
        <strong>{UI.softSkillsLabel}:</strong> {SOFT_SKILLS.join(", ")}
      </p>
      {CERTIFICATIONS.map((c) => (
        <p key={c.title}>
          <strong>{c.title}</strong> — {c.issuer}, {c.date}
        </p>
      ))}

      <h2>{UI.semantic.technicalSkills}</h2>
      {SKILL_GRAPH.map((branch) => (
        <p key={branch.groupKey}>
          <strong>{branch.group}:</strong> {branch.items.join(", ")}
        </p>
      ))}

      <h2>{UI.semantic.projects}</h2>
      {PROJECTS.map((p) => (
        <section key={p.name}>
          <h3>
            {p.name} — {p.what}
          </h3>
          <p>{p.client}</p>
          <p>{p.role}</p>
          <p>{p.detail}</p>
          {/* Las secciones de la vista detallada (`ProjectPanel`), que vive
              en un diálogo fuera de este árbol. */}
          {p.problem && (
            <p>
              <strong>{UI.panel.problem}:</strong> {p.problem}
            </p>
          )}
          {p.built && (
            <p>
              <strong>{UI.panel.built}:</strong> {p.built}
            </p>
          )}
          {p.decisions && (
            <p>
              <strong>{UI.panel.decisions}:</strong> {p.decisions}
            </p>
          )}
          {p.result && (
            <p>
              <strong>{UI.panel.result}:</strong> {p.result}
            </p>
          )}
          <p>{p.technical}</p>
          <p>{p.stack.join(", ")}</p>
        </section>
      ))}

      <h2>{UI.semantic.experience}</h2>
      {EXPERIENCE.map((role) => (
        <section key={role.org}>
          <h3>
            {role.title} — {role.org}
          </h3>
          <p>
            {role.period} · {role.ongoing ? UI.role.ongoing : UI.role.completed}
          </p>
          <p>{role.detail}</p>
          {/* Las secciones de la ficha del puesto (`RolePanel`). */}
          {role.assignment && (
            <p>
              <strong>{UI.role.assignment}:</strong> {role.assignment}
            </p>
          )}
          {role.delivered && (
            <p>
              <strong>{UI.role.delivered}:</strong> {role.delivered}
            </p>
          )}
          {role.result && (
            <p>
              <strong>{UI.role.result}:</strong> {role.result}
            </p>
          )}
          {role.projects.length > 0 && (
            <p>
              <strong>{UI.relatedProjects}:</strong> {role.projects.join(", ")}
            </p>
          )}
          <p>{role.stack.join(", ")}</p>
        </section>
      ))}

      <h2>
        {COMPANY.name} — {COMPANY.role}
      </h2>
      {/* `UI.since` es minúscula porque en `L5Company` va a media frase
          ("Fractal · since …"); aquí abre la oración y se capitaliza. */}
      <p>
        {UI.since[0].toUpperCase() + UI.since.slice(1)} {COMPANY.sinceLabel}
      </p>
      <p>{COMPANY.body}</p>
      <p>
        <a href={COMPANY.url}>{COMPANY.domain}</a>
      </p>

      <h2>{UI.semantic.contact}</h2>
      <p>{CONTACT.body}</p>
      <p>{CONTACT.location}</p>
      <ul>
        {CONTACT.links.map((link) => (
          <li key={link.key}>
            <a href={link.href}>
              {link.label}: {link.value}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
