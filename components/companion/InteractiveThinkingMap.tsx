"use client";

/**
 * @deprecated V2 — Future Thinking Map (relationship visualization).
 * Not mounted in v1 My Thoughts.
 */

import { useMemo } from "react";
import type { BrainDumpEntry } from "@/lib/companionStore";
import { buildBrainDumpClusterGraph } from "@/lib/brainDumpClusterModel";
import {
  countThoughtsInCollection,
  getThoughtCollections,
  thoughtBelongsToCollection,
  type ThoughtCollection,
} from "@/lib/thinkingSpace";
import { THINKING_MAP_TITLE } from "@/lib/thinkingSpace/copy";
import { VISUAL_THINKING_COLORS } from "@/lib/visualThinkingColors";
import { ThoughtCompanionBox } from "@/components/companion/ThoughtCompanionBox";

type Props = {
  thoughts: BrainDumpEntry[];
  selectedCollectionId: string | null;
  selectedThoughtId: string | null;
  onSelectCollection: (id: string | null) => void;
  onOpenThought: (entry: BrainDumpEntry) => void;
};

export function InteractiveThinkingMap({
  thoughts,
  selectedCollectionId,
  selectedThoughtId,
  onSelectCollection,
  onOpenThought,
}: Props) {
  const graph = useMemo(
    () => buildBrainDumpClusterGraph(thoughts),
    [thoughts],
  );
  const storedCollections = useMemo(() => getThoughtCollections(), [thoughts]);

  const collections: ThoughtCollection[] = useMemo(() => {
    const byId = new Map(storedCollections.map((c) => [c.id, c]));
    for (const cluster of graph.clusters) {
      if (cluster.id === "__more__") continue;
      const existing = [...byId.values()].find(
        (c) => c.label.toLowerCase() === cluster.label.toLowerCase(),
      );
      if (!existing) {
        const virtual: ThoughtCollection = {
          id: `cluster-${cluster.id}`,
          label: cluster.label,
          createdAt: "",
          userCreated: false,
          suggestedByAi: true,
        };
        byId.set(virtual.id, virtual);
      }
    }
    return [...byId.values()].sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, [graph.clusters, storedCollections]);

  function collectionThoughtIds(collection: ThoughtCollection): string[] {
    if (collection.id.startsWith("cluster-")) {
      const clusterId = collection.id.replace("cluster-", "");
      const cluster = graph.clusters.find((c) => c.id === clusterId);
      if (!cluster) return [];
      return cluster.subClusters.flatMap((s) =>
        s.thoughts.map((t) => t.id),
      );
    }
    return thoughts
      .filter((t) => thoughtBelongsToCollection(t, collection.id))
      .map((t) => t.id);
  }

  function handleCollectionClick(collection: ThoughtCollection) {
    const realId = collection.id.startsWith("cluster-")
      ? null
      : collection.id;
    if (selectedCollectionId === realId || selectedCollectionId === collection.id) {
      onSelectCollection(null);
      return;
    }
    onSelectCollection(collection.id.startsWith("cluster-") ? collection.id : realId);
  }

  const highlightedIds = useMemo(() => {
    if (!selectedCollectionId) return null;
    const col = collections.find((c) => c.id === selectedCollectionId);
    if (!col) return null;
    return new Set(collectionThoughtIds(col));
  }, [selectedCollectionId, collections, thoughts, graph]);

  return (
    <div className="thinking-map" data-testid="interactive-thinking-map">
      <p className="cmind-section-title">{THINKING_MAP_TITLE}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {collections.map((collection) => {
          const cluster = graph.clusters.find(
            (c) =>
              collection.id === `cluster-${c.id}` ||
              collection.label === c.label,
          );
          const tone = cluster?.tone ?? "decision";
          const palette = VISUAL_THINKING_COLORS[tone];
          const count = collection.id.startsWith("cluster-")
            ? collectionThoughtIds(collection).length
            : countThoughtsInCollection(collection.id, thoughts);
          const active = selectedCollectionId === collection.id;

          return (
            <button
              key={collection.id}
              type="button"
              onClick={() => handleCollectionClick(collection)}
              className={`thinking-map-collection companion-fade-in rounded-2xl border-2 px-3 py-2.5 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]/35 ${
                active ? "ring-2 ring-[#1e4f4f]/30" : ""
              }`}
              style={{
                background: palette.bgGradient,
                borderColor: active ? "#1e4f4f" : palette.border,
              }}
              data-testid={`collection-${collection.id}`}
              aria-pressed={active}
            >
              <span className="text-base" aria-hidden>
                {cluster?.icon ?? "📂"}
              </span>
              <span
                className="ml-1.5 text-sm font-semibold"
                style={{ color: palette.text }}
              >
                {collection.label}
              </span>
              <span
                className="ml-1.5 text-xs opacity-70"
                style={{ color: palette.text }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <ul className="mt-4 flex flex-col gap-2" aria-label="Thoughts on map">
        {thoughts.map((entry) => {
          const dimmed =
            highlightedIds !== null && !highlightedIds.has(entry.id);
          const highlighted =
            highlightedIds !== null && highlightedIds.has(entry.id);
          return (
            <li key={entry.id}>
              <ThoughtCompanionBox
                entry={entry}
                dimmed={dimmed}
                highlighted={highlighted}
                selected={selectedThoughtId === entry.id}
                onOpen={onOpenThought}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
