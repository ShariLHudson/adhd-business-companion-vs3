"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { BusinessEstateSectionId } from "@/lib/profile/businessEstateProfile";
import {
  BUSINESS_ESTATE_SECTION_FIELDS,
  fieldDisplayLabel,
} from "@/lib/profile/businessEstateSectionFields";
import {
  fieldPathHasValue,
  listAreaStageStatuses,
} from "@/lib/profile/guidedStageCompletion";
import { resolveConditionalOfferFields } from "@/lib/profile/guidedStageRegistry";
import type { GuidedStageAreaId } from "@/lib/profile/guidedStageTypes";

type Props = {
  areaId: GuidedStageAreaId;
  values: Record<string, string>;
  /** Which stage card is expanded — only one at a time. Null = all closed. */
  activeStageId?: string | null;
  onSelectStage: (stageId: string) => void;
  /**
   * Working experience for the expanded stage (fields, help, voice).
   * Rendered inside the open accordion card — not a separate Working Area.
   */
  expandedContent?: ReactNode;
  /** Save / Continue controls inside the open card */
  expandedFooter?: ReactNode;
};

function labelForPath(areaId: GuidedStageAreaId, path: string): string {
  if (path === "people-i-help.link") return "People I Help";
  const dot = path.indexOf(".");
  const key = dot >= 0 ? path.slice(dot + 1) : path;
  if (areaId === "people-i-help") return key;
  const sectionId = areaId as BusinessEstateSectionId;
  const field = BUSINESS_ESTATE_SECTION_FIELDS[sectionId]?.find(
    (item) => item.key === key,
  );
  return field ? fieldDisplayLabel(sectionId, field) : key;
}

function pathsForStage(
  areaId: GuidedStageAreaId,
  stageId: string,
  fieldPaths: readonly string[],
  values: Record<string, string>,
): readonly string[] {
  if (stageId === "offers-future" && areaId === "offers") {
    return [...fieldPaths, ...resolveConditionalOfferFields(values)];
  }
  return fieldPaths;
}

/**
 * Business Estate stage accordion — Progress Overview IS the editor.
 * One section open at a time; fields and help live inside the open card.
 */
export function BusinessEstateProgressOverview({
  areaId,
  values,
  activeStageId = null,
  onSelectStage,
  expandedContent = null,
  expandedFooter = null,
}: Props) {
  const stageStatuses = listAreaStageStatuses(areaId, values);
  const openCardRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    if (!activeStageId || !expandedContent) return;
    const node = openCardRef.current;
    if (node && typeof node.scrollIntoView === "function") {
      node.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeStageId, expandedContent]);

  return (
    <section
      className="business-estate-progress business-estate-progress--accordion"
      aria-label="Business profile sections"
      data-testid="business-estate-progress-overview"
      data-accordion="true"
    >
      <ul className="business-estate-progress__list" role="list">
        {stageStatuses.map(({ stage, label }) => {
          const paths = pathsForStage(
            areaId,
            stage.id,
            stage.fieldPaths,
            values,
          );
          const open =
            Boolean(expandedContent) && activeStageId === stage.id;

          return (
            <li
              key={stage.id}
              ref={open ? openCardRef : undefined}
              className={`business-estate-progress__item${
                open ? " business-estate-progress__item--open" : ""
              }`}
              data-testid={`business-estate-progress-item-${stage.id}`}
              data-open={open ? "true" : "false"}
            >
              <div
                className={`business-estate-progress__card${
                  open ? " business-estate-progress__card--open" : ""
                }${
                  stage.optional
                    ? " business-estate-progress__card--optional"
                    : ""
                }`}
              >
                <button
                  type="button"
                  className="business-estate-progress__toggle"
                  onClick={() => onSelectStage(stage.id)}
                  aria-expanded={open}
                  aria-controls={`business-estate-stage-panel-${stage.id}`}
                  data-testid={`business-estate-progress-stage-${stage.id}`}
                >
                  <div className="business-estate-progress__card-head">
                    <span className="business-estate-progress__stage-title">
                      {stage.title}
                      {stage.optional ? (
                        <span className="business-estate-progress__optional">
                          Optional
                        </span>
                      ) : null}
                    </span>
                    <span className="business-estate-progress__stage-status">
                      {label}
                    </span>
                    <span
                      className="business-estate-progress__chevron"
                      aria-hidden="true"
                    >
                      {open ? "−" : "+"}
                    </span>
                  </div>
                  {!open ? (
                    <ul className="business-estate-progress__fields">
                      {paths.map((path) => {
                        const filled = fieldPathHasValue(path, values);
                        return (
                          <li
                            key={path}
                            className={`business-estate-progress__field${
                              filled
                                ? " business-estate-progress__field--done"
                                : ""
                            }`}
                          >
                            <span aria-hidden="true">
                              {filled ? "✓" : "○"}
                            </span>
                            <span>{labelForPath(areaId, path)}</span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </button>

                {open ? (
                  <div
                    id={`business-estate-stage-panel-${stage.id}`}
                    className="business-estate-progress__panel"
                    data-testid={`business-estate-stage-panel-${stage.id}`}
                    role="region"
                    aria-label={stage.title}
                  >
                    <p className="business-estate-progress__stage-desc">
                      {stage.description}
                    </p>
                    <div className="business-estate-progress__working">
                      {expandedContent}
                    </div>
                    {expandedFooter ? (
                      <div className="business-estate-progress__footer">
                        {expandedFooter}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
