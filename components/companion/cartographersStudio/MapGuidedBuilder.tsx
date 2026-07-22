"use client";

import { useMemo, useState } from "react";
import type { CartographyMapDefinition } from "@/lib/cartographersStudio/mapDefinitions";

export function MapGuidedBuilder({
  definition,
  initialAnswers,
  onCancel,
  onComplete,
}: {
  definition: CartographyMapDefinition;
  initialAnswers?: Record<string, string>;
  onCancel: () => void;
  onComplete: (answers: Record<string, string>) => void;
}) {
  const steps = definition.steps;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(
    () => initialAnswers ?? {},
  );
  const step = steps[index]!;
  const progressLabel = useMemo(() => {
    const phases = [...new Set(steps.map((s) => s.title))];
    if (phases.length >= 2) {
      return phases.join(" → ");
    }
    return `Step ${index + 1} of ${steps.length}`;
  }, [steps, index]);

  const value = answers[step.fieldKey] ?? "";
  const canContinue = step.optional || value.trim().length > 0;

  function setValue(next: string) {
    setAnswers((prev) => ({ ...prev, [step.fieldKey]: next }));
  }

  function goNext() {
    if (index >= steps.length - 1) {
      onComplete(answers);
      return;
    }
    setIndex((i) => i + 1);
  }

  function goBack() {
    if (index === 0) {
      onCancel();
      return;
    }
    setIndex((i) => i - 1);
  }

  return (
    <div
      className="cartographers-learn-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cartography-guided-title"
      data-testid="cartography-guided-builder"
      data-map-id={definition.id}
    >
      <div className="cartographers-guided">
        <p className="cartographers-guided__kicker">{definition.name}</p>
        <p className="cartographers-guided__progress" aria-live="polite">
          Step {index + 1} of {steps.length}
        </p>
        <p className="cartographers-guided__phases">{progressLabel}</p>
        <h2 id="cartography-guided-title" className="cartographers-guided__title">
          {step.question}
        </h2>
        {step.example ? (
          <p className="cartographers-guided__example">Example: {step.example}</p>
        ) : null}
        {step.inputKind === "multiline" || step.inputKind === "list" ? (
          <textarea
            className="cartographers-guided__input cartographers-guided__input--area"
            rows={step.inputKind === "list" ? 5 : 6}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={
              step.inputKind === "list"
                ? "One item per line, or separate with commas"
                : "Type here…"
            }
            aria-label={step.question}
            autoFocus
          />
        ) : (
          <input
            className="cartographers-guided__input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type here…"
            aria-label={step.question}
            autoFocus
          />
        )}
        <div className="cartographers-guided__actions">
          <button
            type="button"
            className="cartographers-map-entry__secondary"
            onClick={goBack}
          >
            {index === 0 ? "Cancel" : "Back"}
          </button>
          {step.optional ? (
            <button
              type="button"
              className="cartographers-map-entry__secondary"
              onClick={() => {
                setValue(value);
                goNext();
              }}
            >
              Skip
            </button>
          ) : null}
          <button
            type="button"
            className="cartographers-map-entry__primary"
            data-testid="cartography-guided-continue"
            disabled={!canContinue && !step.optional}
            onClick={goNext}
          >
            {index >= steps.length - 1 ? "Create My Map" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
