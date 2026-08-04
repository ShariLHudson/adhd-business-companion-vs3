"use client";

import { useMemo, useState } from "react";
import {
  VISUAL_THINKING_INTENTS,
  followUpsForIntent,
  recommendVisualTool,
  recommendationTitle,
  type VisualThinkingFollowUpId,
  type VisualThinkingIntentId,
} from "@/lib/visualThinkingGuidance";
import type { VisualThinkingHomeTypeId } from "@/lib/visualThinkingHome";
import { listVisualThinkingHomeTypes } from "@/lib/visualThinkingHome";

type Step = "intent" | "follow-up" | "recommendation" | "alternatives";

export function VisualThinkingGuidancePanel({
  onOpenHomeType,
}: {
  onOpenHomeType: (homeTypeId: VisualThinkingHomeTypeId) => void;
}) {
  const [step, setStep] = useState<Step>("intent");
  const [intent, setIntent] = useState<VisualThinkingIntentId | null>(null);
  const [followUp, setFollowUp] = useState<VisualThinkingFollowUpId | null>(null);

  const recommendation = useMemo(() => {
    if (!intent) return null;
    return recommendVisualTool({ intent, followUp: followUp ?? undefined });
  }, [intent, followUp]);

  const followUps = intent ? followUpsForIntent(intent) : [];

  function reset() {
    setStep("intent");
    setIntent(null);
    setFollowUp(null);
  }

  function selectIntent(id: VisualThinkingIntentId) {
    setIntent(id);
    const options = followUpsForIntent(id);
    if (options.length <= 1) {
      setFollowUp(options[0]?.id ?? null);
      setStep("recommendation");
    } else {
      setFollowUp(null);
      setStep("follow-up");
    }
  }

  function selectFollowUp(id: VisualThinkingFollowUpId) {
    setFollowUp(id);
    setStep("recommendation");
  }

  if (step === "alternatives") {
    const all = listVisualThinkingHomeTypes().filter((t) => !t.comingSoon);
    return (
      <section
        className="rounded-2xl border border-[#c5e0e0] bg-gradient-to-br from-[#f0f8f8] to-white p-5"
        data-testid="visual-thinking-guidance-alternatives"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#1f1c19]">All Visual Tools</h2>
            <p className="mt-1 text-sm text-[#6b635a]">
              Browse the full set — or start over with guidance.
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-[#1e4f4f]/30 px-3 py-1.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f8f8]"
          >
            Start over
          </button>
        </div>
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {all.map((type) => (
            <li key={type.id}>
              <button
                type="button"
                onClick={() => onOpenHomeType(type.id)}
                className="flex w-full items-center gap-2 rounded-xl border border-[#e7dfd4] bg-white px-3 py-2.5 text-left hover:bg-[#faf7f2]"
              >
                <span aria-hidden>{type.emoji}</span>
                <span className="text-sm font-semibold text-[#1f1c19]">{type.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (step === "recommendation" && recommendation) {
    return (
      <section
        className="rounded-2xl border border-[#c5e0e0] bg-gradient-to-br from-[#f0f8f8] to-white p-5"
        data-testid="visual-thinking-guidance-recommendation"
      >
        <h2 className="text-lg font-semibold text-[#1f1c19]">Recommended Visual Tool</h2>
        <p className="mt-2 text-base font-bold text-[#1e4f4f]">
          {recommendationTitle(recommendation.homeTypeId)}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[#6b635a]">{recommendation.reason}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onOpenHomeType(recommendation.homeTypeId)}
            className="rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163c3c]"
            data-testid="visual-thinking-guidance-open"
          >
            Open Tool
          </button>
          <button
            type="button"
            onClick={() => setStep("alternatives")}
            className="rounded-xl border border-[#1e4f4f]/30 bg-white px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f8f8]"
          >
            Show Other Options
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#6b635a] hover:bg-[#faf7f2]"
          >
            Start over
          </button>
        </div>
      </section>
    );
  }

  if (step === "follow-up" && intent) {
    return (
      <section
        className="rounded-2xl border border-[#c5e0e0] bg-gradient-to-br from-[#f0f8f8] to-white p-5"
        data-testid="visual-thinking-guidance-follow-up"
      >
        <button
          type="button"
          onClick={() => setStep("intent")}
          className="text-sm font-semibold text-[#1e4f4f] hover:underline"
        >
          ← Back
        </button>
        <h2 className="mt-2 text-lg font-semibold text-[#1f1c19]">Which sounds closest?</h2>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {followUps.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => selectFollowUp(option.id)}
              className="rounded-xl border border-[#e7dfd4] bg-white px-4 py-3 text-left text-sm font-semibold text-[#1f1c19] hover:border-[#1e4f4f]/40 hover:bg-[#faf7f2]"
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      className="rounded-2xl border border-[#c5e0e0] bg-gradient-to-br from-[#f0f8f8] to-white p-5"
      data-testid="visual-thinking-guidance"
    >
      <h2 className="text-xl font-semibold text-[#1f1c19]">What are you trying to do?</h2>
      <p className="mt-1 text-sm text-[#6b635a]">
        Pick the closest match — we&apos;ll recommend the right visual tool.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {VISUAL_THINKING_INTENTS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => selectIntent(item.id)}
            className="flex items-center gap-3 rounded-xl border border-[#e7dfd4] bg-white px-4 py-3 text-left hover:border-[#1e4f4f]/40 hover:bg-[#faf7f2]"
            data-testid={`visual-thinking-intent-${item.id}`}
          >
            <span className="text-xl" aria-hidden>
              {item.emoji}
            </span>
            <span className="text-sm font-semibold text-[#1f1c19]">{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
