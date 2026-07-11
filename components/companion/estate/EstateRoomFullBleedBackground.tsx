"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { useChatBackdropRevision } from "@/lib/chatBackdrop";
import {
  getRoomBackdropImageUrl,
  getRoomBackdropOverrideId,
} from "@/lib/chatBackdrop/chatBackdropPreference";
import { resolveCanonicalPlaceId } from "@/lib/estate/canonicalEstateRegistry";
import {
  estateRoomExperienceVideoPlaybackRate,
  estateRoomUsesOceanConservatoryVideo,
  resolveEstateRoomExperienceVideo,
} from "@/lib/estate/estateRoomExperienceVideo";
import { backgroundUrlVariants } from "@/lib/roomBackgroundAssets";
import { estateRoomBackgroundCandidates } from "@/lib/estate/estateRoomAssets";
import {
  estateRoomUsesCanonicalPlateOnly,
  resolveEstateRoomBackgroundImage,
} from "@/lib/estate/estateRoomBackground";
import { ESTATE_SCENE_CROSSFADE_MS } from "@/lib/estate/estateSceneTransition";
import {
  BUTTERFLY_HOUSE_POSTER,
} from "@/lib/butterflyHouse/media";
import {
  OCEAN_CONSERVATORY_POSTER,
} from "@/lib/oceanConservatory/media";

type Props = {
  roomId: string;
  /** Override registry URL when section-specific asset is already resolved */
  imageUrl?: string | null;
  className?: string;
  onLoad?: () => void;
};

/**
 * Full-viewport estate room photograph.
 * Member-chosen environments (Change background) use contain so the full plate is visible.
 * Keeps the previous plate visible until the next image decodes, then crossfades.
 */
