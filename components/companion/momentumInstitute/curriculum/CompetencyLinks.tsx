"use client";

import type { CurriculumRelatedCardRef } from "@/lib/momentumInstitute/curriculum/types";

type Props = {
  competencyIds: string[];
  relatedCards: CurriculumRelatedCardRef[];
  relatedApprenticeships: string[];
  relatedBusinessLabs?: string[];
  relatedSimulations?: string[];
  relatedChallenges?: string[];
};

export function CompetencyLinks({
  competencyIds,
  relatedCards,
  relatedApprenticeships,
  relatedBusinessLabs,
  relatedSimulations,
  relatedChallenges,
}: Props) {
  const hasLinks =
    competencyIds.length > 0 ||
    relatedCards.length > 0 ||
    relatedApprenticeships.length > 0 ||
    (relatedBusinessLabs?.length ?? 0) > 0 ||
    (relatedSimulations?.length ?? 0) > 0 ||
    (relatedChallenges?.length ?? 0) > 0;

  if (!hasLinks) return null;

  return (
    <section
      className="institute-knowledge-panel__section institute-knowledge-panel__related institute-curriculum-competencies"
      aria-label="Related competencies and learning"
      data-testid="competency-links"
    >
      <h3 className="institute-knowledge-panel__section-title">
        Related competencies & learning
      </h3>
      <ul className="institute-knowledge-panel__related-list">
        {competencyIds.map((id) => (
          <li key={`comp-${id}`}>
            <span className="institute-knowledge-panel__related-chip">
              Competency: {formatSlug(id)}
            </span>
          </li>
        ))}
        {relatedCards.map((card) => (
          <li key={`card-${card.id}`}>
            <span className="institute-knowledge-panel__related-chip">
              {card.id}
              {card.relationship ? ` — ${card.relationship}` : ""}
            </span>
          </li>
        ))}
        {relatedApprenticeships.map((name) => (
          <li key={`app-${name}`}>
            <span className="institute-knowledge-panel__related-chip">
              Apprenticeship: {name}
            </span>
          </li>
        ))}
        {relatedBusinessLabs?.map((name) => (
          <li key={`lab-${name}`}>
            <span className="institute-knowledge-panel__related-chip">
              Business Lab: {name}
            </span>
          </li>
        ))}
        {relatedSimulations?.map((name) => (
          <li key={`sim-${name}`}>
            <span className="institute-knowledge-panel__related-chip">
              Simulation: {name}
            </span>
          </li>
        ))}
        {relatedChallenges?.map((name) => (
          <li key={`chal-${name}`}>
            <span className="institute-knowledge-panel__related-chip">
              Challenge: {name}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function formatSlug(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
