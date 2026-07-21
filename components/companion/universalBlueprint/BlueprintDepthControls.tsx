"use client";

import { useState } from "react";
import {
  depthModeMemberLabel,
  previewDepthChange,
} from "@/lib/universalBlueprintInterface";
import {
  ALL_BLUEPRINT_DEPTH_MODES,
  changeBlueprintDepthMode,
  getWorkBlueprintState,
  type BlueprintDepthMode,
} from "@/lib/universalWorkEngine";

type Props = {
  workId: string;
  onChanged?: (depthMode: BlueprintDepthMode, workId: string) => void;
};

const LABELS: Record<BlueprintDepthMode, string> = {
  quick_start: "Quick Start",
  guided_build: "Guided Build",
  complete_planning: "Complete Planning",
};

/**
 * Change depth without creating duplicate Work — preview first.
 */
export function BlueprintDepthControls({ workId, onChanged }: Props) {
  const state = getWorkBlueprintState(workId);
  const [pending, setPending] = useState<BlueprintDepthMode | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!state) return null;

  const preview = pending
    ? (() => {
        try {
          return previewDepthChange(workId, pending);
        } catch (err) {
          return {
            error:
              err instanceof Error
                ? err.message
                : "I couldn’t preview that depth change.",
          };
        }
      })()
    : null;

  return (
    <section
      className="ubi-root"
      data-testid="ubi-depth-controls"
      aria-labelledby="ubi-depth-heading"
    >
      <h3 id="ubi-depth-heading" className="text-lg">
        Planning depth
      </h3>
      <p className="ubi-muted mt-1">
        Current: {LABELS[state.depthMode]}. Changing depth keeps the same work
        and your answers.
      </p>
      <div className="ubi-chip-row mt-3">
        {ALL_BLUEPRINT_DEPTH_MODES.map((mode) => (
          <button
            key={mode}
            type="button"
            className="ubi-chip"
            aria-pressed={state.depthMode === mode}
            data-testid={`ubi-depth-control-${mode}`}
            onClick={() => {
              setError(null);
              setNote(null);
              if (mode === state.depthMode) {
                setPending(null);
                return;
              }
              setPending(mode);
            }}
          >
            {LABELS[mode]}
          </button>
        ))}
      </div>

      {preview && "error" in preview ? (
        <p className="ubi-error" role="alert">
          {preview.error}
        </p>
      ) : null}

      {preview && !("error" in preview) ? (
        <div className="ubi-panel mt-3" data-testid="ubi-depth-preview">
          <p className="text-sm font-semibold">
            Switch to {LABELS[preview.to]}?
          </p>
          <p className="ubi-muted mt-1">
            {depthModeMemberLabel(preview.to)} Same Work ID. Your entered
            content stays.
          </p>
          {preview.sectionsAdded.length > 0 ? (
            <p className="mt-2 text-sm">
              Newly available: {preview.sectionsAdded.slice(0, 5).join(" · ")}
              {preview.sectionsAdded.length > 5
                ? ` · +${preview.sectionsAdded.length - 5} more`
                : ""}
            </p>
          ) : (
            <p className="mt-2 text-sm">No new sections — mostly guidance depth.</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="ubi-primary"
              data-testid="ubi-depth-confirm"
              onClick={() => {
                try {
                  const next = changeBlueprintDepthMode(workId, preview.to);
                  setPending(null);
                  setNote(`Depth updated — still working on ${next.workId}.`);
                  onChanged?.(next.depthMode, next.workId);
                } catch (err) {
                  setError(
                    err instanceof Error
                      ? err.message
                      : "I couldn’t change depth just now.",
                  );
                }
              }}
            >
              Confirm depth change
            </button>
            <button
              type="button"
              className="ubi-secondary"
              onClick={() => setPending(null)}
            >
              Keep current
            </button>
          </div>
        </div>
      ) : null}

      {note ? (
        <p className="ubi-status" data-testid="ubi-depth-note">
          {note}
        </p>
      ) : null}
      {error ? (
        <p className="ubi-error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
