"use client";

import { useState } from "react";
import {
  BLUEPRINT_LINK_MODE_EXPLANATIONS,
  proposeExternalLink,
  type BlueprintExternalLinkMode,
  type PendingExternalLinkProposal,
} from "@/lib/universalBlueprintInterface";
import {
  getBlueprint,
  initializeWorkFromBlueprint,
  linkWorkRelationship,
  listWorkBlueprintStates,
} from "@/lib/universalWorkEngine";

type Props = {
  blueprintId: string;
  onNavigate?: (hint: { kind: string; id: string }) => void;
};

/**
 * 106 — Calendar experience. Always ask before writing.
 */
export function BlueprintCalendarPanel({ blueprintId, onNavigate }: Props) {
  const [mode, setMode] = useState<BlueprintExternalLinkMode>("linked");
  const [eventId, setEventId] = useState("");
  const [title, setTitle] = useState("");
  const [pending, setPending] = useState<PendingExternalLinkProposal | null>(
    null,
  );
  const [status, setStatus] = useState<string | null>(null);

  const ensureWorkId = (): string => {
    const existing = listWorkBlueprintStates().find(
      (w) => w.blueprintId === blueprintId,
    );
    if (existing) return existing.workId;
    const bp = getBlueprint(blueprintId);
    const workTypeId = bp?.compatibleWorkTypeIds[0];
    if (!workTypeId) {
      throw new Error("This Blueprint needs a Work Type before calendar links.");
    }
    return initializeWorkFromBlueprint({
      blueprintId,
      workTypeId,
      origin: "blueprints",
    }).workId;
  };

  return (
    <section className="bp-exp-panel" data-testid="blueprint-calendar-panel">
      <h3 className="bp-exp-title">Calendar</h3>
      <p className="bp-exp-muted">
        Link, create, or note a milestone — Spark will ask before writing.
      </p>

      <fieldset className="bp-exp-fieldset">
        <legend>How should this connect?</legend>
        {(Object.keys(BLUEPRINT_LINK_MODE_EXPLANATIONS) as BlueprintExternalLinkMode[]).map(
          (m) => (
            <label key={m} className="bp-exp-radio">
              <input
                type="radio"
                name="cal-mode"
                checked={mode === m}
                onChange={() => setMode(m)}
              />
              <span>
                <strong>{m[0]!.toUpperCase() + m.slice(1)}</strong> —{" "}
                {BLUEPRINT_LINK_MODE_EXPLANATIONS[m]}
              </span>
            </label>
          ),
        )}
      </fieldset>

      <label className="bp-exp-label">
        Existing event id (optional)
        <input
          className="bp-exp-input"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          data-testid="calendar-event-id"
          placeholder="cal-…"
        />
      </label>
      <label className="bp-exp-label">
        Title for a new event / milestone / session
        <input
          className="bp-exp-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          data-testid="calendar-title"
          placeholder="Work session or due date label"
        />
      </label>

      <div className="bp-exp-actions">
        <button
          type="button"
          className="bp-exp-btn bp-exp-btn-primary"
          data-testid="calendar-propose"
          onClick={() => {
            const id =
              eventId.trim() ||
              `cal-${Date.now().toString(36)}`;
            setPending(
              proposeExternalLink({
                kind: "calendar",
                mode,
                targetId: id,
                title: title || "Calendar item",
              }),
            );
            setStatus(null);
          }}
        >
          Propose link
        </button>
      </div>

      {pending ? (
        <div
          className="bp-exp-confirm"
          data-testid="calendar-approval"
          role="alertdialog"
        >
          <p>
            Write this calendar connection as <strong>{pending.mode}</strong>?
          </p>
          <p className="bp-exp-muted">{pending.explanation}</p>
          <p>
            {pending.title} ({pending.targetId})
          </p>
          <button
            type="button"
            className="bp-exp-btn bp-exp-btn-primary"
            data-testid="calendar-approve"
            onClick={() => {
              try {
                const workId = ensureWorkId();
                linkWorkRelationship({
                  fromWorkId: workId,
                  toRef: { kind: "calendar-event", id: pending.targetId },
                  relationship: "related_to",
                  note: `${pending.mode}: ${pending.title}`,
                });
                setStatus(`Connected as ${pending.mode}.`);
                setPending(null);
                onNavigate?.({ kind: "calendar-event", id: pending.targetId });
              } catch (err) {
                setStatus(
                  err instanceof Error
                    ? err.message
                    : "I couldn’t write that calendar link.",
                );
              }
            }}
          >
            Yes, write it
          </button>
          <button
            type="button"
            className="bp-exp-btn"
            onClick={() => setPending(null)}
          >
            Not now
          </button>
        </div>
      ) : null}

      {status ? (
        <p className="bp-exp-status" role="status">
          {status}
        </p>
      ) : null}
    </section>
  );
}
