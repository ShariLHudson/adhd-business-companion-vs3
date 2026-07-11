"use client";

import {
  VISUALIZE_THIS_LABEL,
  type SparkVisualEngineOpenRequest,
} from "@/lib/sparkVisualEngine/openSparkVisualEngine";

/**
 * Shared Visualize This control (#184).
 * Experiences pass context; Universal Access opens the engine — no room lock.
 */
export function VisualizeThisButton({
  onVisualize,
  request,
  className,
  label = VISUALIZE_THIS_LABEL,
}: {
  onVisualize: (request: SparkVisualEngineOpenRequest) => void;
  request: SparkVisualEngineOpenRequest;
  className?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      className={
        className ??
        "rounded-md border border-[color:var(--companion-border,rgba(0,0,0,0.12))] bg-transparent px-3 py-1.5 text-sm text-[color:var(--companion-fg,inherit)] hover:bg-[color:var(--companion-muted,rgba(0,0,0,0.04))]"
      }
      onClick={() => onVisualize(request)}
    >
      {label}
    </button>
  );
}
