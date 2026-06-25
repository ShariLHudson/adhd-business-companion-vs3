"use client";

import { useMemo } from "react";
import { ASSETS } from "@/lib/companionUi";
import type { BrainDumpEntry } from "@/lib/companionStore";
import { buildBrainDumpClusterGraph } from "@/lib/brainDumpClusterModel";
import {
  CLEAR_MY_MIND_ACK_CONTINUE_LABEL,
  CLEAR_MY_MIND_CHOICES,
  shariChoiceReflection,
  shariReceiveAcknowledgment,
  shariUnderstandingOpener,
  type ClearMyMindChoiceId,
} from "@/lib/clearMyMindCompanionVoice";
import type { ClearMyMindStage } from "@/lib/clearMyMindStages";
import type { AppSection } from "@/lib/companionUi";

type Props = {
  stage: ClearMyMindStage;
  entries: BrainDumpEntry[];
  onContinueToUnderstanding?: () => void;
  onChoice?: (choiceId: ClearMyMindChoiceId) => void;
  onOpen?: (section: AppSection) => void;
  selectedChoice?: ClearMyMindChoiceId | null;
};

export function ClearMyMindCompanionPanel({
  stage,
  entries,
  onContinueToUnderstanding,
  onChoice,
  selectedChoice,
}: Props) {
  const graph = useMemo(
    () => buildBrainDumpClusterGraph(entries),
    [entries],
  );

  if (stage === "permission" || stage === "release") {
    return null;
  }

  const acknowledgment = shariReceiveAcknowledgment(entries);

  return (
    <aside
      className="clear-my-mind-companion flex h-full min-h-0 min-w-0 flex-col border-t border-[#e7dfd4]/80 bg-gradient-to-b from-[#fffdf9]/95 to-[#f7f0e8]/90 lg:border-t-0 lg:border-l"
      aria-label="Shari"
      data-testid="clear-my-mind-companion-panel"
      data-cmind-stage={stage}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-6 sm:px-6">
        <div className="flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ASSETS.profile}
            alt=""
            aria-hidden="true"
            className="h-16 w-16 rounded-full object-cover shadow-[0_4px_18px_rgba(47,38,31,0.10)] ring-2 ring-white/90"
          />
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#9a8f82]">
            Shari
          </p>
        </div>

        {stage === "received" ? (
          <div className="companion-fade-in mt-6 space-y-4">
            <p
              className="text-lg leading-relaxed text-[#2f261f]"
              role="status"
              aria-live="polite"
              data-testid="shari-receive-ack"
            >
              {acknowledgment}
            </p>
            <p className="text-sm leading-relaxed text-[#6b635a]">
              You don&apos;t have to carry all of this by yourself anymore.
            </p>
            {onContinueToUnderstanding ? (
              <button
                type="button"
                onClick={onContinueToUnderstanding}
                className="w-full rounded-2xl border border-[#c5ddd8] bg-[#f0f8f8] px-5 py-3 text-base font-semibold text-[#1e4f4f] transition-colors hover:bg-[#e6f4f4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]/35"
                data-testid="cmind-ack-continue"
              >
                {CLEAR_MY_MIND_ACK_CONTINUE_LABEL}
              </button>
            ) : null}
          </div>
        ) : null}

        {(stage === "understanding" || stage === "choice") && graph.hasContent ? (
          <div className="companion-fade-in mt-6 space-y-3">
            <p
              className="text-base leading-relaxed text-[#3d362f]"
              data-testid="shari-understanding-opener"
            >
              {shariUnderstandingOpener(graph.clusters, graph.totalThoughts)}
            </p>
            <ul className="mt-2 space-y-2" role="list" aria-label="Themes emerging">
              {graph.clusters
                .filter((c) => c.id !== "__more__")
                .slice(0, 5)
                .map((cluster) => (
                  <li
                    key={cluster.id}
                    className="rounded-xl border border-white/60 bg-white/70 px-4 py-2.5 text-left text-sm text-[#2f261f]"
                  >
                    <span aria-hidden="true">{cluster.icon} </span>
                    {cluster.label}
                    <span className="ml-2 text-[#9a8f82]">· {cluster.count}</span>
                  </li>
                ))}
            </ul>
          </div>
        ) : null}

        {stage === "choice" ? (
          <div
            className="companion-fade-in mt-8 space-y-3"
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
        ) : null}
      </div>
    </aside>
  );
}
