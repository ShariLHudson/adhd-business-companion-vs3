"use client";

import { useMemo, useState } from "react";
import type { BrainDumpEntry } from "@/lib/companionStore";
import { deleteBrainDump, updateBrainDump, addBrainDump } from "@/lib/companionStore";
import {
  CLEAR_MY_MIND_RESULT_BUCKETS,
  groupEntriesIntoResultBuckets,
  type ClearMyMindResultBucketId,
} from "@/lib/clearMyMindResultBuckets";
import { CLEAR_MY_MIND_VISUAL_OFFER } from "@/lib/clearMyMindCopy";
import { ClearMyMindSessionEnd } from "@/components/companion/ClearMyMindSessionEnd";
import { ThoughtActionSheet } from "@/components/companion/ThoughtActionSheet";
import { setClearMyMindModePhase } from "@/lib/clearMyMind/clearMyMindMode";
import {
  applyThoughtAction,
  type ThoughtAction,
} from "@/lib/thoughtActions";
import {
  copyClearMyMindSessionList,
  printClearMyMindSessionList,
} from "@/lib/brainDumpCanvasExport";
import { analyzeClearMyMindWorkspace } from "@/lib/clearMyMindWorkspaceIntelligence";

type Props = {
  entries: BrainDumpEntry[];
  onRefresh: () => void;
  onOpenVisualThinking?: () => void;
  onReturnHome?: () => void;
  onOpenMyThoughts?: () => void;
  showSessionEnd?: boolean;
  /** When true, show Spark's analysis banner while groups load. */
  showAnalysisBanner?: boolean;
};

