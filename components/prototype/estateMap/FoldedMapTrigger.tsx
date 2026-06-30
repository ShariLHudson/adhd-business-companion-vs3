"use client";

import type { EstateMapPhase } from "./types";

type FoldedMapTriggerProps = {
  phase: EstateMapPhase;
  onOpen: () => void;
};

export function FoldedMapTrigger({ phase, onOpen }: FoldedMapTriggerProps) {
  const hidden = phase !== "closed" && phase !== "closing";

  return (
    <button
      type="button"
      className={`em-folded${hidden ? " em-folded--hidden" : ""}${phase === "closing" ? " em-folded--returning" : ""}`}
      onClick={onOpen}
      aria-label="Unfold estate map"
      aria-expanded={phase === "open" || phase === "unfolding" || phase === "lifting"}
    >
      <span className="em-folded__stack" aria-hidden>
        <span className="em-folded__leaf em-folded__leaf--back" />
        <span className="em-folded__leaf em-folded__leaf--mid" />
        <span className="em-folded__leaf em-folded__leaf--front" />
      </span>
      <span className="em-folded__cord" aria-hidden />
    </button>
  );
}
