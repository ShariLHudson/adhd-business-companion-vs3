import type { FounderExecutiveRecommendation } from "@/lib/founder/types/workspace";

import { PriorityBadge } from "./executive";

type FounderExecutiveRecommendationProps = {
  recommendation: FounderExecutiveRecommendation;
};

function ImpactStars({ count }: { count: number }) {
  return (
    <span className="founder-impact-stars" aria-label={`Estimated impact: ${count} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`founder-impact-stars__star${i < count ? " founder-impact-stars__star--on" : ""}`}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </span>
  );
}

export function FounderExecutiveRecommendationCard({
  recommendation,
}: FounderExecutiveRecommendationProps) {
  return (
    <section className="founder-exec-rec" aria-labelledby="founder-exec-rec-title">
      <p className="founder-exec-rec__eyebrow" id="founder-exec-rec-label">
        Today&apos;s Executive Recommendation
      </p>
      <h2 className="founder-exec-rec__title" id="founder-exec-rec-title">
        {recommendation.title}
      </h2>
      <p className="founder-exec-rec__summary">{recommendation.summary}</p>
      <div className="founder-exec-rec__footer">
        {recommendation.tone ? (
          <PriorityBadge tone={recommendation.tone}>Focus</PriorityBadge>
        ) : null}
        <div className="founder-exec-rec__impact">
          <span className="founder-exec-rec__impact-label">Estimated Impact</span>
          <ImpactStars count={recommendation.impactStars} />
        </div>
      </div>
    </section>
  );
}
