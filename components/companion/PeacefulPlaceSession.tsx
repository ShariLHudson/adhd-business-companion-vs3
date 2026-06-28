"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { parseYoutubeVideoId } from "@/lib/focusAudio/youtubeEmbed";
import {
  peacefulPlaceById,
  resolvePeacefulPlacePlayback,
  type PeacefulPlaceDestination,
} from "@/lib/peacefulPlaces";

const DEFAULT_AUDIO_DELAY_MESSAGE = "The room is taking a moment to come alive." as const;
const DEFAULT_SOUND_ON_LABEL = "Sound on" as const;
const DEFAULT_SOUND_OFF_LABEL = "Sound off" as const;

type Props = {
  destination: PeacefulPlaceDestination;
  onLeave: () => void;
};

function youtubeEmbedWithMute(embedUrl: string, muted: boolean): string {
  try {
    const url = new URL(embedUrl);
    if (muted) {
      url.searchParams.set("mute", "1");
    } else {
      url.searchParams.delete("mute");
    }
    const videoId = parseYoutubeVideoId(url.toString()) ?? parseYoutubeVideoId(embedUrl);
    if (videoId) {
      url.searchParams.set("loop", "1");
      url.searchParams.set("playlist", videoId);
    }
    return url.toString();
  } catch {
    return embedUrl;
  }
}

export function PeacefulPlaceSession({ destination, onLeave }: Props) {
  const [mounted, setMounted] = useState(false);
  const place = peacefulPlaceById(destination.placeId);
  const playback = useMemo(
    () => resolvePeacefulPlacePlayback(destination),
    [destination],
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [audioDelayed, setAudioDelayed] = useState(false);
  const audioStartedRef = useRef(false);

  const showStormOutside =
    soundOn &&
    (destination.experienceName.toLowerCase().includes("storm") ||
      destination.id.includes("summer-storm"));

  const leaveLabel = place?.sessionLeaveLabel ?? "Back to the path";
  const soundOnLabel = place?.sessionSoundOnLabel ?? DEFAULT_SOUND_ON_LABEL;
  const soundOffLabel = place?.sessionSoundOffLabel ?? DEFAULT_SOUND_OFF_LABEL;
  const audioWaitingCopy = place?.audioWaitingCopy ?? DEFAULT_AUDIO_DELAY_MESSAGE;

  const youtubeSrc =
    playback.kind === "youtube" && soundOn
      ? youtubeEmbedWithMute(playback.embedUrl, false)
      : null;

  useEffect(() => {
    audioStartedRef.current = false;
    setAudioDelayed(playback.kind === "unavailable");
  }, [destination.id, playback.kind]);

  useEffect(() => {
    if (!soundOn) {
      audioRef.current?.pause();
      return;
    }
    if (playback.kind === "direct") {
      void audioRef.current?.play().catch(() => setAudioDelayed(true));
    }
  }, [soundOn, playback.kind]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onLeave();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onLeave]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  function markAudioStarted() {
    if (audioStartedRef.current) return;
    audioStartedRef.current = true;
    setAudioDelayed(false);
  }

  function markAudioDelayed() {
    if (audioStartedRef.current || !soundOn) return;
    setAudioDelayed(true);
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className="peaceful-place-session"
      role="dialog"
      aria-modal="true"
      aria-label={`${destination.placeName} — ${destination.experienceName}`}
      data-peaceful-place={destination.placeId}
      data-peaceful-place-destination={destination.id}
      data-signature={place?.signature ? "1" : undefined}
      data-sound-on={soundOn ? "1" : undefined}
    >
      <div className="peaceful-place-session__bg" aria-hidden="true">
        <div
          className="peaceful-place-session__bg-image companion-scene-fade"
          style={{
            backgroundImage: `url('${destination.imageSrc}')`,
            backgroundPosition: place?.backgroundObjectPosition ?? "center center",
          }}
        />
        <div className="peaceful-place-session__bg-wash" />
        {showStormOutside ? (
          <div className="peaceful-place-session__storm-outside" />
        ) : null}
      </div>

      <aside className="peaceful-place-session__corner-sign" aria-label="Place controls">
        {audioDelayed && soundOn ? (
          <p className="peaceful-place-session__corner-sign-status" role="status">
            {audioWaitingCopy}
          </p>
        ) : null}
        <div className="peaceful-place-session__corner-sign-plaque">
          {playback.kind !== "unavailable" ? (
            <button
              type="button"
              className="peaceful-place-session__corner-sign-btn peaceful-place-session__corner-sign-btn--sound"
              aria-pressed={soundOn}
              onClick={() => setSoundOn((on) => !on)}
            >
              {soundOn ? soundOffLabel : soundOnLabel}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onLeave}
            className="peaceful-place-session__corner-sign-btn peaceful-place-session__corner-sign-btn--leave"
          >
            {leaveLabel}
          </button>
        </div>
      </aside>

      {soundOn ? (
        <div className="peaceful-place-session__audio" aria-hidden="true">
          {playback.kind === "youtube" && youtubeSrc ? (
            <iframe
              key={youtubeSrc}
              src={youtubeSrc}
              title={`${destination.placeName} ambience`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              tabIndex={-1}
              onLoad={markAudioStarted}
            />
          ) : null}
          {playback.kind === "direct" ? (
            <audio
              ref={audioRef}
              autoPlay
              loop
              src={playback.src}
              onPlaying={markAudioStarted}
              onCanPlayThrough={markAudioStarted}
              onError={markAudioDelayed}
            >
              <track kind="captions" />
            </audio>
          ) : null}
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
