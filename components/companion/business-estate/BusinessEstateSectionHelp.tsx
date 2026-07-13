"use client";

import {
  collectApprovedBusinessEstateContext,
  requestGuidedFieldHelp,
} from "@/lib/profile/guidedFieldHelp";
import { businessEstateFieldSupportsResearch } from "@/lib/profile/businessEstateSectionResearchSupport";
import type { GuidedStageDefinition } from "@/lib/profile/guidedStageTypes";
import type { GuidanceHelpMode } from "@/lib/profile/guidedFieldTypes";
import "../guided-stages/guidedStageWorkspace.css";

type Props = {
  stage: GuidedStageDefinition;
  /** Active field path e.g. offers.problemsSolved */
  fieldPath: string;
  fieldKey: string;
  /** Member-facing question / field label */
  question: string;
  currentValue: string;
  /** Kept for call-site compatibility; unused (drafts stay in parent state). */
  draftValues?: Record<string, string>;
};

/**
 * Section-scoped Shari help for Business Estate room chrome.
 * Help Me Answer / Research This open the existing companion chat via
 * requestGuidedFieldHelp → GUIDED_FIELD_HELP_EVENT (CompanionPageClient).
 */
export function BusinessEstateSectionHelp({
  stage,
  fieldPath,
  fieldKey,
  question,
  currentValue,
}: Props) {
  function fire(mode: GuidanceHelpMode) {
    const sectionId = fieldPath.includes(".")
      ? fieldPath.slice(0, fieldPath.indexOf("."))
      : stage.areaId;

    requestGuidedFieldHelp({
      sectionId,
      fieldKey,
      fieldPath,
      helpMode: mode,
      currentValue,
      approvedBusinessContext: collectApprovedBusinessEstateContext(),
      relatedFieldValues: {},
      question: `${stage.title} — ${question}`,
      definition: stage.description,
      guidedQuestions: [...stage.fieldPaths],
    });
  }

  return (
    <div
      className="business-estate-section-help"
      data-testid="business-estate-section-help"
      data-stage-id={stage.id}
      data-field-path={fieldPath}
    >
      <p className="business-estate-section-help__label">
        Help with {stage.title}
      </p>
      <div
        className="business-estate-section-help__actions"
        role="group"
        aria-label={`Help for ${stage.title}`}
      >
        <button
          type="button"
          className="guided-estate-field__help-btn"
          onClick={() => fire("help_me_develop")}
          data-testid="section-help-me-answer"
        >
          Help Me Answer
        </button>
        {businessEstateFieldSupportsResearch(fieldPath) ? (
          <button
            type="button"
            className="guided-estate-field__help-btn"
            onClick={() => fire("research_with_shari")}
            data-testid="section-research-this"
          >
            Research This
          </button>
        ) : null}
      </div>
      <p
        className="business-estate-section-help__hint"
        data-testid="business-estate-section-help-hint"
      >
        Shari will use this question and your current answer as context.
      </p>
    </div>
  );
}
