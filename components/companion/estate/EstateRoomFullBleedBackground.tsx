"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { backgroundUrlVariants } from "@/lib/roomBackgroundAssets";
import { estateRoomBackgroundCandidates } from "@/lib/estate/estateRoomAssets";
import { resolveEstateRoomBackgroundImage } from "@/lib/estate/estateRoomBackground";
import {
  OCEAN_CONSERVATORY_POSTER,
  OCEAN_CONSERVATORY_VIDEO,
} from "@/lib/oceanConservatory/media";
import {
  isOceanConservatoryBackground,
  isOceanConservatoryRoom,
} from "@/lib/oceanConservatory/isOceanConservatoryRoom";

type Props = {
  roomId: string;
  /** Override registry URL when section-specific asset is already resolved */
  imageUrl?: string | null;
  className?: string;
  onLoad?: () => void;
};

/**
 * Full-viewport estate room photograph — edge to edge, nothing letterboxed.
 * Ocean Conservatory™ uses the aquarium video plate; ambience stays on the room loop.
 */
export function EstateRoomFullBleedBackground({
  roomId,
  imageUrl,
  className,
  onLoad,
}: Props) {
  const candidates = useMemo(() => {
    const base = estateRoomBackgroundCandidates(
      roomId,
      imageUrl ?? resolveEstateRoomBackgroundImage(roomId),
    );
    const expanded: string[] = [];
    for (const url of base) {
      for (const variant of backgroundUrlVariants(url)) {
        if (!expanded.includes(variant)) expanded.push(variant);
      }
    }
    return expanded;
  }, [roomId, imageUrl]);
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
  const useOceanConservatoryVideo =
    isOceanConservatoryRoom(roomId) || isOceanConservatoryBackground(src);
  const poster = src ?? OCEAN_CONSERVATORY_POSTER;

  useEffect(() => {
    if (!useOceanConservatoryVideo || !onLoad) return;
    onLoad();
  }, [onLoad, useOceanConservatoryVideo, poster]);

  if (!src && !useOceanConservatoryVideo) {
    return (
      <div
        className={["estate-room-fullbleed-bg estate-room-fullbleed-bg--fallback", className]
          .filter(Boolean)
          .join(" ")}
        aria-hidden
      />
    );
  }

  if (useOceanConservatoryVideo) {
    return (
      <div className="estate-room-fullbleed-stack" aria-hidden>
        <CinematicBackground
          preset="default"
          mode="video"
          videoSrc={OCEAN_CONSERVATORY_VIDEO}
          poster={poster}
          fallbackBackground={`url('${poster}')`}
          placement="fixed"
          showBottomFade={false}
          className="estate-room-fullbleed-cinematic"
          mediaClassName={["estate-room-fullbleed-bg", className]
            .filter(Boolean)
            .join(" ")}
        />
      </div>
    );
  }

  return (
    <div className="estate-room-fullbleed-stack" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className={["estate-room-fullbleed-bg", className].filter(Boolean).join(" ")}
        decoding="async"
        fetchPriority="high"
        onLoad={onLoad}
        onError={handleError}
      />
    </div>
  );
}
