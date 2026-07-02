"use client";

import { roomBackgroundDirectCss } from "@/lib/roomBackgroundAssets";
import type { GrowthProfileEstatePlace } from "@/lib/growth/growthProfileEstatePlaces";

type Props = {
  place: GrowthProfileEstatePlace;
  onOpen: () => void;
};

/** Growth Profile™ estate destination — photographic room plate on top. */
export function GrowthProfileEstatePlaceCard({ place, onOpen }: Props) {
  return (
    <button
      type="button"
      className="growth-estate-choice growth-profile-estate-place"
      onClick={onOpen}
      data-testid={`growth-profile-place-${place.actionId}`}
    >
      <span
        className="growth-estate-choice__photo"
        style={{ backgroundImage: roomBackgroundDirectCss(place.image) }}
        aria-hidden="true"
      />
      <span className="growth-estate-choice__copy">
        <span className="growth-estate-choice__headline">{place.title}</span>
        <span className="growth-estate-choice__description">{place.description}</span>
        <span className="growth-estate-choice__cta">{place.cta}</span>
      </span>
    </button>
  );
}
