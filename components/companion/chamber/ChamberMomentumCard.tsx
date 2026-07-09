"use client";

import {
  buildChamberMomentumCard,
  intelligenceTargetForNeed,
  type ChamberMomentumCard,
} from "@/lib/estate/chamber/chamberMemberJourney";
import { buildSparkEstateMomentumCard } from "@/lib/estate/sparkEstateCardEcosystem";

type Props = {
  card?: ChamberMomentumCard | null;
};

/** Personalized Momentum Card — current focus, next step, and recommended action. */
export function ChamberMomentumCardPanel({ card }: Props) {
  const momentumCard = card ?? buildChamberMomentumCard();
  if (!momentumCard) return null;

  const ecosystemCard = buildSparkEstateMomentumCard();
  const intelligence = intelligenceTargetForNeed(momentumCard.recommendedNeed);

  return (
    <section
      className="chamber-entry__momentum-card chamber-room__panel"
      aria-label="Your Momentum Card"
      data-testid="chamber-momentum-card"
    >
      <h2 className="chamber-entry__momentum-card-title">Your Momentum Card</h2>

      {ecosystemCard?.headline ? (
        <p className="chamber-entry__momentum-card-headline">{ecosystemCard.headline}</p>
      ) : null}

      {momentumCard.activeProjectName ? (
        <p className="chamber-entry__momentum-card-row">
          <span className="chamber-entry__momentum-card-label">Active project</span>
          <span>{momentumCard.activeProjectName}</span>
        </p>
      ) : null}

      {momentumCard.nextStep ? (
        <p className="chamber-entry__momentum-card-row">
          <span className="chamber-entry__momentum-card-label">Next step</span>
          <span>{momentumCard.nextStep}</span>
        </p>
      ) : null}

      {momentumCard.currentFocus ? (
        <p className="chamber-entry__momentum-card-row">
          <span className="chamber-entry__momentum-card-label">Where you left off</span>
          <span>{momentumCard.currentFocus}</span>
        </p>
      ) : null}

      {momentumCard.progressSummary ? (
        <p className="chamber-entry__momentum-card-row">
          <span className="chamber-entry__momentum-card-label">Progress</span>
          <span>{momentumCard.progressSummary}</span>
        </p>
      ) : null}

      {momentumCard.recentWin ? (
        <p className="chamber-entry__momentum-card-row">
          <span className="chamber-entry__momentum-card-label">Recent win</span>
          <span>{momentumCard.recentWin}</span>
        </p>
      ) : null}

      <p className="chamber-entry__momentum-card-recommendation">
        <span className="chamber-entry__momentum-card-label">Recommended</span>
        {momentumCard.recommendedAction}
      </p>
      <p className="chamber-entry__momentum-card-intelligence">
        {intelligence.purpose}
      </p>
    </section>
  );
}
