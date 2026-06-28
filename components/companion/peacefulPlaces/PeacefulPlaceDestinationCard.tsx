"use client";

import type { Soundscape } from "@/lib/soundscapes/types";

type Props = {
  destinationName: string;
  experience: string;
  tagline: string;
  signature?: boolean;
  addedByYou?: boolean;
  onEnter: () => void;
};

export function PeacefulPlaceDestinationCard({
  destinationName,
  experience,
  tagline,
  signature,
  addedByYou,
  onEnter,
}: Props) {
  return (
    <article className="peaceful-places-destination-card">
      {signature ? (
        <p className="peaceful-places-destination-card__signature">
          Signature destination
        </p>
      ) : null}
      <h3 className="peaceful-places-destination-card__name">{destinationName}</h3>
      <p className="peaceful-places-destination-card__experience">
        {addedByYou ? "Added by You" : experience}
      </p>
      <p className="peaceful-places-destination-card__tagline">{tagline}</p>
      <button
        type="button"
        onClick={onEnter}
        className="peaceful-places-brass-plaque"
        aria-label={`Come on in to ${destinationName}`}
      >
        Come On In
      </button>
    </article>
  );
}

export function PeacefulPlaceDestinationCardFromSoundscape({
  soundscape,
  onEnter,
}: {
  soundscape: Soundscape;
  onEnter: (soundscape: Soundscape) => void;
}) {
  return (
    <PeacefulPlaceDestinationCard
      destinationName={soundscape.destinationName}
      experience={soundscape.experience}
      tagline={soundscape.tagline}
      signature={soundscape.signature}
      onEnter={() => onEnter(soundscape)}
    />
  );
}
