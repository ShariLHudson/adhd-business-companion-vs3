"use client";

import { useMemo, useState } from "react";
import type { BrainDumpEntry } from "@/lib/companionStore";
import {
  getThoughtCollections,
  getThoughtsForCollection,
  renameThoughtCollection,
  searchThinkingSpaceThoughts,
} from "@/lib/thinkingSpace";
import {
  getArchivedThoughts,
  getCompletedThoughts,
} from "@/lib/thinkingSpace/queries";
import {
  resolveCollectionLabel,
  resolveCollectionPalette,
} from "@/lib/thinkingSpace/collectionSummaries";
import {
  MY_THOUGHTS_FILTER_HINT,
  MY_THOUGHTS_FILTER_LABEL,
  MY_THOUGHTS_LOAD_MORE,
  MY_THOUGHTS_RENAME_COLLECTION,
  MY_THOUGHTS_SAVE_COLLECTION,
  MY_THOUGHTS_VIEW_HINT,
  MY_THOUGHTS_VIEW_LABEL,
  THOUGHT_FILTER_OPTIONS,
  THOUGHT_VIEW_GROUPS,
} from "@/lib/thinkingSpace/copy";
import {
  applyThoughtFilter,
  applyThoughtView,
  isTimeViewMode,
  PROGRESSIVE_DISCLOSURE_THRESHOLD,
  type ThoughtFilterId,
  type ThoughtViewMode,
} from "@/lib/thinkingSpace/thoughtViews";
import { ThinkingSpaceThoughtSections } from "@/components/companion/ThinkingSpaceThoughtSections";
import type { ThoughtSectionBucketMode } from "@/components/companion/ThinkingSpaceThoughtSections";

const PAGE_SIZE = 12;

type Props = {
  collectionId: string;
  searchQuery: string;
  thoughts: BrainDumpEntry[];
  onOpenThought: (entry: BrainDumpEntry) => void;
  onRefresh: () => void;
};

function isPersistedCollectionId(id: string): boolean {
  return id.startsWith("col-");
}

function thoughtPoolForFilter(
  filterId: ThoughtFilterId,
  activeThoughts: BrainDumpEntry[],
): BrainDumpEntry[] {
  if (filterId === "archived") return getArchivedThoughts();
  if (filterId === "completed") return getCompletedThoughts();
  return activeThoughts;
}

