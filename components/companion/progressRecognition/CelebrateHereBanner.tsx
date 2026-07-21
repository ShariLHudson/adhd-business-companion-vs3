"use client";

import { inPlaceCelebrationMessage, RECOGNITION_LANGUAGE } from "@/lib/progressRecognition";

type Props = {
  title: string;
  onDismiss: () => void;
};

/**
 * 101 — Brief in-place celebration; no full-screen takeover.
 */
export function CelebrateHereBanner({ title, onDismiss }: Props) {
  return (
    <div
      className="progress-celebrate-here"
      data-testid="celebrate-here-banner"
      role="status"
      aria-live="polite"
    >
      <p data-testid="celebrate-here-message">
        {inPlaceCelebrationMessage(title)}
      </p>
      <p className="progress-celebrate-here-soft">
        {RECOGNITION_LANGUAGE.movedBusiness}
      </p>
      <button
        type="button"
        className="progress-pulse-btn"
        data-testid="celebrate-here-dismiss"
        onClick={onDismiss}
      >
        Continue
      </button>
    </div>
  );
}
