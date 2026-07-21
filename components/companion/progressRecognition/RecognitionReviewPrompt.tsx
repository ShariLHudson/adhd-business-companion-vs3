"use client";

import {
  applyRecognitionReviewChoice,
  buildRecognitionReviewOffer,
  resolveCelebrationChoice,
  type RecognitionCandidate,
  type ReviewChoiceResult,
} from "@/lib/progressRecognition";
import { useState } from "react";
import { CelebrateHereBanner } from "./CelebrateHereBanner";
import { CelebrationSoundPicker } from "./CelebrationSoundPicker";

type Props = {
  candidate: RecognitionCandidate;
  returnPath?: {
    workId?: string;
    sectionId?: string;
    projectId?: string;
    placeId?: string;
  };
  onNavigate?: (placeId: string) => void;
  onComplete?: (result: ReviewChoiceResult) => void;
  onDismiss?: () => void;
};

/**
 * 101 — One quiet recognition prompt (max one primary suggestion).
 */
export function RecognitionReviewPrompt({
  candidate,
  returnPath,
  onNavigate,
  onComplete,
  onDismiss,
}: Props) {
  const offer = buildRecognitionReviewOffer(candidate);
  const [result, setResult] = useState<ReviewChoiceResult | null>(null);
  const [celebrateHere, setCelebrateHere] = useState<string | null>(null);
  const [soundOpen, setSoundOpen] = useState(false);

  if (!offer && !result) {
    return null;
  }

  const celebrationOffer =
    result &&
    (result.outcome === "saved_win" || result.outcome === "saved_accomplishment")
      ? result.celebrationOffer
      : null;

  return (
    <div
      className="progress-review"
      data-testid="recognition-review-prompt"
      role="region"
      aria-label="Recognition suggestion"
    >
      {!result && offer ? (
        <>
          <p className="progress-review-prompt" data-testid="review-prompt-text">
            {offer.prompt}
          </p>
          <div className="progress-review-choices" role="group">
            {offer.choices.map((c) => (
              <button
                key={c.id}
                type="button"
                className="progress-pulse-btn"
                data-testid={`review-choice-${c.id}`}
                onClick={() => {
                  const next = applyRecognitionReviewChoice({
                    candidate,
                    choiceId: c.id,
                    returnPath,
                  });
                  setResult(next);
                  onComplete?.(next);
                  if (next.outcome === "declined") onDismiss?.();
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </>
      ) : null}

      {celebrationOffer ? (
        <div data-testid="celebration-route-offer">
          <p>{celebrationOffer.prompt}</p>
          <div className="progress-review-choices" role="group">
            {celebrationOffer.choices.map((c) => (
              <button
                key={c.id}
                type="button"
                className="progress-pulse-btn"
                data-testid={`celebration-choice-${c.id}`}
                onClick={() => {
                  const resolved = resolveCelebrationChoice({
                    recognitionType: celebrationOffer.recognitionType,
                    recognitionId: celebrationOffer.recognitionId,
                    choiceId: c.id,
                    offer: celebrationOffer,
                  });
                  if (resolved.celebrateInPlace) {
                    setCelebrateHere(candidate.title);
                  }
                  if (resolved.navigatePlaceId) {
                    onNavigate?.(resolved.navigatePlaceId);
                  }
                  if (
                    c.id === "go_garden" ||
                    c.id === "go_hall" ||
                    c.id === "here"
                  ) {
                    setSoundOpen(true);
                  }
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
          {soundOpen ? (
            <CelebrationSoundPicker onClose={() => setSoundOpen(false)} />
          ) : null}
        </div>
      ) : null}

      {celebrateHere ? (
        <CelebrateHereBanner
          title={celebrateHere}
          onDismiss={() => {
            setCelebrateHere(null);
            onDismiss?.();
          }}
        />
      ) : null}
    </div>
  );
}
