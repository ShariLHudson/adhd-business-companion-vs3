"use client";

import { useMemo } from "react";
import type { BrainDumpEntry } from "@/lib/companionStore";
import { buildBrainDumpClusterGraph } from "@/lib/brainDumpClusterModel";
import {
  CLEAR_MY_MIND_ACK_CONTINUE_LABEL,
  CLEAR_MY_MIND_CHOICES,
  shariChoiceReflection,
  shariUnderstandingOpener,
  type ClearMyMindChoiceId,
} from "@/lib/clearMyMindCompanionVoice";
import type { ClearMyMindStage } from "@/lib/clearMyMindStages";

type Props = {
  stage: ClearMyMindStage;
  entries: BrainDumpEntry[];
  onContinueToUnderstanding?: () => void;
  onChoice?: (choiceId: ClearMyMindChoiceId) => void;
  selectedChoice?: ClearMyMindChoiceId | null;
};

/** Companion voice and gentle actions — inline in the room, never a sidebar. */
export function ClearMyMindJourneySections({
  stage,
  entries,
  onContinueToUnderstanding,
  onChoice,
  selectedChoice = null,
}: Props) {
  const graph = useMemo(
    () => buildBrainDumpClusterGraph(entries),
    [entries],
  );

  if (stage === "received") {
    return (
      <div className="companion-fade-in mt-6 max-w-xl space-y-4">
        <p className="text-sm leading-relaxed text-[#6b635a]">
          You don&apos;t have to carry all of this by yourself anymore.
        </p>
        {onContinueToUnderstanding ? (
          <button
            type="button"
            onClick={onContinueToUnderstanding}
            className="clear-my-mind-capture-choice__suggestion clear-my-mind-capture-choice__suggestion--lead"
            data-testid="cmind-ack-continue"
          >
            {CLEAR_MY_MIND_ACK_CONTINUE_LABEL}
          </button>
        ) : null}
      </div>
    );
  }

  if (stage === "understanding" && graph.hasContent) {
    return (
      <div className="companion-fade-in mt-6 max-w-xl">
        <p
          className="text-base leading-relaxed text-[#3d362f]"
          data-testid="shari-understanding-opener"
        >
          {shariUnderstandingOpener(graph.clusters, graph.totalThoughts)}
        </p>
      </div>
    );
  }

  if (stage === "choice") {
    return (
      <div
        className="companion-fade-in mt-8 max-w-xl space-y-3"
        role="group"
        aria-label="Gentle next steps"
        data-testid="cmind-choice-group"
      >
        <p className="text-sm font-medium text-[#6b635a]">
          Only if you want — no pressure.
        </p>
        {CLEAR_MY_MIND_CHOICES.map((choice) => (
          <button
            key={choice.id}
            type="button"
            onClick={() => onChoice?.(choice.id)}
            className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]/35 ${
              selectedChoice === choice.id
                ? "border-[#1e4f4f]/35 bg-[#f0f8f8]"
                : "border-[#e7dfd4] bg-white/80 hover:border-[#c5ddd8] hover:bg-[#faf7f2]"
            }`}
            data-testid={`cmind-choice-${choice.id}`}
          >
            <span className="block text-base font-semibold text-[#1f1c19]">
              {choice.label}
            </span>
            <span className="mt-0.5 block text-sm text-[#6b635a]">
              {choice.subline}
            </span>
          </button>
        ))}
        {selectedChoice ? (
          <p
            className="text-sm leading-relaxed text-[#1e4f4f]"
            role="status"
            aria-live="polite"
          >
            {shariChoiceReflection(selectedChoice)}
          </p>
        ) : null}
      </div>
    );
  }

  return null;
}
