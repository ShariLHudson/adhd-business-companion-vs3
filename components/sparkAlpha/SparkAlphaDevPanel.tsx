"use client";

import type { SparkAlphaDevPanelState } from "@/lib/sparkAlpha/types";

type Props = {
  open: boolean;
  onClose: () => void;
  state: SparkAlphaDevPanelState;
};

export function SparkAlphaDevPanel({ open, onClose, state }: Props) {
  if (!open) return null;

  return (
    <aside className="spark-alpha-dev" aria-label="Spark Alpha developer panel">
      <header className="spark-alpha-dev__header">
        <h2>Spark Alpha™ — Dev</h2>
        <button type="button" onClick={onClose} aria-label="Close panel">
          ×
        </button>
      </header>

      <section>
        <h3>Conversation Intent</h3>
        <p>{state.intent}</p>
      </section>

      <section>
        <h3>Confidence</h3>
        <p>{state.confidence}</p>
      </section>

      <section>
        <h3>Business Brain Loaded</h3>
        <ul>
          {state.brainLoaded.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Modules Loaded</h3>
        <ul>
          {state.modulesLoaded.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Wisdom Loop (Specs 120–130)</h3>
        <p>Member need: {state.memberNeedPrimary ?? "—"}</p>
        <p>Hoped success: {state.outcomeSummary ?? "—"}</p>
        <p>Hidden intent: {state.hiddenIntentSummary ?? "None detected"}</p>
        {state.wisdomLoopSummaries.length > 0 && (
          <ul>
            {state.wisdomLoopSummaries.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3>Research Prepared</h3>
        <p>{state.researchPrepared ? "Yes" : "No"}</p>
      </section>

      <section>
        <h3>Hidden Work — Completed</h3>
        <ul>
          {state.hiddenWorkCompleted.map((e) => (
            <li key={e.id}>
              {e.summary}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Hidden Work — Prepared</h3>
        <ul>
          {state.hiddenWorkPrepared.map((e) => (
            <li key={e.id}>
              {e.summary}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Suggestions Withheld</h3>
        <ul>
          {state.suggestionsWithheld.map((e) => (
            <li key={e.id}>
              {e.summary}
              {e.reason ? ` — ${e.reason}` : ""}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Permission Required</h3>
        <ul>
          {state.permissionRequired.length === 0 ? (
            <li>None pending</li>
          ) : (
            state.permissionRequired.map((p) => <li key={p}>{p}</li>)
          )}
        </ul>
      </section>

      <section>
        <h3>Environment Score</h3>
        <p>
          Conservatory: {state.environmentScore}/10
        </p>
      </section>

      <p className="spark-alpha-dev__hint">Ctrl+Shift+D to toggle · Members never see this</p>
    </aside>
  );
}