export function ClearMyMindResultsWorkspace({
  entries,
  onRefresh,
  onOpenVisualThinking,
  onReturnHome,
  onOpenMyThoughts,
  showSessionEnd = false,
  showAnalysisBanner = true,
}: Props) {
  const buckets = useMemo(() => groupEntriesIntoResultBuckets(entries), [entries]);
  const analysis = useMemo(
    () => analyzeClearMyMindWorkspace(entries),
    [entries],
  );
  const [collapsed, setCollapsed] = useState<Set<ClearMyMindResultBucketId>>(
    () => new Set(),
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [renamingId, setRenamingId] = useState<ClearMyMindResultBucketId | null>(
    null,
  );
  const [renameText, setRenameText] = useState("");
  const [customLabels, setCustomLabels] = useState<
    Partial<Record<ClearMyMindResultBucketId, string>>
  >({});
  const [actionEntryId, setActionEntryId] = useState<string | null>(null);
  const [exportAck, setExportAck] = useState<string | null>(null);

  if (buckets.length === 0) {
    return (
      <div className="clear-my-mind-results" data-testid="clear-my-mind-results">
        <p className="clear-my-mind-session-tool__empty">
          Nothing to organize yet — add a few thoughts, then come back here.
        </p>
      </div>
    );
  }

  function toggleBucket(id: ClearMyMindResultBucketId) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function moveEntry(entryId: string, bucketId: ClearMyMindResultBucketId) {
    const label =
      customLabels[bucketId] ??
      CLEAR_MY_MIND_RESULT_BUCKETS.find((b) => b.id === bucketId)?.label ??
      bucketId;
    updateBrainDump(entryId, { category: label, topic: label });
    onRefresh();
  }

  function combineEntries(a: BrainDumpEntry, b: BrainDumpEntry) {
    updateBrainDump(a.id, { text: `${a.text.trim()}\n${b.text.trim()}` });
    deleteBrainDump(b.id);
    onRefresh();
  }

  function startEdit(entry: BrainDumpEntry) {
    setEditingId(entry.id);
    setEditText(entry.text);
  }

  function saveEdit(entryId: string) {
    const text = editText.trim();
    if (!text) return;
    updateBrainDump(entryId, { text });
    setEditingId(null);
    onRefresh();
  }

  function splitEntry(entry: BrainDumpEntry) {
    const parts = entry.text
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length < 2) return;
    updateBrainDump(entry.id, { text: parts[0]! });
    for (let i = 1; i < parts.length; i++) {
      addBrainDump(parts[i]!, { captureSessionId: entry.captureSessionId });
    }
    onRefresh();
  }

  function saveRename(id: ClearMyMindResultBucketId) {
    const label = renameText.trim();
    if (label) {
      setCustomLabels((prev) => ({ ...prev, [id]: label }));
      const bucket = buckets.find((b) => b.id === id);
      for (const entry of bucket?.entries ?? []) {
        updateBrainDump(entry.id, { category: label, topic: label });
      }
      onRefresh();
    }
    setRenamingId(null);
  }

  function runThoughtAction(entry: BrainDumpEntry, action: ThoughtAction) {
    const result = applyThoughtAction(entry, action);
    setExportAck(result.ok ? result.seeWhere || result.headline : result.headline);
    setActionEntryId(null);
    onRefresh();
  }

  async function handleCopy() {
    const ok = await copyClearMyMindSessionList(entries);
    setExportAck(ok ? "Copied your thoughts to the clipboard." : "Could not copy.");
  }

  function handlePrint() {
    printClearMyMindSessionList(entries);
    setExportAck("Print dialog opened.");
  }

  const waitingItems = buckets.find((b) => b.id === "waiting")?.entries.length ?? 0;
  const parkingLotItems =
    buckets.find((b) => b.id === "someday")?.entries.length ?? 0;
  const referenceItems =
    buckets.find((b) => b.id === "research")?.entries.length ?? 0;

  return (
    <div className="clear-my-mind-results" data-testid="clear-my-mind-results">
      {showAnalysisBanner ? (
        <div
          className="clear-my-mind-results__analysis"
          role="status"
          data-testid="cmm-organize-analysis"
        >
          <p className="clear-my-mind-results__analysis-line">
            As I looked through what you shared…
          </p>
          <p className="clear-my-mind-results__analysis-insight">
            {analysis.insight}
          </p>
          {analysis.priorityHeadline ? (
            <p className="clear-my-mind-results__analysis-priority">
              {analysis.priorityHeadline}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="clear-my-mind-results__toolbar mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="clear-my-mind-result-item__btn"
          data-testid="cmm-organize-print"
          onClick={handlePrint}
        >
          Print
        </button>
        <button
          type="button"
          className="clear-my-mind-result-item__btn"
          data-testid="cmm-organize-copy"
          onClick={() => void handleCopy()}
        >
          Copy
        </button>
        {onOpenMyThoughts ? (
          <button
            type="button"
            className="clear-my-mind-result-item__btn"
            data-testid="cmm-organize-my-thoughts"
            onClick={onOpenMyThoughts}
          >
            Open My Thoughts
          </button>
        ) : null}
      </div>
      {exportAck ? (
        <p className="clear-my-mind-capture-choice__ack mb-3" role="status">
          {exportAck}
        </p>
      ) : null}

      <div className="clear-my-mind-results__grid">
        {buckets.map((bucket) => {
          const isCollapsed = collapsed.has(bucket.id);
          const displayLabel = customLabels[bucket.id] ?? bucket.label;
          return (
            <section
              key={bucket.id}
              className="clear-my-mind-result-card"
              data-testid={`result-bucket-${bucket.id}`}
            >
              <button
                type="button"
                className="clear-my-mind-result-card__header"
                onClick={() => toggleBucket(bucket.id)}
                aria-expanded={!isCollapsed}
              >
                <span className="clear-my-mind-result-card__title">
                  {displayLabel}
                </span>
                <span className="clear-my-mind-result-card__count">
                  {bucket.entries.length}
                </span>
                <span aria-hidden="true">{isCollapsed ? "▸" : "▾"}</span>
              </button>
              {!isCollapsed ? (
                <>
                  {renamingId === bucket.id ? (
                    <div className="clear-my-mind-result-card__rename">
                      <input
                        value={renameText}
                        onChange={(e) => setRenameText(e.target.value)}
                        aria-label="Rename cluster"
                        className="clear-my-mind-result-item__edit"
                      />
                      <button
                        type="button"
                        className="clear-my-mind-result-item__btn"
                        onClick={() => saveRename(bucket.id)}
                      >
                        Save name
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="clear-my-mind-result-item__btn"
                      onClick={() => {
                        setRenamingId(bucket.id);
                        setRenameText(displayLabel);
                      }}
                    >
                      Rename cluster
                    </button>
                  )}
                  <ul className="clear-my-mind-result-card__list">
                    {bucket.entries.map((entry, index) => (
                      <li key={entry.id} className="clear-my-mind-result-item">
                        {editingId === entry.id ? (
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="clear-my-mind-result-item__edit"
                            rows={3}
                          />
                        ) : (
                          <p className="clear-my-mind-result-item__text">
                            {entry.text}
                          </p>
                        )}
                        <div className="clear-my-mind-result-item__actions">
                          {editingId === entry.id ? (
                            <button
                              type="button"
                              onClick={() => saveEdit(entry.id)}
                              className="clear-my-mind-result-item__btn"
                            >
                              Save
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => startEdit(entry)}
                              className="clear-my-mind-result-item__btn"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            type="button"
                            className="clear-my-mind-result-item__btn"
                            data-testid={`cmm-item-actions-${entry.id}`}
                            onClick={() =>
                              setActionEntryId((id) =>
                                id === entry.id ? null : entry.id,
                              )
                            }
                          >
                            Actions
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              updateBrainDump(entry.id, {
                                done: true,
                                sorted: true,
                              });
                              onRefresh();
                            }}
                            className="clear-my-mind-result-item__btn"
                          >
                            Complete
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const minutes = window.prompt(
                                "Estimate minutes for this thought",
                                String(entry.estimateMin ?? 15),
                              );
                              if (!minutes) return;
                              const estimateMin = Number(minutes);
                              if (!Number.isFinite(estimateMin) || estimateMin < 0) {
                                return;
                              }
                              updateBrainDump(entry.id, {
                                estimateMin,
                                sorted: true,
                              });
                              onRefresh();
                            }}
                            className="clear-my-mind-result-item__btn"
                          >
                            Time
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteBrainDump(entry.id);
                              onRefresh();
                            }}
                            className="clear-my-mind-result-item__btn"
                          >
                            Delete
                          </button>
                          {entry.text.includes("\n") ? (
                            <button
                              type="button"
                              onClick={() => splitEntry(entry)}
                              className="clear-my-mind-result-item__btn"
                            >
                              Split
                            </button>
                          ) : null}
                          {index < bucket.entries.length - 1 ? (
                            <button
                              type="button"
                              onClick={() =>
                                combineEntries(entry, bucket.entries[index + 1]!)
                              }
                              className="clear-my-mind-result-item__btn"
                            >
                              Combine with next
                            </button>
                          ) : null}
                          <label className="clear-my-mind-result-item__move">
                            <span className="sr-only">Move to</span>
                            <select
                              value={bucket.id}
                              onChange={(e) =>
                                moveEntry(
                                  entry.id,
                                  e.target.value as ClearMyMindResultBucketId,
                                )
                              }
                              className="clear-my-mind-result-item__select"
                            >
                              {CLEAR_MY_MIND_RESULT_BUCKETS.map((b) => (
                                <option key={b.id} value={b.id}>
                                  Move to {customLabels[b.id] ?? b.label}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                        {actionEntryId === entry.id ? (
                          <ThoughtActionSheet
                            entry={entry}
                            onAction={(action) => runThoughtAction(entry, action)}
                            onCategoryChange={(category) => {
                              updateBrainDump(entry.id, {
                                category,
                                topic: category,
                              });
                              onRefresh();
                            }}
                          />
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </section>
          );
        })}
      </div>

      {onOpenVisualThinking ? (
        <button
          type="button"
          className="clear-my-mind-visual-offer"
          data-testid="clear-my-mind-visual-offer"
          onClick={() => {
            setClearMyMindModePhase("visual");
            onOpenVisualThinking();
          }}
        >
          {CLEAR_MY_MIND_VISUAL_OFFER}
        </button>
      ) : null}

      {showSessionEnd ? (
        <ClearMyMindSessionEnd
          summary={{
            itemsCaptured: entries.length,
            projectsCreated: 0,
            calendarItems: 0,
            waitingItems,
            parkingLotItems,
            referenceItems,
          }}
          onContinue={() => setClearMyMindModePhase("capture")}
          onReturnHome={() => {
            setClearMyMindModePhase("session-end");
            onReturnHome?.();
          }}
          onSaveForLater={() => {
            setClearMyMindModePhase("session-end");
            onReturnHome?.();
          }}
        />
      ) : null}
    </div>
  );
}
