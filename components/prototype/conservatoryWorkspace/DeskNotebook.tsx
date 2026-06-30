"use client";

import type { ConservatoryStage } from "./types";

type DeskNotebookProps = {
  stage: ConservatoryStage;
  onOpen: () => void;
};

export function DeskNotebook({ stage, onOpen }: DeskNotebookProps) {
  const closed = stage === "notebook-ready" || stage === "arrival";
  const opening = stage === "workspace-open" || stage === "closing";
  const hidden = stage === "complete";

  if (hidden) return null;

  return (
    <div className="cw-desk-scene">
      <div className="cw-desk-scene__shadow" aria-hidden />
      <div className="cw-desk-scene__objects" aria-hidden>
        <span className="cw-desk-scene__mug" />
        <span className="cw-desk-scene__pen" />
        <span className="cw-desk-scene__flowers" />
      </div>

      {closed && (
        <button
          type="button"
          className="cw-notebook cw-notebook--closed"
          onClick={onOpen}
          aria-label="Open notebook to begin"
        >
          <span className="cw-notebook__cover" />
          <span className="cw-notebook__spine" />
          <span className="cw-notebook__hint">Open notebook</span>
        </button>
      )}

      {opening && (
        <div
          className={`cw-notebook cw-notebook--opening${stage === "closing" ? " cw-notebook--closing" : ""}`}
          aria-hidden
        />
      )}
    </div>
  );
}
