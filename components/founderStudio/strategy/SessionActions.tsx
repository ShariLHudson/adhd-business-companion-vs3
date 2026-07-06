"use client";

import type { StrategySessionMeta } from "@/lib/founder/strategyCenter/types";

type SessionActionsProps = {
  savedSessions: StrategySessionMeta[];
  sessionTitle: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onResume: (id: string) => void;
  onDuplicate: () => void;
  onArchive: () => void;
  statusMessage: string | null;
};

function formatSavedWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function SessionActions({
  savedSessions,
  sessionTitle,
  onTitleChange,
  onSave,
  onResume,
  onDuplicate,
  onArchive,
  statusMessage,
}: SessionActionsProps) {
  return (
    <section className="strategy-sessions" aria-labelledby="strategy-sessions-heading">
      <h2 className="strategy-sessions__heading" id="strategy-sessions-heading">
        Strategy Session
      </h2>

      <label className="strategy-sessions__title-field">
        <span>Session Title</span>
        <input
          value={sessionTitle}
          onChange={(event) => onTitleChange(event.target.value)}
          aria-label="Strategy session title"
        />
      </label>

      <div className="strategy-sessions__actions">
        <button type="button" className="strategy-sessions__primary" onClick={onSave}>
          Save Strategy Session
        </button>
        <button type="button" className="strategy-sessions__secondary" onClick={onDuplicate}>
          Duplicate Session
        </button>
        <button type="button" className="strategy-sessions__secondary" onClick={onArchive}>
          Archive Session
        </button>
      </div>

      {statusMessage ? (
        <p className="strategy-sessions__status" role="status">
          {statusMessage}
        </p>
      ) : null}

      {savedSessions.length > 0 ? (
        <div className="strategy-sessions__saved">
          <p className="strategy-sessions__saved-label">Resume Later</p>
          <ul className="strategy-sessions__list">
            {savedSessions.map((session) => (
              <li key={session.id}>
                <button
                  type="button"
                  className="strategy-sessions__resume"
                  onClick={() => onResume(session.id)}
                >
                  <span>{session.title}</span>
                  <span>{formatSavedWhen(session.updatedAt)}</span>
                  {session.archived ? <span className="strategy-sessions__archived">Archived</span> : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
