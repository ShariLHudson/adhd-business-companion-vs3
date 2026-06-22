"use client";

import { useCallback, useMemo, useState } from "react";
import type { BrainDumpEntry } from "@/lib/companionStore";
import {
  buildBrainDumpClusterGraph,
  clusterOffersThoughtPreview,
  clusterReliefAcknowledgement,
  clusterThoughtExpansionFallback,
  formatClusterDotWeight,
  getClusterVisibleThoughts,
} from "@/lib/brainDumpClusterModel";
import { generateMentalLandscapeInsight } from "@/lib/mentalLandscapeInsight";
import {
  INITIAL_RELIEF_CLUSTER_EXPANSION,
  reliefClusterHideThoughts,
  reliefClusterShowThoughts,
  reliefClusterTap,
  type ReliefClusterExpansionState,
} from "@/lib/reliefClusterExpansion";
import {
  applyThoughtAction,
  thoughtActionOpensSection,
  type ThoughtAction,
  type ThoughtActionResult,
} from "@/lib/thoughtActions";
import type { AppSection } from "@/lib/companionUi";
import { ThoughtActionSheet } from "@/components/companion/ThoughtActionSheet";

const toggleLinkClass =
  "mt-2 text-sm font-semibold text-[#1e4f4f] underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]/35";

const thoughtButtonClass =
  "w-full rounded-lg px-2 py-1.5 text-left text-sm leading-relaxed text-[#2d2926] hover:bg-[#1e4f4f]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]/35";

const thoughtButtonActiveClass =
  "w-full rounded-lg bg-[#1e4f4f]/8 px-2 py-1.5 text-left text-sm font-medium leading-relaxed text-[#1f1c19] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]/35";

function ThoughtActionTrust({ result }: { result: ThoughtActionResult }) {
  if (!result.ok) return null;
  return (
    <div
      className="companion-fade-in mt-3 rounded-xl border border-[#1e4f4f]/25 bg-[#1e4f4f]/[0.07] px-4 py-3 text-sm leading-relaxed text-[#2d2926]"
      data-testid="thought-action-trust"
    >
      <p className="font-semibold text-[#1e4f4f]">{result.headline}</p>
      <p className="mt-1">
        <span className="font-medium">Saved to:</span> {result.savedWhere}
      </p>
      <p className="mt-0.5">
        <span className="font-medium">You&apos;ll see it:</span> {result.seeWhere}
      </p>
    </div>
  );
}

