"use client";

import type { GrowthPrimaryDestination } from "@/lib/growthCapture";
import { GROWTH_PRIMARY_DESTINATIONS } from "@/lib/growthCapture";

type Props = {
  suggested: GrowthPrimaryDestination;
  onSelect: (destination: GrowthPrimaryDestination) => void;
  onLeaveUncategorized: () => void;
  disabled?: boolean;
};

export function GrowthDestinationPlaques({
  suggested,
  onSelect,
  onLeaveUncategorized,
  disabled,
}: Props) {
  const plaques = GROWTH_PRIMARY_DESTINATIONS;

  return (
    <div>
      <div className="growth-capture__plaques" role="group" aria-label="Choose a home for this capture">
        {plaques.map((plaque) => {
          const isSuggested =
            suggested === plaque.id && suggested !== "uncategorized";
          return (
            <button
              key={plaque.id}
              type="button"
              className={`growth-capture__plaque ${isSuggested ? "growth-capture__plaque--suggested" : ""}`}
              onClick={() => onSelect(plaque.id)}
              disabled={disabled}
              aria-pressed={isSuggested}
            >
              {isSuggested ? (
                <span className="growth-capture__plaque-lantern" aria-hidden="true" />
              ) : null}
              <span className="growth-capture__plaque-label">{plaque.label}</span>
              <span className="growth-capture__plaque-sub">{plaque.subtitle}</span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className="growth-capture__later"
        onClick={onLeaveUncategorized}
        disabled={disabled}
      >
        Leave uncategorized for later
      </button>
    </div>
  );
}
