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
 * 106 — Visual Thinking experience. Relationships stay live after approve.
 */
export function BlueprintVisualThinkingPanel({
  blueprintId,
  onNavigate,
}: Props) {
  const [mode, setMode] = useState<BlueprintExternalLinkMode>("linked");
  const [mapId, setMapId] = useState("");
  const [pending, setPending] = useState<PendingExternalLinkProposal | null>(
    null,
  );
  const [status, setStatus] = useState<string | null>(null);
  const [focusSectionId, setFocusSectionId] = useState<string | null>(null);

  const bp = getBlueprint(blueprintId);
  const sections = (bp?.sections ?? []).filter((s) => !s.softDeleted);

  const ensureWorkId = (): string => {
    const existing = listWorkBlueprintStates().find(
      (w) => w.blueprintId === blueprintId,
    );
    if (existing) return existing.workId;
    const workTypeId = bp?.compatibleWorkTypeIds[0];
    if (!workTypeId) {
      throw new Error("This Blueprint needs a Work Type before visual maps.");
    }
    return initializeWorkFromBlueprint({
      blueprintId,
      workTypeId,
      origin: "blueprints",
    }).workId;
  };

  return (
    <section
      className="bp-exp-panel"
      data-testid="blueprint-visual-thinking-panel"
    >
      <h3 className="bp-exp-title">Visual Thinking</h3>
      <p className="bp-exp-muted">
        Create or link a visual map. You always choose Linked, Copied, or
        Snapshot before anything is written.
      </p>

      <fieldset className="bp-exp-fieldset">
        <legend>Connection type</legend>
        {(
          Object.keys(BLUEPRINT_LINK_MODE_EXPLANATIONS) as BlueprintExternalLinkMode[]
        ).map((m) => (
          <label key={m} className="bp-exp-radio">
            <input
              type="radio"
              name="vt-mode"
              checked={mode === m}
              onChange={() => setMode(m)}
            />
            <span>{BLUEPRINT_LINK_MODE_EXPLANATIONS[m]}</span>
          </label>
        ))}
      </fieldset>

      <label className="bp-exp-label">
        Existing map id (optional)
        <input
          className="bp-exp-input"
          value={mapId}
          onChange={(e) => setMapId(e.target.value)}
          data-testid="vt-map-id"
          placeholder="vt-…"
        />
      </label>

      <label className="bp-exp-label">
        Return to section (optional)
        <select
          className="bp-exp-input"
          data-testid="vt-return-section"
          value={focusSectionId ?? ""}
          onChange={(e) => setFocusSectionId(e.target.value || null)}
        >
          <option value="">Whole Blueprint</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        className="bp-exp-btn bp-exp-btn-primary"
        data-testid="vt-propose"
        onClick={() => {
          setPending(
            proposeExternalLink({
              kind: "visual_thinking",
              mode,
              targetId: mapId.trim() || `vt-${Date.now().toString(36)}`,
              title: focusSectionId
                ? `Map for ${focusSectionId}`
                : "Visual map",
            }),
          );
        }}
      >
        Propose map link
      </button>

      {pending ? (
        <div className="bp-exp-confirm" data-testid="vt-approval" role="alertdialog">
          <p>
            Write this visual map as <strong>{pending.mode}</strong>?
          </p>
          <p className="bp-exp-muted">{pending.explanation}</p>
          <button
            type="button"
            className="bp-exp-btn bp-exp-btn-primary"
            data-testid="vt-approve"
            onClick={() => {
              try {
                const workId = ensureWorkId();
                linkWorkRelationship({
                  fromWorkId: workId,
                  toRef: { kind: "visual-thinking", id: pending.targetId },
                  relationship: "visualizes",
                  note: `${pending.mode}${
                    focusSectionId ? ` · section ${focusSectionId}` : ""
                  }`,
                  sourceEntityType: focusSectionId ? "section" : "work",
                  sourceEntityId: focusSectionId ?? workId,
                });
                setStatus(
                  `Map ${pending.mode}. Return to ${
                    focusSectionId ?? "the Blueprint"
                  } anytime.`,
                );
                setPending(null);
                onNavigate?.({
                  kind: "visual-thinking",
                  id: pending.targetId,
                });
              } catch (err) {
                setStatus(
                  err instanceof Error
                    ? err.message
                    : "I couldn’t write that map link.",
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
