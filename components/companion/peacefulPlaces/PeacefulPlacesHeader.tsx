"use client";

import {
  PEACEFUL_PLACES_SUBTITLE,
  PEACEFUL_PLACES_TITLE,
} from "@/lib/peacefulPlaces/directory";

/** Centered landing headline — replaces baked photograph title. */
export function PeacefulPlacesHeader() {
  return (
    <header className="peaceful-places-landing__header" aria-labelledby="peaceful-places-title">
      <h1 id="peaceful-places-title" className="peaceful-places-landing__title">
        {PEACEFUL_PLACES_TITLE}
      </h1>
      <p className="peaceful-places-landing__subtitle">{PEACEFUL_PLACES_SUBTITLE}</p>
    </header>
  );
}
