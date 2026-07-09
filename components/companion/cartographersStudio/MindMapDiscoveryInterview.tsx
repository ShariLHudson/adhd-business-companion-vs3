"use client";

import { useMemo, useState } from "react";
import {
  MIND_MAP_DISCOVERY_QUESTIONS,
  type MindMapDiscoveryQuestionId,
} from "@/lib/visualFocus/discoveryInterview";

export type MindMapDiscoveryAnswers = {
  topic: string;
  everything: string;
  anythingElse?: string;
};

export function MindMapDiscoveryInterview({
  onCancel,
  onComplete,
}: {
  onCancel: () => void;
  onComplete: (answers: MindMapDiscoveryAnswers) => void;
}) {
  const [step, setStep] = useState(0);
  const [topic, setTopic] = useState("");
  const [everything, setEverything] = useState("");
  const [anythingElse, setAnythingElse] = useState("");

  const question = MIND_MAP_DISCOVERY_QUESTIONS[step]!;
  const progress = useMemo(
    () => `${step + 1} of ${MIND_MAP_DISCOVERY_QUESTIONS.length}`,
    [step],
  );

  function currentValue(): string {
    if (question.id === "main-topic") return topic;
    if (question.id === "everything") return everything;
    return anythingElse;
  }

  function setCurrentValue(value: string) {
    if (question.id === "main-topic") setTopic(value);
    else if (question.id === "everything") setEverything(value);
    else setAnythingElse(value);
  }

  function canAdvance(): boolean {
    if (question.allowSkip) return true;
    return currentValue().trim().length > 0;
  }

  function handleNext() {
    if (!canAdvance()) return;
    if (step < MIND_MAP_DISCOVERY_QUESTIONS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    onComplete({
      topic: topic.trim(),
      everything: everything.trim(),
      anythingElse: anythingElse.trim() || undefined,
    });
  }

  function handleBack() {
    if (step === 0) {
      onCancel();
      return;
    }
    setStep((s) => s - 1);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mind-map-discovery-title"
      data-testid="mind-map-discovery-interview"
    >
      <div className="w-full max-w-lg rounded-2xl border border-[#e7dfd4] bg-[#fffdf8] p-6 shadow-xl">
        <p className="text-xs font-bold uppercase tracking-wide text-[#8b7355]">
          Discovery Interview · Mind Map · {progress}
        </p>
        <h2
          id="mind-map-discovery-title"
          className="mt-2 text-xl font-semibold text-[#1f1c19]"
        >
          {question.prompt}
        </h2>
        {question.hint ? (
          <p className="mt-1 text-sm text-[#6b635a]">{question.hint}</p>
        ) : null}
        <textarea
          value={currentValue()}
          onChange={(e) => setCurrentValue(e.target.value)}
          rows={question.id === "everything" ? 6 : 3}
          autoFocus
          placeholder={question.placeholder}
          className="mt-4 w-full resize-none rounded-xl border border-[#c9bfb0] bg-white px-3 py-2.5 text-base text-[#1f1c19] outline-none focus:border-[#8b7355]"
          data-testid={`mind-map-discovery-${question.id as MindMapDiscoveryQuestionId}`}
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-[#6b635a] hover:bg-[#faf7f2]"
          >
            {step === 0 ? "Cancel" : "Back"}
          </button>
          <div className="flex flex-wrap gap-2">
            {question.allowSkip ? (
              <button
                type="button"
                onClick={() => {
                  setAnythingElse("");
                  onComplete({
                    topic: topic.trim(),
                    everything: everything.trim(),
                    anythingElse: undefined,
                  });
                }}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-[#8b7355] hover:bg-[#f5efe6]"
              >
                Skip
              </button>
            ) : null}
            <button
              type="button"
              disabled={!canAdvance()}
              onClick={handleNext}
              className="rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163c3c] disabled:cursor-not-allowed disabled:opacity-40"
              data-testid="mind-map-discovery-next"
            >
              {step < MIND_MAP_DISCOVERY_QUESTIONS.length - 1
                ? "Continue"
                : "Build first draft"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
