"use client";

import { useMemo } from "react";
import {
  buildMemberBlueprintPreview,
  depthModeMemberLabel,
} from "@/lib/universalBlueprintInterface";
import type { BlueprintDepthMode } from "@/lib/universalWorkEngine";

type Props = {
  blueprintId: string;
  version?: string | null;
  selectedDepth: BlueprintDepthMode;
  onDepthChange: (mode: BlueprintDepthMode) => void;
  onContinue: () => void;
  onBack?: () => void;
  error?: string | null;
};

/**
 * Plain-language Blueprint preview before initialization.
 */
export function UniversalBlueprintPreview({
  blueprintId,
  version,
  selectedDepth,
  onDepthChange,
  onContinue,
  onBack,
  error,
}: Props) {
  const preview = useMemo(() => {
    try {
      return buildMemberBlueprintPreview(blueprintId, version);
    } catch {
      return null;
    }
  }, [blueprintId, version]);

  if (!preview) {
    return (
      <section className="ubi-root" data-testid="universal-blueprint-preview">
        <p className="ubi-error" role="alert">
          I couldn’t open that Blueprint. It may be unknown or no longer
          available — please choose another.
        </p>
        {onBack ? (
          <button type="button" className="ubi-secondary mt-3" onClick={onBack}>
            Back to Blueprints
          </button>
        ) : null}
      </section>
    );
  }

  return (
    <section
      className="ubi-root"
      data-testid="universal-blueprint-preview"
      aria-labelledby="ubi-preview-heading"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="ubi-preview-heading" className="text-xl">
            {preview.title}
          </h2>
          <p className="ubi-muted mt-1">{preview.helpsCreate}</p>
        </div>
        {onBack ? (
          <button
            type="button"
            className="ubi-secondary"
            onClick={onBack}
            data-testid="ubi-preview-back"
          >
            Back
          </button>
        ) : null}
      </div>

      <div className="ubi-panel mt-4 space-y-3 text-sm leading-relaxed">
        <p>
          <strong>Who it’s for:</strong> {preview.whoItIsFor}
        </p>
        <p>
          <strong>Level of detail:</strong> {preview.detailLevel}
        </p>
        <div>
          <strong>Major sections</strong>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {preview.majorSections.slice(0, 8).map((s) => (
              <li key={s}>{s}</li>
            ))}
            {preview.majorSections.length > 8 ? (
              <li>…and {preview.majorSections.length - 8} more</li>
            ) : null}
          </ul>
        </div>
        {preview.likelyDeliverables.length > 0 ? (
          <p>
            <strong>Likely deliverables:</strong>{" "}
            {preview.likelyDeliverables.slice(0, 5).join(" · ")}
          </p>
        ) : null}
        {preview.commonlyForgotten.length > 0 ? (
          <p>
            <strong>Helps you remember:</strong>{" "}
            {preview.commonlyForgotten.slice(0, 4).join(" · ")}
          </p>
        ) : null}
        {preview.createsOrConnectsProject ? (
          <p>Can create or connect a Project when you’re ready.</p>
        ) : null}
        {(preview.chamberSupport.length > 0 ||
          preview.boardSupport.length > 0 ||
          preview.researchSupport.length > 0) && (
          <p className="ubi-muted">
            Support available from Chamber, Board, research, and Cartography as
            you go.
          </p>
        )}
      </div>

      <fieldset className="mt-4">
        <legend className="text-sm font-semibold">How deep to start</legend>
        <div className="ubi-path-grid mt-2">
          {preview.availableDepthModes.map((mode) => (
            <button
              key={mode}
              type="button"
              className="ubi-path-btn"
              data-primary={selectedDepth === mode ? "true" : "false"}
              data-testid={`ubi-depth-${mode}`}
              aria-pressed={selectedDepth === mode}
              onClick={() => onDepthChange(mode)}
            >
              <span className="ubi-path-btn__title">
                {mode === "quick_start"
                  ? "Quick Start"
                  : mode === "guided_build"
                    ? "Guided Build"
                    : "Complete Planning"}
              </span>
              <span className="ubi-path-btn__hint">
                {depthModeMemberLabel(mode)}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      {error ? (
        <p className="ubi-error" role="alert" data-testid="ubi-preview-error">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        className="ubi-primary mt-4 w-full"
        data-testid="ubi-preview-continue"
        onClick={onContinue}
      >
        Continue with this Blueprint
      </button>
    </section>
  );
}
