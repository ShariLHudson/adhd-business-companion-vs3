"use client";

import { CinematicBackground } from "@/components/companion/scene/CinematicBackground";
import { FOCUS_BUTTERFLY_VIDEO } from "@/lib/focusMyBrain/focusRoom";

type Props = {
  playKey: number;
  className?: string;
  poster?: string;
  fallbackBackground?: string;
};

/** Signature butterfly arrival — delegates to the shared cinematic engine. */
export function FocusButterflyVideo({
  playKey,
  className,
  poster,
  fallbackBackground,
}: Props) {
  return (
    <CinematicBackground
      preset="focus-my-brain"
      mode="video"
      videoSrc={FOCUS_BUTTERFLY_VIDEO}
      playKey={playKey}
      poster={poster}
      fallbackBackground={fallbackBackground}
      placement="absolute"
      className={className}
      mediaClassName=""
      showBottomFade={false}
    />
  );
}
