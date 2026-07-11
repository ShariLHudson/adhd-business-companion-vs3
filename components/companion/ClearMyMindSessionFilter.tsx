"use client";

import { useMemo, useState } from "react";
import type { BrainDumpEntry } from "@/lib/companionStore";
import { updateBrainDump } from "@/lib/companionStore";
import {
  applyThoughtFilter,
  applyThoughtView,
  THOUGHT_FILTER_OPTIONS,
  THOUGHT_VIEW_GROUPS,
  type ThoughtFilterId,
  type ThoughtViewMode,
} from "@/lib/thinkingSpace/thoughtViews";
import { ThoughtActionSheet } from "@/components/companion/ThoughtActionSheet";
import {
  applyThoughtAction,
  type ThoughtAction,
} from "@/lib/thoughtActions";
import {
  copyClearMyMindSessionList,
  printClearMyMindSessionList,
} from "@/lib/brainDumpCanvasExport";

type Props = {
  entries: BrainDumpEntry[];
  onRefresh: () => void;
  onBack: () => void;
};

/**
 * Filter session thoughts — stay inside Clear My Mind.
 */
export function ClearMyMindSessionFilter({
  entries,
  onRefresh,
  onBack,
}: Props) {
  const [view, setView] = useState<ThoughtViewMode>("recently-added");
  const [filter, setFilter] = useState<ThoughtFilterId>("all");
  const [query, setQuery] = useState("");
  const [actionEntryId, setActionEntryId] = useState<string | null>(null);
  const [exportAck, setExportAck] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const byView = applyThoughtView(entries, view);
    const byFilter = applyThoughtFilter(byView, filter);
    const q = query.trim().toLowerCase();
    if (!q) return byFilter;
    return byFilter.filter(
      (e) =>
        e.text.toLowerCase().includes(q) ||
        (e.category ?? "").toLowerCase().includes(q) ||
        (e.topic ?? "").toLowerCase().includes(q),
    );
  }, [entries, view, filter, query]);

  function runThoughtAction(entry: BrainDumpEntry, action: ThoughtAction) {
    const result = applyThoughtAction(entry, action);
    setExportAck(result.ok ? result.seeWhere || result.headline : result.headline);
    setActionEntryId(null);
    onRefresh();
  }

  return (
    <section
      className="clear-my-mind-session-tool"
      data-testid="clear-my-mind-session-filter"
    >
      <div className="clear-my-mind-session-tool__nav">
        <button type="button" onClick={onBack} data-testid="cmm-filter-back">
          ← Back
        </button>
        <h2>Filter</h2>
      </div>

      <div className="clear-my-mind-session-tool__controls">
        <label>
          Search
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search thoughts…"
            data-testid="cmm-filter-search"
          />
        </label>
        <label>
          Date / order
          <select
            value={view}
            onChange={(e) => setView(e.target.value as ThoughtViewMode)}
          >
            {THOUGHT_VIEW_GROUPS.flatMap((group) =>
              group.options.map((option) => (
                <option key={option.id} value={option.id}>
                  {group.label}: {option.label}
                </option>
              )),
            )}
          </select>
        </label>
        <label>
          Status / type
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as ThoughtFilterId)}
          >
            {THOUGHT_FILTER_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          data-testid="cmm-filter-print"
          onClick={() => {
            printClearMyMindSessionList(filtered);
            setExportAck("Print dialog opened.");
          }}
        >
          Print
        </button>
        <button
          type="button"
          data-testid="cmm-filter-copy"
          onClick={() => {
            void copyClearMyMindSessionList(filtered).then((ok) =>
              setExportAck(ok ? "Copied." : "Could not copy."),
            );
          }}
        >
          Copy
        </button>
      </div>

      {exportAck ? (
        <p className="clear-my-mind-capture-choice__ack" role="status">
          {exportAck}
        </p>
      ) : null}

      <p className="clear-my-mind-session-tool__count" role="status">
        {filtered.length} of {entries.length} thoughts
      </p>

      <ul className="clear-my-mind-session-tool__list">
        {filtered.map((entry) => (
          <li key={entry.id}>
            <p>{entry.text}</p>
            <div className="clear-my-mind-session-tool__row-actions">
              <button
                type="button"
                onClick={() =>
                  setActionEntryId((id) => (id === entry.id ? null : entry.id))
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
              >
                Mark complete
              </button>
              <button
                type="button"
                onClick={() => {
                  updateBrainDump(entry.id, {
                    category: "Waiting",
                    schedulingIntent: "waiting",
                  });
                  onRefresh();
                }}
              >
                Waiting
              </button>
              <button
                type="button"
                onClick={() => {
                  updateBrainDump(entry.id, {
                    category: "Someday",
                    schedulingIntent: "someday",
                  });
                  onRefresh();
                }}
              >
                Someday
              </button>
            </div>
            {actionEntryId === entry.id ? (
              <ThoughtActionSheet
                entry={entry}
                onAction={(action) => runThoughtAction(entry, action)}
                onCategoryChange={(category) => {
                  updateBrainDump(entry.id, { category, topic: category });
                  onRefresh();
                }}
              />
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
