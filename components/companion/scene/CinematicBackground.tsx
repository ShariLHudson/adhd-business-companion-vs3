"use client";

import { useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from "react";
import {
  cinematicFramingToCssVars,
  resolveCinematicPreset,
  type CinematicPresetId,
} from "@/lib/cinematicBackground";

function isBenignPlaybackError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "AbortError" || error.name === "NotAllowedError")
  );
}

export type CinematicBackgroundProps = {
  preset?: CinematicPresetId;
  scale?: number;
  position?: string;
  gradientStrength?: number;
  mode: "video" | "image";
  videoSrc?: string;
  playKey?: number;
  poster?: string;
  imageUrl?: string;
  imageStyle?: CSSProperties;
  fallbackBackground?: string;
  placement?: "fixed" | "absolute";
  className?: string;
  mediaClassName?: string;
  showBottomFade?: boolean;
  /** Values below 1 slow motion — useful for short looping aquarium clips. */
  playbackRate?: number;
  /** Default true — estate experience videos pass false so embedded music plays. */
  muted?: boolean;
  children?: ReactNode;
};

/**
 * Reusable cinematic engine — minimal crop to clear watermarks, soft bottom depth.
 * Each workspace passes preset or explicit scale/position/gradient overrides.
 */
export function CinematicBackground({
  preset = "default",
  scale,
  position,
  gradientStrength,
  mode,
  videoSrc,
  playKey = 0,
  poster,
  imageUrl,
  imageStyle,
  fallbackBackground,
  placement = "absolute",
  className = "",
  mediaClassName = "",
  showBottomFade = true,
  playbackRate = 1,
  muted = true,
  children,
}: CinematicBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const rootStyle = useMemo(() => {
    const base = resolveCinematicPreset(preset);
    const framing = {
      scale: scale ?? base.scale,
      position: position ?? base.position,
      gradientStrength: gradientStrength ?? base.gradientStrength,
    };
    return cinematicFramingToCssVars(framing) as CSSProperties;
  }, [gradientStrength, position, preset, scale]);

  useEffect(() => {
    if (mode !== "video" || !videoSrc) return;
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    video.loop = true;
    video.muted = muted;
    video.playbackRate = playbackRate;

    const safePlay = async () => {
      if (cancelled) return;
      try {
        await video.play();
      } catch (error) {
        if (!isBenignPlaybackError(error)) {
          /* unexpected playback failure */
        }
      }
    };

    const startPlayback = () => {
      if (cancelled) return;
      try {
        video.currentTime = 0;
      } catch {
        /* ignore */
      }
      void safePlay();
    };

    const onEnded = () => {
      if (cancelled) return;
      try {
        video.currentTime = 0;
      } catch {
        /* ignore */
      }
      void safePlay();
    };

    const onLoadedData = () => startPlayback();

    video.addEventListener("ended", onEnded);

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      startPlayback();
    } else {
      video.addEventListener("loadeddata", onLoadedData, { once: true });
    }

    return () => {
      cancelled = true;
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("loadeddata", onLoadedData);
    };
  }, [mode, muted, playKey, playbackRate, videoSrc]);

  const rootClass = [
    "cinematic-background",
    placement === "fixed" ? "cinematic-background--fixed" : "",
    showBottomFade ? "" : "cinematic-background--no-fade",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const mediaClass = ["cinematic-background__media", mediaClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass} style={rootStyle} aria-hidden>
      <div className="cinematic-background__clip">
        {mode === "video" && videoSrc ? (
          <>
            {fallbackBackground ? (
              <div
                className="cinematic-background__poster-fallback"
                style={{ backgroundImage: fallbackBackground }}
              />
            ) : null}
            <video
              ref={videoRef}
              key={`${videoSrc}-${playKey}`}
              className={mediaClass}
              src={videoSrc}
              poster={poster}
              muted={muted}
              loop
              autoPlay
              playsInline
              preload="auto"
              // @ts-expect-error fetchPriority is valid on video in modern browsers
              fetchPriority="high"
            />
          </>
        ) : null}
        {mode === "image" && (imageUrl || imageStyle) ? (
          <div
            className={["cinematic-background__image", mediaClassName]
              .filter(Boolean)
              .join(" ")}
            style={{
              ...(imageUrl ? { backgroundImage: `url('${imageUrl}')` } : {}),
              ...imageStyle,
            }}
          />
        ) : null}
      </div>
      {showBottomFade ? <div className="cinematic-background__fade" /> : null}
      {children}
    </div>
  );
}
