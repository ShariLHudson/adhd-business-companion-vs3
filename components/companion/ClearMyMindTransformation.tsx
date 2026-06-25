"use client";

import { useMemo, useState } from "react";
import { buildBrainDumpClusterGraph } from "@/lib/brainDumpClusterModel";
import {
  buildCollectionSummaries,
  getThoughtsForCollection,
} from "@/lib/thinkingSpace";
import {
  CLEAR_MY_MIND_ADD_MORE_LABEL,
  CLEAR_MY_MIND_AGENCY_EXPLORE,
  CLEAR_MY_MIND_AGENCY_PROMPT,
  CLEAR_MY_MIND_AGENCY_REST,
  CLEAR_MY_MIND_SECTION_CONNECTIONS,
  CLEAR_MY_MIND_SECTION_HOLDING,
  CLEAR_MY_MIND_SECTION_PATTERNS,
} from "@/lib/clearMyMindCopy";
import {
  shariChoiceReflection,
  shariPatternsLine,
  type ClearMyMindChoiceId,
} from "@/lib/clearMyMindCompanionVoice";
import type { ClearMyMindStage } from "@/lib/clearMyMindStages";
import {
  unfoldReached,
  type ClearMyMindUnfoldStep,
} from "@/lib/clearMyMindUnfold";
import { useThinkingSpace } from "@/lib/thinkingSpace/useThinkingSpace";
import type { BrainDumpEntry } from "@/lib/companionStore";
import { getBrainDumps } from "@/lib/companionStore";
import { CollectionOrganizeOffer } from "@/components/companion/CollectionOrganizeOffer";
import { ThinkingSpaceCollectionCard } from "@/components/companion/ThinkingSpaceCollectionCard";
import { ThinkingSpaceCollectionView } from "@/components/companion/ThinkingSpaceCollectionView";
import { ThoughtCompanionBox } from "@/components/companion/ThoughtCompanionBox";
import { ThoughtCompanionModal } from "@/components/companion/ThoughtCompanionModal";
import { ThoughtDetailSheet } from "@/components/companion/ThoughtDetailSheet";

type Props = {
  unfoldStep: ClearMyMindUnfoldStep;
  stage: ClearMyMindStage;
  sessionId: string;
  onChoice?: (choiceId: ClearMyMindChoiceId) => void;
  selectedChoice?: ClearMyMindChoiceId | null;
  onAddMore?: () => void;
};

