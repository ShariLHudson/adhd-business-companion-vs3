"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS,
  ambientSoundscapeTrackById,
  type ExperienceSoundscapeTrack,
} from "@/lib/soundscapes/experienceSoundscapesMenu";
import {
  activeSoundscapeTrackId,
  isSoundscapePaused,
  isSoundscapePlaying,
  playSoundscapeTrack,
  resumeSoundscapeOverlay,
  subscribeSoundscapePlayback,
  type EstateAudioPlayResult,
} from "@/lib/estate/estateAudioService";
import {
  noteEstateSoundsStarted,
  pauseEstateSounds,
  stopActiveEstateSoundscapeItem,
} from "@/lib/estate/estateSoundsTransport";

export type SoundscapeSelectionOverlayProps = {
  open: boolean;
  onClose: () => void;
  /** Optional override — defaults to canonical playSoundscapeTrack. */
  onPlay?: (
    track: ExperienceSoundscapeTrack,
  ) => void | Promise<void | EstateAudioPlayResult>;
};

type ItemPlaybackState = "idle" | "playing" | "paused";

/**
 * Dedicated Soundscapes selection — ambient environment sounds only.
 * Not nested inside Peaceful Moments. Uses the Estate Sounds transport.
 */
export function SoundscapeSelectionOverlay({
  open,
  onClose,
  onPlay,
}: SoundscapeSelectionOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const [playError, setPlayError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(() =>
    activeSoundscapeTrackId(),
  );
  const [itemState, setItemState] = useState<ItemPlaybackState>("idle");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      setPlayError(null);
      setBusyId(null);
      return;
    }
    const sync = () => {
      const id = activeSoundscapeTrackId();
      const ambient = id ? ambientSoundscapeTrackById(id) : null;
      if (!ambient) {
        setActiveId(null);
        setItemState("idle");
        return;
      }
      setActiveId(ambient.id);
      if (isSoundscapePlaying()) setItemState("playing");
      else if (isSoundscapePaused()) setItemState("paused");
      else setItemState("idle");
    };
    sync();
    const unsub = subscribeSoundscapePlayback(sync);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      unsub();
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const useSound = useCallback(
    async (track: ExperienceSoundscapeTrack) => {
      setPlayError(null);
      setBusyId(track.id);
      try {
        if (onPlay) {
          const result = await Promise.resolve(onPlay(track));
          if (
            result &&
            typeof result === "object" &&
            "ok" in result &&
            result.ok === false
          ) {
            setPlayError(result.message);
            return;
          }
          noteEstateSoundsStarted();
          setActiveId(track.id);
          setItemState("playing");
          return;
        }
        const already = activeSoundscapeTrackId() === track.id;
        const result = already
          ? await resumeSoundscapeOverlay()
          : await playSoundscapeTrack(track);
        if (!result.ok) {
          setPlayError(result.message);
          setItemState("idle");
          return;
        }
        noteEstateSoundsStarted();
        setActiveId(track.id);
        setItemState("playing");
      } finally {
        setBusyId(null);
      }
    },
    [onPlay],
  );

  const pause = useCallback(async () => {
    setPlayError(null);
    await pauseEstateSounds();
    setItemState("paused");
  }, []);

  const resume = useCallback(async () => {
    if (!activeId) return;
    const track = ambientSoundscapeTrackById(activeId);
    if (!track) return;
    await useSound(track);
  }, [activeId, useSound]);

  const stop = useCallback(async () => {
    setPlayError(null);
    await stopActiveEstateSoundscapeItem();
    setActiveId(null);
    setItemState("idle");
  }, []);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="soundscape-selection-overlay"
      data-testid="soundscape-selection-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Soundscapes"
      data-soundscapes-section="true"
    >
      <button
        type="button"
        className="soundscape-selection-overlay__backdrop"
        aria-label="Close Soundscapes"
        onClick={onClose}
      />
      <div className="soundscape-selection-overlay__panel">
        <header className="soundscape-selection-overlay__header">
          <h2 className="soundscape-selection-overlay__title">Soundscapes</h2>
          <button
            type="button"
            className="soundscape-selection-overlay__close"
            data-testid="soundscape-selection-close"
            onClick={onClose}
          >
            Close
          </button>
        </header>
        <p className="soundscape-selection-overlay__hint">
          Choose an environment sound to shape the atmosphere around you.
          Songs and guided listening live in Peaceful Moments.
        </p>
        <ul
          className="soundscape-selection-overlay__list"
          data-testid="soundscapes-list"
        >
          {EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS.map((track) => {
            const isActive = activeId === track.id;
            const stateForTrack: ItemPlaybackState = isActive
              ? itemState
              : "idle";
            return (
              <li
                key={track.id}
                className="soundscape-selection-overlay__row"
                data-testid={`soundscape-row-${track.id}`}
                data-playback-state={stateForTrack}
              >
                <div className="soundscape-selection-overlay__item-main">
                  <span className="soundscape-selection-overlay__item-title">
                    {track.title}
                  </span>
                  {isActive ? (
                    <span
                      className="soundscape-selection-overlay__item-state"
                      aria-live="polite"
                    >
                      {stateForTrack === "playing"
                        ? "Playing"
                        : stateForTrack === "paused"
                          ? "Paused"
                          : "Stopped"}
                    </span>
                  ) : null}
                </div>
                <div
                  className="soundscape-selection-overlay__item-actions"
                  role="group"
                  aria-label={`${track.title} controls`}
                >
                  {stateForTrack === "idle" ? (
                    <button
                      type="button"
                      className="soundscape-selection-overlay__item"
                      data-testid={`soundscape-play-${track.id}`}
                      aria-label={`Use This Sound: ${track.title}`}
                      disabled={busyId === track.id}
                      onClick={() => void useSound(track)}
                    >
                      Use This Sound
                    </button>
                  ) : null}
                  {stateForTrack === "playing" ? (
                    <>
                      <button
                        type="button"
                        className="soundscape-selection-overlay__item"
                        data-testid={`soundscape-pause-${track.id}`}
                        aria-label={`Pause ${track.title}`}
                        onClick={() => void pause()}
                      >
                        Pause
                      </button>
                      <button
                        type="button"
                        className="soundscape-selection-overlay__item soundscape-selection-overlay__item--secondary"
                        data-testid={`soundscape-stop-${track.id}`}
                        aria-label={`Stop ${track.title}`}
                        onClick={() => void stop()}
                      >
                        Stop
                      </button>
                    </>
                  ) : null}
                  {stateForTrack === "paused" ? (
                    <>
                      <button
                        type="button"
                        className="soundscape-selection-overlay__item"
                        data-testid={`soundscape-resume-${track.id}`}
                        aria-label={`Resume ${track.title}`}
                        onClick={() => void resume()}
                      >
                        Resume
                      </button>
                      <button
                        type="button"
                        className="soundscape-selection-overlay__item soundscape-selection-overlay__item--secondary"
                        data-testid={`soundscape-stop-${track.id}`}
                        aria-label={`Stop ${track.title}`}
                        onClick={() => void stop()}
                      >
                        Stop
                      </button>
                    </>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
        {playError ? (
          <p
            className="soundscape-selection-overlay__error"
            data-testid="soundscape-play-error"
            role="status"
          >
            {playError}
          </p>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
