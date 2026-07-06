"use client";

import Link from "next/link";

import type { EstateThinkingPlace } from "@/lib/founder/strategyCenter/types";

type EstateThinkingRowProps = {
  places: EstateThinkingPlace[];
};

export function EstateThinkingRow({ places }: EstateThinkingRowProps) {
  return (
    <section className="strategy-estate" aria-labelledby="strategy-estate-heading">
      <h2 className="strategy-estate__heading" id="strategy-estate-heading">
        Continue Thinking in…
      </h2>
      <div className="strategy-estate__track">
        {places.map((place) => (
          <Link
            key={place.id}
            href={place.href}
            className="strategy-estate__place"
            title={place.feeling}
          >
            <span className="strategy-estate__place-label">{place.label}</span>
            <span className="strategy-estate__place-feeling">{place.feeling}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