export function ClearMyMindTransformation({
  unfoldStep,
  stage,
  sessionId,
  onChoice,
  selectedChoice = null,
  onAddMore,
}: Props) {
  const { thoughts, collections, refresh } = useThinkingSpace(sessionId);
  const [selectedThought, setSelectedThought] = useState<BrainDumpEntry | null>(
    null,
  );
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    string | null
  >(null);

  const graph = buildBrainDumpClusterGraph(thoughts);
  const summaries = useMemo(
    () => buildCollectionSummaries(thoughts),
    [thoughts],
  );
  const showHoldingList = thoughts.length <= 6;

  if (unfoldStep === "idle" || thoughts.length === 0) {
    return null;
  }

  const showConnections =
    unfoldReached(unfoldStep, "connections") && graph.hasContent;
  const showPatterns =
    unfoldReached(unfoldStep, "patterns") && graph.hasContent;
  const showPossibility = unfoldReached(unfoldStep, "possibility");

  return (
    <div
      className="clear-my-mind-transformation mt-8 space-y-8"
      data-cmind-unfold={unfoldStep}
      data-cmind-stage={stage}
    >
      {unfoldReached(unfoldStep, "holding") ? (
        <section
          className="cmind-unfold-section companion-fade-in"
          data-testid="cmind-section-holding"
        >
          <h3 className="cmind-section-title">{CLEAR_MY_MIND_SECTION_HOLDING}</h3>
          <p className="mt-1 text-sm leading-relaxed text-[#6b635a]">
            {showHoldingList
              ? "Tap any thought to open, edit, connect, or archive."
              : "Explore a collection below — one area at a time."}
          </p>
          {showHoldingList ? (
            <ul className="mt-4 flex flex-col gap-2.5" aria-label="Held thoughts">
              {thoughts.map((entry) => (
                <li key={entry.id}>
                  <ThoughtCompanionBox
                    entry={entry}
                    selected={selectedThought?.id === entry.id}
                    onOpen={setSelectedThought}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {summaries.map((summary) => (
                <ThinkingSpaceCollectionCard
                  key={summary.id}
                  summary={summary}
                  onOpen={setSelectedCollectionId}
                />
              ))}
            </div>
          )}
        </section>
      ) : null}

      {showConnections ? (
        <section
          className="cmind-unfold-section companion-fade-in"
          data-testid="cmind-section-connections"
        >
          <h3 className="cmind-section-title">
            {CLEAR_MY_MIND_SECTION_CONNECTIONS}
          </h3>
          <div className="mt-4 space-y-4">
            {selectedCollectionId ? (
              <ThinkingSpaceCollectionView
                collectionId={selectedCollectionId}
                searchQuery=""
                thoughts={thoughts}
                onOpenThought={setSelectedThought}
                onRefresh={refresh}
              />
            ) : null}
          </div>
        </section>
      ) : null}

      {showPatterns ? (
        <section
          className="cmind-unfold-section companion-fade-in"
          data-testid="cmind-section-patterns"
        >
          <h3 className="cmind-section-title">{CLEAR_MY_MIND_SECTION_PATTERNS}</h3>
          <p className="mt-1 text-sm leading-relaxed text-[#6b635a]">
            {shariPatternsLine(graph.clusters.length)}
          </p>
          <div className="mt-4">
            <CollectionOrganizeOffer
              entries={thoughts}
              clusters={graph.clusters}
              onOrganized={refresh}
            />
          </div>
        </section>
      ) : null}

      {showPossibility ? (
        <section
          className="cmind-unfold-section companion-fade-in"
          data-testid="cmind-section-possibility"
        >
          <div
            className="rounded-2xl border border-[#e7dfd4] bg-white/90 px-5 py-5"
            role="group"
            aria-label="Gentle invitation"
          >
            <p className="text-base leading-relaxed text-[#3d362f]">
              {CLEAR_MY_MIND_AGENCY_PROMPT}
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => onChoice?.("explore")}
                className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]/35 ${
                  selectedChoice === "explore"
                    ? "border-[#1e4f4f]/35 bg-[#f0f8f8] text-[#1e4f4f]"
                    : "border-[#c5ddd8] bg-[#f0f8f8] text-[#1e4f4f] hover:bg-[#e6f4f4]"
                }`}
                data-testid="cmind-agency-explore"
              >
                {CLEAR_MY_MIND_AGENCY_EXPLORE}
              </button>
              <button
                type="button"
                onClick={() => onChoice?.("rest")}
                className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]/35 ${
                  selectedChoice === "rest"
                    ? "border-[#1e4f4f]/35 bg-[#faf7f2] text-[#1f1c19]"
                    : "border-[#e7dfd4] bg-white text-[#3d3630] hover:bg-[#faf7f2]"
                }`}
                data-testid="cmind-agency-rest"
              >
                {CLEAR_MY_MIND_AGENCY_REST}
              </button>
            </div>
            {selectedChoice ? (
              <p
                className="mt-4 text-sm leading-relaxed text-[#1e4f4f]"
                role="status"
                aria-live="polite"
              >
                {shariChoiceReflection(selectedChoice)}
              </p>
            ) : null}
          </div>

          {onAddMore ? (
            <div className="mt-4">
              <button
                type="button"
                onClick={onAddMore}
                className="rounded-xl border-2 border-[#1e4f4f]/25 bg-white px-5 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#1e4f4f]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]/35"
                data-testid="add-more-thoughts-button"
              >
                {CLEAR_MY_MIND_ADD_MORE_LABEL}
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {selectedThought ? (
        <ThoughtCompanionModal onClose={() => setSelectedThought(null)}>
          <ThoughtDetailSheet
            key={selectedThought.id}
            entry={selectedThought}
            allThoughts={thoughts}
            variant="modal"
            onClose={() => setSelectedThought(null)}
            onChanged={() => {
              refresh();
              setSelectedThought((prev) => {
                if (!prev) return null;
                return getBrainDumps().find((t) => t.id === prev.id) ?? null;
              });
            }}
            onDeleted={() => setSelectedThought(null)}
          />
        </ThoughtCompanionModal>
      ) : null}
    </div>
  );
}