export function ThinkingSpaceCollectionView({
  collectionId,
  searchQuery,
  thoughts,
  onOpenThought,
  onRefresh,
}: Props) {
  const [viewMode, setViewMode] = useState<ThoughtViewMode>("recently-added");
  const [filterId, setFilterId] = useState<ThoughtFilterId>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const allInCollection = useMemo(() => {
    const source = thoughtPoolForFilter(filterId, thoughts);
    return getThoughtsForCollection(collectionId, source);
  }, [collectionId, thoughts, filterId]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim();
    const base = q
      ? searchThinkingSpaceThoughts(q, allInCollection)
      : allInCollection;
    const viewed = applyThoughtView(base, viewMode);
    return applyThoughtFilter(viewed, filterId);
  }, [allInCollection, searchQuery, viewMode, filterId]);

  const bucketMode: ThoughtSectionBucketMode = useMemo(() => {
    if (filtered.length < PROGRESSIVE_DISCLOSURE_THRESHOLD) return "none";
    if (isTimeViewMode(viewMode)) return "none";
    if (
      (viewMode === "recently-added" || viewMode === "oldest") &&
      filterId === "all"
    ) {
      return "time";
    }
    if (filterId === "waiting") return "status";
    return "none";
  }, [filtered.length, viewMode, filterId]);

  const useProgressiveBuckets = bucketMode !== "none";

  const visible = useProgressiveBuckets
    ? filtered
    : filtered.slice(0, visibleCount);

  const collections = useMemo(() => getThoughtCollections(), [thoughts]);
  const label = resolveCollectionLabel(collectionId);
  const headerPalette = useMemo(
    () => resolveCollectionPalette(collectionId),
    [collectionId],
  );
  const canRename = isPersistedCollectionId(collectionId);

  function startRename() {
    setRenameValue(label);
    setRenaming(true);
  }

  function saveRename() {
    if (!canRename) return;
    renameThoughtCollection(collectionId, renameValue);
    setRenaming(false);
    onRefresh();
  }

  function resetPagination() {
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div data-testid="thinking-space-collection-view">
      <div
        className="rounded-2xl border-2 px-4 py-4 sm:px-5"
        style={{
          background: headerPalette.bgGradient,
          borderColor: headerPalette.border,
        }}
      >
        {renaming ? (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="min-w-[10rem] flex-1 rounded-lg border border-white/60 bg-white/90 px-3 py-2 text-base font-semibold text-[#1f1c19] outline-none focus:border-[#1e4f4f]"
              autoFocus
            />
            <button
              type="button"
              onClick={saveRename}
              className="rounded-lg bg-[#1e4f4f] px-3 py-2 text-sm font-semibold text-white"
            >
              {MY_THOUGHTS_SAVE_COLLECTION}
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p
              className="text-xl font-semibold sm:text-2xl"
              style={{ color: headerPalette.text }}
            >
              {label}
            </p>
            {canRename ? (
              <button
                type="button"
                onClick={startRename}
                className="text-sm font-semibold underline opacity-80 hover:opacity-100"
                style={{ color: headerPalette.text }}
              >
                {MY_THOUGHTS_RENAME_COLLECTION}
              </button>
            ) : null}
          </div>
        )}
        <p className="mt-1 text-sm opacity-80" style={{ color: headerPalette.text }}>
          {filtered.length === 1
            ? "1 thought"
            : `${filtered.length} thoughts`}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <label className="text-sm font-medium text-[#6b635a]">
          {MY_THOUGHTS_VIEW_LABEL}
          <span className="ml-1 text-xs font-normal text-[#9a8f82]">
            — {MY_THOUGHTS_VIEW_HINT}
          </span>
          <select
            value={viewMode}
            onChange={(e) => {
              setViewMode(e.target.value as ThoughtViewMode);
              resetPagination();
            }}
            className="mt-1 block min-w-[11rem] rounded-lg border border-[#d4cdc3] bg-white px-3 py-2 text-sm text-[#1f1c19]"
            data-testid="thought-view-select"
          >
            {THOUGHT_VIEW_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-[#6b635a]">
          {MY_THOUGHTS_FILTER_LABEL}
          <span className="ml-1 text-xs font-normal text-[#9a8f82]">
            — {MY_THOUGHTS_FILTER_HINT}
          </span>
          <select
            value={filterId}
            onChange={(e) => {
              setFilterId(e.target.value as ThoughtFilterId);
              resetPagination();
            }}
            className="mt-1 block min-w-[11rem] rounded-lg border border-[#d4cdc3] bg-white px-3 py-2 text-sm text-[#1f1c19]"
            data-testid="thought-filter-select"
          >
            {THOUGHT_FILTER_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4" aria-label={`Thoughts in ${label}`}>
        {filtered.length === 0 ? (
          <p className="text-sm text-[#6b635a]">
            No thoughts match this view and filter.
          </p>
        ) : (
          <ThinkingSpaceThoughtSections
            thoughts={visible}
            collections={collections}
            onOpenThought={onOpenThought}
            bucketMode={bucketMode}
          />
        )}
      </div>

      {!useProgressiveBuckets && visibleCount < filtered.length ? (
        <button
          type="button"
          onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
          className="mt-4 rounded-xl border border-[#c5ddd8] bg-[#f0f8f8] px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#e6f4f4]"
        >
          {MY_THOUGHTS_LOAD_MORE} ({filtered.length - visibleCount} more)
        </button>
      ) : null}
    </div>
  );
}
