"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS,
  type ExperienceSoundscapeTrack,
} from "@/lib/soundscapes/experienceSoundscapesMenu";
import type { EstateAudioPlayResult } from "@/lib/estate/estateAudioService";

export type SoundscapeSelectionOverlayProps = {
  open: boolean;
  onClose: () => void;
  onPlay: (
    track: ExperienceSoundscapeTrack,
  ) => void | Promise<void | EstateAudioPlayResult>;
};

/**
 * Dedicated Soundscapes selection — not a third-level Welcome Home flyout.
 * Playback only; master Sound On/Off stays in the header.
 */
export function SoundscapeSelectionOverlay({
  open,
  onClose,
  onPlay,
}: SoundscapeSelectionOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const [playError, setPlayError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      setPlayError(null);
      setPlayingId(null);
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="soundscape-selection-overlay"
      data-testid="soundscape-selection-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Soundscapes"
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
          Choose a track to play. Use Sound On/Off in the header for all Estate
          sound.
        </p>
        <ul className="soundscape-selection-overlay__list">
          {EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS.map((track) => (
            <li key={track.id}>
              <button
                type="button"
                className="soundscape-selection-overlay__item"
                data-testid={`soundscape-play-${track.id}`}
                disabled={playingId === track.id}
                onClick={() => {
                  setPlayError(null);
                  setPlayingId(track.id);
                  void Promise.resolve(onPlay(track)).then((result) => {
                    setPlayingId(null);
                    if (
                      result &&
                      typeof result === "object" &&
                      "ok" in result &&
                      result.ok === false
                    ) {
                      setPlayError(result.message);
                      return;
                    }
                    onClose();
                  });
                }}
              >
                {track.title}
              </button>
            </li>
          ))}
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
