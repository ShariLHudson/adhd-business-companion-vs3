"use client";

import { useMemo, useState } from "react";
import type { BrainDumpEntry } from "@/lib/companionStore";
import { updateBrainDump } from "@/lib/companionStore";
import {
  applyThoughtAction,
  type ThoughtAction,
} from "@/lib/thoughtActions";
import { ThoughtActionSheet } from "@/components/companion/ThoughtActionSheet";
import { analyzeClearMyMindWorkspace } from "@/lib/clearMyMindWorkspaceIntelligence";
import type { AppSection } from "@/lib/companionUi";

type Props = {
  entries: BrainDumpEntry[];
  onRefresh: () => void;
  onBack: () => void;
  onOpen?: (section: AppSection) => void;
};

const CREATE_SHORTCUTS: {
  id: string;
  label: string;
  action: ThoughtAction;
  hint: string;
}[] = [
  {
    id: "project",
    label: "Project",
    action: "move-to-project",
    hint: "Turn into a Project",
  },
  {
    id: "task",
    label: "Task / Plan My Day",
    action: "today",
    hint: "Add to today's plan",
  },
  {
    id: "calendar",
    label: "Calendar",
    action: "add-to-calendar",
    hint: "Add to Time Bank",
  },
  {
    id: "decision",
    label: "Decision",
    action: "decision",
    hint: "Open Decision Compass",
  },
  {
    id: "journal",
    label: "Journal",
    action: "journal",
    hint: "Write it into your journal",
  },
  {
    id: "reminder",
    label: "Reminder",
    action: "schedule",
    hint: "Save as a reminder",
  },
  {
    id: "workflow",
    label: "Workflow",
    action: "workflow",
    hint: "Start a Create workflow",
  },
];

/**
 * Create — turn thoughts into Projects, Tasks, Calendar, Decisions,
 * Workflows, Journals, and Reminders. Spark suggests a starting thought.
 */
export function ClearMyMindSessionConvert({
  entries,
  onRefresh,
  onBack,
  onOpen,
}: Props) {
  const analysis = useMemo(
    () => analyzeClearMyMindWorkspace(entries),
    [entries],
  );
  const suggestedId = analysis.priorityOrder[0] ?? entries[0]?.id ?? null;
  const [activeId, setActiveId] = useState<string | null>(suggestedId);
  const [ack, setAck] = useState<string | null>(null);
  const active = entries.find((e) => e.id === activeId) ?? entries[0] ?? null;

  function handleAction(entry: BrainDumpEntry, action: ThoughtAction) {
    const result = applyThoughtAction(entry, action);
    updateBrainDump(entry.id, { sorted: true });
    onRefresh();
    setAck(result.ok ? result.headline : result.headline || "Updated.");
    if (result.ok && result.opensSection && onOpen) {
      onOpen(result.opensSection);
    }
  }

  return (
    <section
      className="clear-my-mind-session-tool"
      data-testid="clear-my-mind-session-convert"
    >
      <div className="clear-my-mind-session-tool__nav">
        <button type="button" onClick={onBack} data-testid="cmm-convert-back">
          ← Back
        </button>
        <h2>Create</h2>
      </div>

      <p className="clear-my-mind-session-tool__hint">
        Turn a thought into a Project, Task, Calendar item, Decision, Workflow,
        Journal entry, or Reminder — Spark will do the work when you choose.
      </p>

      {analysis.priorityHeadline ? (
        <p className="clear-my-mind-session-tool__spark" role="status">
          {analysis.priorityHeadline}
        </p>
      ) : null}

      {ack ? (
        <p className="clear-my-mind-session-tool__ack" role="status">
          {ack}
        </p>
      ) : null}

      <ul className="clear-my-mind-session-tool__picker">
        {entries.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              className={
                entry.id === active?.id
                  ? "clear-my-mind-session-tool__pick is-active"
                  : "clear-my-mind-session-tool__pick"
              }
              onClick={() => {
                setActiveId(entry.id);
                setAck(null);
              }}
            >
              {entry.id === suggestedId ? (
                <span className="clear-my-mind-session-tool__badge">Suggested</span>
              ) : null}
              {entry.text}
            </button>
          </li>
        ))}
      </ul>

      {active ? (
        <>
          <div className="clear-my-mind-session-tool__create-grid">
            {CREATE_SHORTCUTS.map((shortcut) => (
              <button
                key={shortcut.id}
                type="button"
                className="clear-my-mind-session-tool__create-btn"
                data-testid={`cmm-create-${shortcut.id}`}
                onClick={() => handleAction(active, shortcut.action)}
              >
                <span className="clear-my-mind-session-tool__create-label">
                  {shortcut.label}
                </span>
                <span className="clear-my-mind-session-tool__create-hint">
                  {shortcut.hint}
                </span>
              </button>
            ))}
          </div>
          <ThoughtActionSheet
            entry={active}
            onAction={(action) => handleAction(active, action)}
            onCategoryChange={(category) => {
              updateBrainDump(active.id, { category, sorted: true });
              onRefresh();
              setAck(`Moved to ${category}.`);
            }}
          />
        </>
      ) : (
        <p className="clear-my-mind-session-tool__empty">
          Capture a few thoughts first, then create from them here.
        </p>
      )}
    </section>
  );
}
