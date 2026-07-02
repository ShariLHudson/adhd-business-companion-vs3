"use client";

import { useCallback, useEffect, useState } from "react";
import { estateRoomBackgroundCandidates } from "@/lib/estate/estateRoomAssets";
import { resolveEstateRoomBackgroundImage } from "@/lib/estate/estateRoomBackground";

type Props = {
  roomId: string;
  /** Override registry URL when section-specific asset is already resolved */
  imageUrl?: string | null;
  className?: string;
};

/**
 * Full-viewport estate room photograph — edge to edge, nothing letterboxed.
 */
export function EstateRoomFullBleedBackground({
  roomId,
  imageUrl,
  className,
}: Props) {
  const candidates = estateRoomBackgroundCandidates(
    roomId,
    imageUrl ?? resolveEstateRoomBackgroundImage(roomId),
  );
  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [roomId, imageUrl, candidates[0]]);

  const handleError = useCallback(() => {
    setCandidateIndex((index) =>
      index + 1 < candidates.length ? index + 1 : index,
    );
  }, [candidates.length]);

  const src = candidates[candidateIndex];
  if (!src) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden
      className={["estate-room-fullbleed-bg", className].filter(Boolean).join(" ")}
      decoding="async"
      fetchPriority="high"
      onError={handleError}
    />
  );
}
