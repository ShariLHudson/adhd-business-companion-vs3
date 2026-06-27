"use client";

import { useMemo, useState } from "react";
import type { BrainDumpEntry } from "@/lib/companionStore";
import { deleteBrainDump, updateBrainDump, addBrainDump } from "@/lib/companionStore";
import {
  CLEAR_MY_MIND_RESULT_BUCKETS,
  groupEntriesIntoResultBuckets,
  type ClearMyMindResultBucketId,
} from "@/lib/clearMyMindResultBuckets";

type Props = {
  entries: BrainDumpEntry[];
  onRefresh: () => void;
};

export function ClearMyMindResultsWorkspace({ entries, onRefresh }: Props) {
  const buckets = useMemo(() => groupEntriesIntoResultBuckets(entries), [entries]);
  const [collapsed, setCollapsed] = useState<Set<ClearMyMindResultBucketId>>(
    () => new Set(),
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  if (buckets.length === 0) return null;

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
      CLEAR_MY_MIND_RESULT_BUCKETS.find((b) => b.id === bucketId)?.label ?? bucketId;
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

  return (
    <div className="clear-my-mind-results" data-testid="clear-my-mind-results">
      <div className="clear-my-mind-results__grid">
        {buckets.map((bucket) => {
          const isCollapsed = collapsed.has(bucket.id);
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
                <span className="clear-my-mind-result-card__title">{bucket.label}</span>
                <span className="clear-my-mind-result-card__count">
                  {bucket.entries.length}
                </span>
                <span aria-hidden="true">{isCollapsed ? "▸" : "▾"}</span>
              </button>
              {!isCollapsed ? (
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
                        <p className="clear-my-mind-result-item__text">{entry.text}</p>
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
                            onClick={() => combineEntries(entry, bucket.entries[index + 1]!)}
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
                              moveEntry(entry.id, e.target.value as ClearMyMindResultBucketId)
                            }
                            className="clear-my-mind-result-item__select"
                          >
                            {CLEAR_MY_MIND_RESULT_BUCKETS.map((b) => (
                              <option key={b.id} value={b.id}>
                                Move to {b.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
