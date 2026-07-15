"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS,
  type ExperienceSoundscapeTrack,
} from "@/lib/soundscapes/experienceSoundscapesMenu";

export type SoundscapeSelectionOverlayProps = {
  open: boolean;
  onClose: () => void;
  onPlay: (track: ExperienceSoundscapeTrack) => void;
};

/**
 * Dedicated Soundscapes selection — not a third-level Welcome Home flyout.
 */
export function SoundscapeSelectionOverlay({
  open,
  onClose,
  onPlay,
}: SoundscapeSelectionOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
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
        <ul className="soundscape-selection-overlay__list">
          {EXPERIENCE_AMBIENT_SOUNDSCAPE_TRACKS.map((track) => (
            <li key={track.id}>
              <button
                type="button"
                className="soundscape-selection-overlay__item"
                data-testid={`soundscape-play-${track.id}`}
                onClick={() => {
                  onPlay(track);
                  onClose();
                }}
              >
                {track.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body,
  );
}
