"use client";

import { roomBackgroundDirectCss } from "@/lib/roomBackgroundAssets";
import type { GrowthEstateChoice } from "@/lib/growth/growthEstateChoices";

type Props = {
  choice: GrowthEstateChoice;
  onSelect: () => void;
};

/** Estate entrance card — image on top, parchment body, calm typography. */
export function GrowthStoryChoiceCard({ choice, onSelect }: Props) {
  return (
    <button
      type="button"
      className={`growth-estate-choice${choice.id === "explore" ? " growth-estate-choice--explore" : ""}`}
      onClick={onSelect}
      data-testid={choice.testId}
    >
      <span
        className="growth-estate-choice__photo"
        style={{ backgroundImage: roomBackgroundDirectCss(choice.image) }}
        aria-hidden="true"
      />
      <span className="growth-estate-choice__copy">
        <span className="growth-estate-choice__label">{choice.label}</span>
        <span className="growth-estate-choice__headline">{choice.headline}</span>
        <span className="growth-estate-choice__description">{choice.description}</span>
        <span className="growth-estate-choice__quote">{choice.quote}</span>
        <span className="growth-estate-choice__cta">{choice.cta}</span>
      </span>
    </button>
  );
}
