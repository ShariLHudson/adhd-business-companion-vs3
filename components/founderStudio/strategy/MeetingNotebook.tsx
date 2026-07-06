"use client";

import type { StrategyMeetingNotes } from "@/lib/founder/strategyCenter/types";

type MeetingNotebookProps = {
  notes: StrategyMeetingNotes;
  onChange: (notes: StrategyMeetingNotes) => void;
};

export function MeetingNotebook({ notes, onChange }: MeetingNotebookProps) {
  return (
    <section className="strategy-notebook" aria-labelledby="strategy-notebook-heading">
      <h2 className="strategy-notebook__heading" id="strategy-notebook-heading">
        Executive Notebook
      </h2>

      <label className="strategy-notebook__field">
        <span>Session Notes</span>
        <textarea
          value={notes.richText}
          onChange={(event) => onChange({ ...notes, richText: event.target.value })}
          rows={4}
        />
      </label>

      <label className="strategy-notebook__field">
        <span>Bullets</span>
        <textarea
          value={notes.bullets.join("\n")}
          onChange={(event) =>
            onChange({
              ...notes,
              bullets: event.target.value.split("\n").filter(Boolean),
            })
          }
          rows={3}
          placeholder="One thought per line"
        />
      </label>

      <label className="strategy-notebook__field">
        <span>Quick Notes</span>
        <textarea
          value={notes.quickNotes}
          onChange={(event) => onChange({ ...notes, quickNotes: event.target.value })}
          rows={2}
        />
      </label>

      <label className="strategy-notebook__field">
        <span>Action Items</span>
        <textarea
          value={notes.actionItems.join("\n")}
          onChange={(event) =>
            onChange({
              ...notes,
              actionItems: event.target.value.split("\n").filter(Boolean),
            })
          }
          rows={2}
          placeholder="One action per line"
        />
      </label>

      <label className="strategy-notebook__field">
        <span>Decision Notes</span>
        <textarea
          value={notes.decisionNotes}
          onChange={(event) => onChange({ ...notes, decisionNotes: event.target.value })}
          rows={2}
        />
      </label>
    </section>
  );
}
