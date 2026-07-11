"use client";

import { useMemo, useState } from "react";
import type { BrainDumpEntry } from "@/lib/companionStore";
import { updateBrainDump } from "@/lib/companionStore";
import { analyzeClearMyMindWorkspace } from "@/lib/clearMyMindWorkspaceIntelligence";
import { applyThoughtAction } from "@/lib/thoughtActions";

type Props = {
  entries: BrainDumpEntry[];
  onRefresh: () => void;
  onBack: () => void;
  /** Optional: open Plan My Day after applying Do Now / Today. */
  onOpenPlanMyDay?: () => void;
};

const PRIORITY_ACTIONS = [
  { id: "do-now", label: "Do Now", action: "do-now" as const },
  { id: "today", label: "Today", action: "today" as const },
  { id: "this-week", label: "This Week", action: "this-week" as const },
] as const;

/**
 * Prioritize — Spark recommends what deserves attention first.
 * Member can accept the recommendation or override per thought.
 */
export function ClearMyMindSessionPrioritize({
  entries,
  onRefresh,
  onBack,
  onOpenPlanMyDay,
}: Props) {
  const analysis = useMemo(
    () => analyzeClearMyMindWorkspace(entries),
    [entries],
  );
  const [ack, setAck] = useState<string | null>(null);

  const ordered = useMemo(() => {
    const byId = new Map(entries.map((e) => [e.id, e]));
    const list = analysis.priorityOrder
      .map((id) => byId.get(id))
      .filter((e): e is BrainDumpEntry => Boolean(e));
    for (const entry of entries) {
      if (!list.some((e) => e.id === entry.id)) list.push(entry);
    }
    return list;
  }, [entries, analysis.priorityOrder]);

  const top = ordered[0] ?? null;

  function acceptRecommendation() {
    if (!top) return;
    const result = applyThoughtAction(top, "do-now");
    updateBrainDump(top.id, {
      category: "Do Now",
      schedulingIntent: "do-now",
      sorted: true,
    });
    onRefresh();
    setAck(
      result.ok
        ? `Recommended first: “${top.text.slice(0, 60)}${top.text.length > 60 ? "…" : ""}” — added to Plan My Day.`
        : result.headline,
    );
    onOpenPlanMyDay?.();
  }

  return (
    <section
      className="clear-my-mind-session-tool"
      data-testid="clear-my-mind-session-prioritize"
    >
      <div className="clear-my-mind-session-tool__nav">
        <button type="button" onClick={onBack} data-testid="cmm-prioritize-back">
          ← Back
        </button>
        <h2>Prioritize</h2>
      </div>

      <div className="clear-my-mind-session-tool__spark" role="status">
        <p className="clear-my-mind-session-tool__hint">
          {analysis.priorityHeadline}
        </p>
        {top ? (
          <button
            type="button"
            className="clear-my-mind-session-tool__primary"
            data-testid="cmm-prioritize-accept"
            onClick={acceptRecommendation}
          >
            Start with this thought
          </button>
        ) : null}
      </div>

      {ack ? (
        <p className="clear-my-mind-session-tool__ack" role="status">
          {ack}
        </p>
      ) : null}

      <ul className="clear-my-mind-session-tool__list">
        {ordered.map((entry, index) => (
          <li key={entry.id}>
            <p>
              {index === 0 ? (
                <span className="clear-my-mind-session-tool__badge">Suggested first</span>
              ) : null}
              {entry.text}
            </p>
            {entry.category ? (
              <p className="clear-my-mind-session-tool__meta">{entry.category}</p>
            ) : null}
            <div className="clear-my-mind-session-tool__row-actions">
              {PRIORITY_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => {
                    applyThoughtAction(entry, action.action);
                    updateBrainDump(entry.id, {
                      category: action.label,
                      schedulingIntent: action.id,
                      sorted: true,
                    });
                    onRefresh();
                    setAck(`Marked “${action.label}.”`);
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
