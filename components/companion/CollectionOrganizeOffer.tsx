"use client";

import { useState } from "react";
import type { BrainDumpEntry } from "@/lib/companionStore";
import type { ThoughtCluster } from "@/lib/brainDumpClusterModel";
import {
  acceptClusterAsCollection,
  applyAiCollectionSuggestions,
} from "@/lib/thinkingSpace";
import {
  COLLECTION_ORGANIZE_ACCEPT,
  COLLECTION_ORGANIZE_PROMPT,
  COLLECTION_ORGANIZE_RENAME,
  COLLECTION_ORGANIZE_SKIP,
} from "@/lib/thinkingSpace/copy";
import { renameThoughtCollection } from "@/lib/thinkingSpace/collections";

type Props = {
  entries: BrainDumpEntry[];
  clusters: ThoughtCluster[];
  onOrganized: () => void;
};

export function CollectionOrganizeOffer({
  entries,
  clusters,
  onOrganized,
}: Props) {
  const [dismissed, setDismissed] = useState(false);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  if (dismissed || clusters.length === 0) return null;

  const suggestions = clusters.filter((c) => c.id !== "__more__");

  function thoughtIdsForCluster(cluster: ThoughtCluster): string[] {
    return cluster.subClusters.flatMap((s) => s.thoughts.map((t) => t.id));
  }

  function handleAcceptAll() {
    applyAiCollectionSuggestions(
      entries,
      suggestions.map((c) => c.label),
    );
    for (const cluster of suggestions) {
      const ids = thoughtIdsForCluster(cluster);
      if (ids.length) {
        acceptClusterAsCollection(cluster.label, ids);
      }
    }
    onOrganized();
    setDismissed(true);
  }

  function handleAcceptOne(cluster: ThoughtCluster) {
    const ids = thoughtIdsForCluster(cluster);
    if (ids.length) {
      const colId = acceptClusterAsCollection(cluster.label, ids);
      if (renaming === cluster.id && renameValue.trim()) {
        renameThoughtCollection(colId, renameValue.trim());
      }
    }
    onOrganized();
  }

  return (
    <div
      className="companion-fade-in rounded-2xl border border-[#c5ddd8] bg-[#f0f8f8]/80 px-4 py-4"
      data-testid="collection-organize-offer"
    >
      <p className="text-base leading-relaxed text-[#3d362f]">
        {COLLECTION_ORGANIZE_PROMPT}
      </p>
      <ul className="mt-3 space-y-2">
        {suggestions.map((cluster) => (
          <li
            key={cluster.id}
            className="flex flex-wrap items-center gap-2 rounded-xl border border-[#e7dfd4] bg-white/90 px-3 py-2"
          >
            <span className="text-sm font-semibold text-[#1f1c19]">
              {cluster.icon} {cluster.label}
            </span>
            {renaming === cluster.id ? (
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-[#d4cdc3] px-2 py-1 text-sm"
                placeholder="Rename…"
              />
            ) : null}
            <button
              type="button"
              onClick={() => handleAcceptOne(cluster)}
              className="rounded-lg bg-[#1e4f4f] px-3 py-1.5 text-xs font-semibold text-white"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => {
                setRenaming(cluster.id);
                setRenameValue(cluster.label);
              }}
              className="rounded-lg border border-[#e7dfd4] px-3 py-1.5 text-xs font-semibold text-[#3d3630]"
            >
              {COLLECTION_ORGANIZE_RENAME}
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleAcceptAll}
          className="rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white"
        >
          {COLLECTION_ORGANIZE_ACCEPT}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded-xl border border-[#e7dfd4] bg-white px-4 py-2.5 text-sm font-semibold text-[#3d3630]"
        >
          {COLLECTION_ORGANIZE_SKIP}
        </button>
      </div>
    </div>
  );
}
