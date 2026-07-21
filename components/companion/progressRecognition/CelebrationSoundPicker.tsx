"use client";

import { useState } from "react";
import {
  CELEBRATION_SOUND_CHOICES,
  previewCelebrationSound,
  resolveCelebrationSound,
  type CelebrationSoundId,
} from "@/lib/progressRecognition";

type Props = {
  onClose: () => void;
  onChosen?: (id: CelebrationSoundId) => void;
};

/**
 * 101 — Optional sounds; never auto-play.
 */
export function CelebrationSoundPicker({ onClose, onChosen }: Props) {
  const [chosen, setChosen] = useState<CelebrationSoundId>("none");

  return (
    <div
      className="progress-sound-picker"
      data-testid="celebration-sound-picker"
      role="group"
      aria-label="Celebration sound"
    >
      <p>Optional sound — nothing plays unless you ask.</p>
      <div className="progress-review-choices">
        {CELEBRATION_SOUND_CHOICES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`progress-pulse-btn ${chosen === c.id ? "is-selected" : ""}`}
            data-testid={`sound-choice-${c.id}`}
            aria-pressed={chosen === c.id}
            onClick={() => {
              setChosen(c.id);
              onChosen?.(c.id);
            }}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="progress-pulse-actions">
        <button
          type="button"
          className="progress-pulse-btn"
          data-testid="sound-preview"
          onClick={() => {
            const decision = resolveCelebrationSound({
              chosenId: chosen === "none" ? "gentle_chime" : chosen,
              memberRequestedPlay: true,
            });
            previewCelebrationSound(decision);
          }}
        >
          Preview
        </button>
        <button
          type="button"
          className="progress-pulse-btn progress-pulse-btn-primary"
          data-testid="sound-done"
          onClick={onClose}
        >
          Done
        </button>
      </div>
    </div>
  );
}
