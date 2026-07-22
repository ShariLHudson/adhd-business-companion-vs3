"use client";

import type { CartographyMapDefinition } from "@/lib/cartographersStudio/mapDefinitions";
import type { VisualFocusMap } from "@/lib/visualFocus";

export function MapEntryPanel({
  definition,
  existingMaps,
  onBegin,
  onResearchBuild,
  onContinue,
  onViewMyMaps,
  onClose,
}: {
  definition: CartographyMapDefinition;
  existingMaps: VisualFocusMap[];
  onBegin: () => void;
  /** Research-assisted building — Spark researches and builds a first version. */
  onResearchBuild?: () => void;
  onContinue: (mapId: string) => void;
  onViewMyMaps: () => void;
  onClose: () => void;
}) {
  const drafts = existingMaps.filter(
    (m) =>
      m.mode === definition.visualFocusMode &&
      (m.lifecycleStatus === "draft" ||
        m.lifecycleStatus === "active" ||
        !m.lifecycleStatus) &&
      m.workflowStage !== "generated",
  );
  const latestDraft = drafts[0] ?? null;
  const hasAnyOfType = existingMaps.some(
    (m) => m.mode === definition.visualFocusMode,
  );

  return (
    <div
      className="cartographers-learn-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cartography-map-entry-title"
      data-testid="cartography-map-entry"
    >
      <div className="cartographers-map-entry">
        <button
          type="button"
          className="cartographers-map-entry__close"
          onClick={onClose}
          aria-label="Close"
        >
          Close
        </button>
        <h2
          id="cartography-map-entry-title"
          className="cartographers-map-entry__title"
        >
          {definition.name}
        </h2>
        <p className="cartographers-map-entry__body">
          {definition.shortDescription} {definition.whenUseful} At the end,
          you will have {definition.outcomeDescription.toLowerCase()}
        </p>
        <div className="cartographers-map-entry__actions">
          <button
            type="button"
            className="cartographers-map-entry__primary"
            data-testid="cartography-begin-my-map"
            onClick={onBegin}
          >
            Begin My Map
          </button>
          {onResearchBuild ? (
            <button
              type="button"
              className="cartographers-map-entry__secondary"
              data-testid="cartography-research-build"
              onClick={onResearchBuild}
            >
              I’m not sure — research &amp; build it with me
            </button>
          ) : null}
          {latestDraft ? (
            <button
              type="button"
              className="cartographers-map-entry__secondary"
              data-testid="cartography-continue-existing"
              onClick={() => onContinue(latestDraft.id)}
            >
              Continue Existing Map
            </button>
          ) : null}
          {hasAnyOfType ? (
            <button
              type="button"
              className="cartographers-map-entry__secondary"
              data-testid="cartography-view-my-maps"
              onClick={onViewMyMaps}
            >
              View My Maps
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