export function ClearMyMindReliefClusters({
  entries,
  onOpen,
  onEntriesChange,
}: {
  entries: BrainDumpEntry[];
  onOpen?: (section: AppSection) => void;
  onEntriesChange?: () => void;
}) {
  const graph = useMemo(() => buildBrainDumpClusterGraph(entries), [entries]);
  const entryById = useMemo(
    () => new Map(entries.map((e) => [e.id, e])),
    [entries],
  );
  const insight = useMemo(
    () => generateMentalLandscapeInsight(graph.clusters, graph.totalThoughts),
    [graph.clusters, graph.totalThoughts],
  );
  const [expansion, setExpansion] = useState<ReliefClusterExpansionState>(
    INITIAL_RELIEF_CLUSTER_EXPANSION,
  );
  const [selectedThoughtId, setSelectedThoughtId] = useState<string | null>(
    null,
  );
  const [trust, setTrust] = useState<ThoughtActionResult | null>(null);

  const handleClusterTap = useCallback((clusterId: string) => {
    setSelectedThoughtId(null);
    setTrust(null);
    setExpansion((prev) => reliefClusterTap(prev, clusterId));
  }, []);

  const handleShowThoughts = useCallback((clusterId: string) => {
    setSelectedThoughtId(null);
    setTrust(null);
    setExpansion((prev) => reliefClusterShowThoughts(prev, clusterId));
  }, []);

  const handleHideThoughts = useCallback(() => {
    setSelectedThoughtId(null);
    setTrust(null);
    setExpansion((prev) => reliefClusterHideThoughts(prev));
  }, []);

  const handleThoughtAction = useCallback(
    (entry: BrainDumpEntry, action: ThoughtAction) => {
      const result = applyThoughtAction(entry, action);
      setTrust(result);
      onEntriesChange?.();

      const section = thoughtActionOpensSection(action);
      if (section) onOpen?.(section);

      if (result.removedFromLandscape) {
        setSelectedThoughtId(null);
      }

      window.setTimeout(() => setTrust(null), 3200);
    },
    [onEntriesChange, onOpen],
  );

  if (!graph.hasContent) {
    return (
      <p className="text-sm text-[#6b635a]" role="status">
        Everything is captured.
      </p>
    );
  }

  return (
    <div
      className="rounded-2xl border border-[#e7dfd4] bg-[#faf7f2]/80 p-4 sm:p-5"
      role="region"
      aria-label="Thought clusters"
      data-testid="clear-my-mind-relief-clusters"
    >
      <p className="text-lg font-semibold leading-snug text-[#1f1c19]">
        Everything is held.
      </p>

      <p
        className="mt-2 text-base leading-relaxed text-[#5a5248]"
        role="note"
        data-testid="mental-landscape-insight"
      >
        {insight}
      </p>

      {trust ? <ThoughtActionTrust result={trust} /> : null}

      <ul className="mt-4 flex flex-col gap-2.5" role="list">
        {graph.clusters.map((cluster) => {
          const { dots, suffix } = formatClusterDotWeight(cluster.count);
          const isActive = expansion.activeClusterId === cluster.id;
          const thoughtsVisible =
            expansion.thoughtsVisibleClusterId === cluster.id;
          const thoughtLabel =
            cluster.count === 1 ? "1 thought" : `${cluster.count} thoughts`;
          const visibleThoughts = getClusterVisibleThoughts(cluster);
          const fallback = clusterThoughtExpansionFallback(cluster);
          const canPreview = clusterOffersThoughtPreview(cluster);

          return (
            <li key={cluster.id}>
              <div
                className={`rounded-xl border-2 transition-colors ${
                  isActive
                    ? "border-[#1e4f4f]/35 bg-white shadow-sm"
                    : "border-transparent bg-white/75"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleClusterTap(cluster.id)}
                  aria-expanded={isActive}
                  aria-label={`${cluster.label}, ${thoughtLabel}`}
                  className="w-full rounded-xl px-4 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]/35"
                >
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-base font-semibold text-[#1f1c19]">
                      <span aria-hidden="true">{cluster.icon} </span>
                      {cluster.label}
                    </span>
                    <span
                      className="text-sm tracking-[0.2em] text-[#7c7468]"
                      aria-hidden="true"
                    >
                      {dots}
                      {suffix ? (
                        <span className="ml-1.5 tracking-normal text-[#9a8f82]">
                          {suffix}
                        </span>
                      ) : null}
                    </span>
                  </div>
                </button>

                {isActive ? (
                  <div
                    className="companion-fade-in px-4 pb-3"
                    data-testid={`cluster-expansion-${cluster.id}`}
                  >
                    <p
                      className="text-sm leading-relaxed text-[#1e4f4f]"
                      role="status"
                      aria-live="polite"
                      data-testid="cluster-relief-acknowledgement"
                    >
                      {clusterReliefAcknowledgement(cluster.count)}
                    </p>

                    {thoughtsVisible ? (
                      <>
                        {fallback ? (
                          <p
                            className="mt-2 text-sm leading-relaxed text-[#5a5248]"
                            data-testid="cluster-thought-fallback"
                          >
                            {fallback}
                          </p>
                        ) : (
                          <ul
                            className="mt-2 list-none space-y-1 pl-0"
                            data-testid="cluster-thought-list"
                          >
                            {visibleThoughts.map((thought) => {
                              const entry = entryById.get(thought.id);
                              const isSelected = selectedThoughtId === thought.id;
                              return (
                                <li key={thought.id}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTrust(null);
                                      setSelectedThoughtId(
                                        isSelected ? null : thought.id,
                                      );
                                    }}
                                    className={
                                      isSelected
                                        ? thoughtButtonActiveClass
                                        : thoughtButtonClass
                                    }
                                    data-testid={`cluster-thought-${thought.id}`}
                                  >
                                    {thought.text}
                                  </button>
                                  {isSelected && entry ? (
                                    <ThoughtActionSheet
                                      entry={entry}
                                      onAction={(action) =>
                                        handleThoughtAction(entry, action)
                                      }
                                    />
                                  ) : null}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                        <button
                          type="button"
                          onClick={handleHideThoughts}
                          className={toggleLinkClass}
                          data-testid="hide-cluster-thoughts"
                        >
                          Hide thoughts
                        </button>
                      </>
                    ) : canPreview ? (
                      <button
                        type="button"
                        onClick={() => handleShowThoughts(cluster.id)}
                        className={toggleLinkClass}
                        data-testid="view-cluster-thoughts"
                      >
                        View thoughts
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-sm text-[#6b635a]">Everything is captured.</p>
    </div>
  );
}
