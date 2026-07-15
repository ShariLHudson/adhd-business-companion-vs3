"use client";

import type { EstateRecommendation } from "@/lib/profile/businessEstateRedesign";

type Props = {
  recommendation: EstateRecommendation;
  onPrimary: () => void;
  onChooseSomethingElse: () => void;
};

export function BusinessEstateRecommendationCard({
  recommendation,
  onPrimary,
  onChooseSomethingElse,
}: Props) {
  return (
    <section
      className="be-next-step"
      aria-labelledby="be-next-step-title"
      data-testid="be-next-step"
      data-recommendation-id={recommendation.id}
    >
      <p className="be-next-step__kicker" id="be-next-step-title">
        Your Next Helpful Step
      </p>
      <h2 className="be-next-step__title">{recommendation.title}</h2>
      <p className="be-next-step__subtitle">{recommendation.subtitle}</p>
      <p className="be-next-step__meta">{recommendation.meta}</p>
      <div className="be-next-step__actions">
        <button
          type="button"
          className="be-btn be-btn--primary"
          onClick={onPrimary}
          data-testid="be-next-step-primary"
        >
          {recommendation.primaryLabel}
        </button>
        <button
          type="button"
          className="be-btn be-btn--secondary"
          onClick={onChooseSomethingElse}
          data-testid="be-next-step-choose"
        >
          Choose Something Else
        </button>
      </div>
    </section>
  );
}
