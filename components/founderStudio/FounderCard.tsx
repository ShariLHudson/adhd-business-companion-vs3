import type { FounderLabelTone } from "@/lib/founderStudio/types";

import { FounderLabel } from "./FounderLabel";

type FounderCardProps = {
  title: string;
  summary: string;
  tone?: FounderLabelTone;
  toneLabel?: string;
  meta?: string;
};

export function FounderCard({
  title,
  summary,
  tone,
  toneLabel,
  meta,
}: FounderCardProps) {
  return (
    <article className="founder-card">
      <div className="founder-card__top">
        <h3 className="founder-card__title">{title}</h3>
        {tone ? (
          <FounderLabel tone={tone}>{toneLabel ?? title}</FounderLabel>
        ) : null}
      </div>
      <p className="founder-card__summary">{summary}</p>
      {meta ? <p className="founder-card__meta">{meta}</p> : null}
    </article>
  );
}
