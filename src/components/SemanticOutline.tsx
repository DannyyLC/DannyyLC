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
  const { IDENTITY, DOMAINS, THESIS, BIO, SKILL_GRAPH, PROJECTS, EXPERIENCE, COMPANY, CONTACT, UI } =
    useContent();

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
          <p>{p.stack.join(", ")}</p>
        </section>
      ))}

      <h2>{UI.semantic.experience}</h2>
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
      {/* `UI.since` es minúscula porque en `L5Company` va a media frase
          ("Fractal · since …"); aquí abre la oración y se capitaliza. */}
      <p>
        {UI.since[0].toUpperCase() + UI.since.slice(1)} {COMPANY.sinceLabel}
      </p>
      <p>{COMPANY.body}</p>
      {COMPANY.pillars.map((p) => (
        <p key={p.label}>
          <strong>{p.label}:</strong> {p.body}
        </p>
      ))}
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
