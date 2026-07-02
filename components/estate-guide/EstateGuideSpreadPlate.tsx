"use client";

import { useCallback, useEffect, useState } from "react";
import { estateRoomBackgroundCandidates } from "@/lib/estate/estateRoomAssets";

type Props = {
  placeId: string;
  imageUrl: string | null;
  alt: string;
  className?: string;
};

/** Guidebook photograph plate — tries PNG/WebP fallbacks like live rooms. */
export function EstateGuideSpreadPlate({
  placeId,
  imageUrl,
  alt,
  className,
}: Props) {
  const candidates = estateRoomBackgroundCandidates(placeId, imageUrl);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCandidateIndex(0);
    setFailed(false);
  }, [placeId, imageUrl, candidates[0]]);

  const handleError = useCallback(() => {
    setCandidateIndex((index) => {
      if (index + 1 < candidates.length) return index + 1;
      setFailed(true);
      return index;
    });
  }, [candidates.length]);

  const src = candidates[candidateIndex];

  return (
    <figure className={["eg-guide-plate", className].filter(Boolean).join(" ")}>
      {failed || !src ? (
        <div className="eg-guide-plate__fallback" role="img" aria-label={alt}>
          <span className="eg-guide-plate__fallback-label">{alt}</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="eg-guide-plate__image"
          decoding="async"
          onError={handleError}
        />
      )}
    </figure>
  );
}
