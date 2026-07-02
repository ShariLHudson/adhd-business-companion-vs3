"use client";

import type { BusinessMasteryMinuteModel } from "@/lib/momentumInstitute/curriculum/types";

type Props = BusinessMasteryMinuteModel & {
  className?: string;
};

export function BusinessMasteryMinute({
  title,
  essentialQuestion,
  corePrinciple,
  keyIdeas,
  estimatedMinutes,
  className,
}: Props) {
  if (!corePrinciple && keyIdeas.length === 0) return null;

  return (
    <section
      className={["institute-curriculum-bmm", className].filter(Boolean).join(" ")}
      aria-label="Business Mastery Minute"
      data-testid="business-mastery-minute"
    >
      <h3 className="institute-knowledge-panel__section-title">
        Business Mastery Minute™
      </h3>
      <p className="institute-curriculum-bmm__meta">
        {title} · about {estimatedMinutes} min
      </p>
      {essentialQuestion ? (
        <p className="institute-curriculum-bmm__question">{essentialQuestion}</p>
      ) : null}
      {corePrinciple ? (
        <p className="institute-knowledge-panel__prose institute-curriculum-bmm__principle">
          {corePrinciple}
        </p>
      ) : null}
      {keyIdeas.length > 0 ? (
        <ul className="institute-knowledge-panel__list institute-curriculum-bmm__ideas">
          {keyIdeas.map((idea) => (
            <li key={idea}>{idea}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