export function EstateRoomFullBleedBackground({
  roomId,
  imageUrl,
  className,
  onLoad,
}: Props) {
  const backdropRevision = useChatBackdropRevision();
  const resolvedUrl = useMemo(() => {
    void backdropRevision;
    const canonicalRoomId = resolveCanonicalPlaceId(roomId);
    // Ceremony / immersive plates passed by the room always win over member backdrop swaps.
    if (imageUrl) return imageUrl;
    if (estateRoomUsesCanonicalPlateOnly(canonicalRoomId)) {
      return resolveEstateRoomBackgroundImage(roomId);
    }
    const memberOverride =
      getRoomBackdropImageUrl(canonicalRoomId) ??
      getRoomBackdropImageUrl(roomId);
    if (memberOverride) return memberOverride;
    return resolveEstateRoomBackgroundImage(roomId);
  }, [roomId, imageUrl, backdropRevision]);

  const hasMemberOverride = useMemo(() => {
    void backdropRevision;
    const canonicalRoomId = resolveCanonicalPlaceId(roomId);
    if (estateRoomUsesCanonicalPlateOnly(canonicalRoomId)) return false;
    return Boolean(
      getRoomBackdropOverrideId(canonicalRoomId) ??
        getRoomBackdropOverrideId(roomId),
    );
  }, [roomId, backdropRevision]);

  const candidates = useMemo(() => {
    const base = estateRoomBackgroundCandidates(roomId, resolvedUrl);
    const expanded: string[] = [];
    for (const url of base) {
      for (const variant of backgroundUrlVariants(url)) {
        if (!expanded.includes(variant)) expanded.push(variant);
      }
    }
    return expanded;
  }, [roomId, resolvedUrl]);
  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [roomId, resolvedUrl, candidates[0]]);

  const handleError = useCallback(() => {
    setCandidateIndex((index) =>
      index + 1 < candidates.length ? index + 1 : index,
    );
  }, [candidates.length]);

  const src = candidates[candidateIndex];
  const canonicalRoomId = useMemo(
    () => resolveCanonicalPlaceId(roomId),
    [roomId],
  );
  const experienceVideo = useMemo(
    () =>
      resolveEstateRoomExperienceVideo(
        canonicalRoomId,
        src ?? imageUrl ?? resolvedUrl,
      ),
    [canonicalRoomId, src, imageUrl, resolvedUrl],
  );
  const useRoomVideo = Boolean(experienceVideo);
  const useOceanConservatoryVideo =
    useRoomVideo && estateRoomUsesOceanConservatoryVideo(canonicalRoomId);
  const videoSrc = experienceVideo;
  const poster =
    src ??
    imageUrl ??
    resolvedUrl ??
    (useOceanConservatoryVideo ? OCEAN_CONSERVATORY_POSTER : BUTTERFLY_HOUSE_POSTER);

  const [displayedSrc, setDisplayedSrc] = useState<string | null>(null);
  const [incomingSrc, setIncomingSrc] = useState<string | null>(null);
  const [incomingVisible, setIncomingVisible] = useState(false);
  const [outgoingFading, setOutgoingFading] = useState(false);

  useEffect(() => {
    if (!src || useRoomVideo) return;
    if (src === displayedSrc && !incomingSrc) return;
    if (src === displayedSrc) return;

    setIncomingSrc(src);
    setIncomingVisible(false);
    setOutgoingFading(false);
  }, [src, displayedSrc, incomingSrc, useRoomVideo]);

  const finishCrossfade = useCallback(() => {
    if (!incomingSrc) return;
    setDisplayedSrc(incomingSrc);
    setIncomingSrc(null);
    setIncomingVisible(false);
    setOutgoingFading(false);
    onLoad?.();
  }, [incomingSrc, onLoad]);

  const handleIncomingLoad = useCallback(() => {
    if (!incomingSrc) return;

    if (!displayedSrc) {
      setDisplayedSrc(incomingSrc);
      setIncomingSrc(null);
      setIncomingVisible(false);
      onLoad?.();
      return;
    }

    requestAnimationFrame(() => {
      setIncomingVisible(true);
      setOutgoingFading(true);
    });
    window.setTimeout(finishCrossfade, ESTATE_SCENE_CROSSFADE_MS);
  }, [incomingSrc, displayedSrc, finishCrossfade, onLoad]);

  useEffect(() => {
    if (!useRoomVideo || !onLoad) return;
    onLoad();
  }, [onLoad, useRoomVideo, poster]);

  const showFullPlate = hasMemberOverride && !useRoomVideo;
  const plateClassName = [
    "estate-room-fullbleed-bg",
    showFullPlate ? "estate-room-fullbleed-bg--show-full-plate" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (!src && !useRoomVideo) {
    return (
      <div
        className={["estate-room-fullbleed-bg estate-room-fullbleed-bg--fallback", className]
          .filter(Boolean)
          .join(" ")}
        aria-hidden
      />
    );
  }

  if (useRoomVideo) {
    return (
      <div
        className={[
          "estate-room-fullbleed-stack",
          showFullPlate ? "estate-room-fullbleed-stack--show-full-plate" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden
      >
        <CinematicBackground
          preset={useOceanConservatoryVideo ? "ocean-conservatory" : "default"}
          mode="video"
          videoSrc={videoSrc}
          poster={poster}
          playbackRate={estateRoomExperienceVideoPlaybackRate(canonicalRoomId)}
          fallbackBackground={`url('${poster}')`}
          placement="fixed"
          showBottomFade={false}
          className={[
            "estate-room-fullbleed-cinematic",
            useOceanConservatoryVideo
              ? "estate-room-fullbleed-cinematic--ocean-conservatory"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          mediaClassName={plateClassName}
        />
      </div>
    );
  }

  const stackStyle = {
    ["--estate-scene-crossfade-ms" as string]: `${ESTATE_SCENE_CROSSFADE_MS}ms`,
  };

  return (
    <div
      className={[
        "estate-room-fullbleed-stack",
        "estate-room-fullbleed-stack--crossfade",
        showFullPlate ? "estate-room-fullbleed-stack--show-full-plate" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={stackStyle}
      aria-hidden
    >
      {displayedSrc && displayedSrc !== incomingSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={displayedSrc}
          alt=""
          className={[
            plateClassName,
            "estate-room-fullbleed-bg--previous",
            outgoingFading ? "estate-room-fullbleed-bg--previous-fading" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          decoding="async"
        />
      ) : null}

      {(incomingSrc ?? (!displayedSrc ? src : null)) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={incomingSrc ?? src}
          alt=""
          className={[
            plateClassName,
            displayedSrc ? "estate-room-fullbleed-bg--incoming" : "",
            displayedSrc && incomingVisible
              ? "estate-room-fullbleed-bg--incoming-visible"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          decoding="async"
          fetchPriority="high"
          onLoad={handleIncomingLoad}
          onError={handleError}
        />
      ) : null}
    </div>
  );
}
