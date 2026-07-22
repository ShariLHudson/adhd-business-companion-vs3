"use client";

import {
  SHOW_ME_HOW_THIS_FITS_TOGETHER_LABEL,
  hasHowThisFitsTogetherLink,
  requestOpenHowSparkEstateWorksTogether,
  resolveEstateOrientationPlaceId,
} from "@/lib/estateOrientation";
import "@/app/companion/how-spark-estate-works-together.css";

type Props = {
  /** Workspace help areaId, estate place id, or orientation place id */
  areaOrPlaceId: string;
  className?: string;
  label?: string;
  /** Open the optional Estate Tour invitation */
  startTour?: boolean;
};

/**
 * Quiet link from a major destination into the shared estate mental model.
 */
export function HowThisFitsTogetherLink({
  areaOrPlaceId,
  className = "",
  label = SHOW_ME_HOW_THIS_FITS_TOGETHER_LABEL,
  startTour = false,
}: Props) {
  if (!hasHowThisFitsTogetherLink(areaOrPlaceId)) return null;

  const focusPlaceId = resolveEstateOrientationPlaceId(areaOrPlaceId);

  return (
    <button
      type="button"
      className={`how-this-fits-link ${className}`.trim()}
      data-testid={`how-this-fits-together-${areaOrPlaceId}`}
      onClick={() =>
        requestOpenHowSparkEstateWorksTogether({
          focusPlaceId,
          startTour,
        })
      }
    >
      {label}
    </button>
  );
}
