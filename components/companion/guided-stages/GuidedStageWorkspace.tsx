"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { GuidedEstateField } from "@/components/companion/business-estate/GuidedEstateField";
import { GuidedAssistanceBar } from "@/components/companion/GuidedAssistanceBar";
import { getPrimaryAvatar } from "@/lib/companionStore";
import type { BusinessEstateSectionId } from "@/lib/profile/businessEstateProfile";
import {
  BUSINESS_ESTATE_SECTION_FIELDS,
  fieldDisplayLabel,
} from "@/lib/profile/businessEstateSectionFields";
import {
  collectApprovedBusinessEstateContext,
  requestGuidedFieldHelp,
} from "@/lib/profile/guidedFieldHelp";
import { getGuidedFieldDef } from "@/lib/profile/guidedFieldRegistry";
import { businessEstateFieldSupportsResearch } from "@/lib/profile/businessEstateSectionResearchSupport";
import {
  deriveStageStatus,
  formatStageStatusLabel,
  isQuickStartSatisfied,
  listAreaStageStatuses,
  markStageEnoughForNow,
} from "@/lib/profile/guidedStageCompletion";
import {
  getGuidedAreaStages,
  resolveConditionalOfferFields,
} from "@/lib/profile/guidedStageRegistry";
import type {
  GuidedEntryMode,
  GuidedStageAreaId,
  GuidedStageDefinition,
} from "@/lib/profile/guidedStageTypes";
import {
  GUIDED_QUICK_START_DONE_MESSAGE,
  GUIDED_STAGE_COMPLETION_PROMPT,
  GUIDED_STAGES_MAY_AUTO_SAVE,
} from "@/lib/profile/guidedStageTypes";
import { getPeopleIHelpGuidedField } from "@/lib/profile/peopleIHelpGuidedFields";
import { PeopleIHelpQuestionHelp } from "@/components/companion/guided-stages/PeopleIHelpQuestionHelp";
import { PeopleIHelpSingleQuestionScreen } from "@/components/companion/guided-stages/PeopleIHelpSingleQuestionScreen";
/* Entry + field + stage + section-help styles (approved: this CSS file only) */
import "./guidedStageWorkspace.css";
import "./peopleIHelpSingleQuestion.css";

type Props = {
  areaId: GuidedStageAreaId;
  /** Draft values keyed by field key (estate) or people-i-help field keys */
  values: Record<string, string>;
  onChange: (fieldKey: string, value: string) => void;
  onFocusField: (fieldKey: string) => void;
  activeFieldKey: string | null;
  /** Persist via existing Save Changes — never auto */
  onSaveAndReturnLater: () => void;
  onCancel: () => void;
  /** When member chooses Enough for Now from area */
  onEnoughForNow?: () => void;
  /** Optional notes field for core values */
  onNotesChange?: (value: string) => void;
  notesValue?: string;
  /** People I Help: custom field renderer */
  renderPeopleField?: (
    fieldKey: string,
    open: boolean,
    onDone: () => void,
  ) => React.ReactNode;
  /**
   * Business Estate room chrome: skip entry picker, hide duplicate progress
   * list and footer Save/Cancel (primary CTA lives in room layout).
   */
  roomChrome?: boolean;
  /** Focus a stage by id (from Progress Overview). */
  focusStageId?: string | null;
  /** Keep Progress Overview in sync when this workspace advances stages. */
  onFocusStageIdChange?: (stageId: string) => void;
};

function pathToFieldKey(path: string): string | null {
  if (path === "people-i-help.link") return null;
  const i = path.indexOf(".");
  return i >= 0 ? path.slice(i + 1) : path;
}

function PeopleIHelpLinkCard() {
  const avatar = getPrimaryAvatar();
  return (
    <div
      className="guided-stage__people-link"
      data-testid="people-i-help-link-card"
    >
      <p className="guided-stage__people-link-title">People I Help</p>
      {avatar ? (
        <p className="guided-stage__people-link-body">
          {[avatar.name, avatar.who, avatar.tagline].filter(Boolean).join(" — ") ||
            "A saved avatar is available. Update it in People I Help — not duplicated here."}
        </p>
      ) : (
        <p className="guided-stage__people-link-body">
          No avatar saved yet. You can describe who you help in People I Help
          whenever you&apos;re ready — Identity stays linked, not duplicated.
        </p>
      )}
    </div>
  );
}

export function GuidedStageWorkspace({
  areaId,
  values,
  onChange,
  onFocusField,
  activeFieldKey,
  onSaveAndReturnLater,
  onCancel,
  onEnoughForNow,
  onNotesChange,
  notesValue = "",
  renderPeopleField,
  roomChrome = false,
  focusStageId = null,
  onFocusStageIdChange,
}: Props) {
  const area = getGuidedAreaStages(areaId);
  const stages = area.stages;
  const focusedStageIndex = useMemo(() => {
    if (!focusStageId) return -1;
    return stages.findIndex((s) => s.id === focusStageId);
  }, [focusStageId, stages]);

  const [entryMode, setEntryMode] = useState<GuidedEntryMode | null>(
    roomChrome ? "guided_setup" : null,
  );
  const [stageIndex, setStageIndex] = useState(() =>
    focusedStageIndex >= 0 ? focusedStageIndex : 0,
  );
  const [openFieldPath, setOpenFieldPath] = useState<string | null>(null);
  const [showStageComplete, setShowStageComplete] = useState(false);
  const [quickStartDone, setQuickStartDone] = useState(false);

  /**
   * Room chrome: Progress Overview owns the active stage via focusStageId.
   * Using local stageIndex alone desyncs on view→edit mount (clicks look dead).
   */
  const activeStageIndex =
    roomChrome && focusedStageIndex >= 0 ? focusedStageIndex : stageIndex;
  const activeStage: GuidedStageDefinition | undefined =
    stages[activeStageIndex];

  useEffect(() => {
    if (!roomChrome) return;
    setEntryMode("guided_setup");
  }, [roomChrome, areaId]);

  useLayoutEffect(() => {
    if (!roomChrome || !focusStageId) return;
    const idx = stages.findIndex((s) => s.id === focusStageId);
    if (idx < 0) return;
    setEntryMode((mode) => mode ?? "guided_setup");
    setStageIndex(idx);
    setShowStageComplete(false);
    setQuickStartDone(false);
    setOpenFieldPath(stages[idx]?.fieldPaths[0] ?? null);
  }, [roomChrome, focusStageId, stages]);

  function goToStage(nextIndex: number) {
    const next = stages[nextIndex];
    if (!next) return;
    setShowStageComplete(false);
    setQuickStartDone(false);
    setOpenFieldPath(next.fieldPaths[0] ?? null);
    if (roomChrome && onFocusStageIdChange) {
      onFocusStageIdChange(next.id);
      return;
    }
    setStageIndex(nextIndex);
  }

  const stageStatuses = useMemo(
    () => listAreaStageStatuses(areaId, values),
    [areaId, values],
  );

  const visiblePaths = useMemo(() => {
    if (!activeStage) return [] as string[];
    const mode = entryMode ?? (roomChrome ? "guided_setup" : null);
    if (mode === "quick_start") {
      return [...area.quickStartFieldPaths];
    }
    const paths = [...activeStage.fieldPaths];
    if (
      activeStage.id === "offers-future" &&
      areaId === "offers"
    ) {
      const conditional = resolveConditionalOfferFields(values);
      for (const p of conditional) {
        if (!paths.includes(p)) paths.push(p);
      }
    }
    return paths;
  }, [activeStage, entryMode, roomChrome, area.quickStartFieldPaths, areaId, values]);

  function selectEntry(mode: GuidedEntryMode) {
    setEntryMode(mode);
    setStageIndex(0);
    setShowStageComplete(false);
    setQuickStartDone(false);
    // People I Help single-question flow always opens the first prompt
    // (including Browse) so the screen never dumps every field at once.
    const peopleSingle = areaId === "people-i-help" && !roomChrome;
    setOpenFieldPath(
      mode === "browse" && !peopleSingle
        ? null
        : (area.quickStartFieldPaths[0] ??
            stages[0]?.fieldPaths[0] ??
            null),
    );
  }

  function openNextQuestion(fromPath: string) {
    const idx = visiblePaths.indexOf(fromPath);
    const next = visiblePaths[idx + 1];
    if (next) {
      setOpenFieldPath(next);
      const key = pathToFieldKey(next);
      if (key) onFocusField(key);
      return;
    }
    if (entryMode === "quick_start") {
      setQuickStartDone(true);
      return;
    }
    setShowStageComplete(true);
  }

  function renderEstateField(path: string, open: boolean) {
    if (path === "people-i-help.link") {
      return open ? <PeopleIHelpLinkCard /> : null;
    }

    const fieldKey = pathToFieldKey(path);
    if (!fieldKey) return null;

    if (areaId === "people-i-help" && renderPeopleField) {
      return renderPeopleField(fieldKey, open, () => openNextQuestion(path));
    }

    const sectionId = areaId as BusinessEstateSectionId;
    const fieldDef = BUSINESS_ESTATE_SECTION_FIELDS[sectionId]?.find(
      (f) => f.key === fieldKey,
    );
    if (!fieldDef) return null;

    const guided = getGuidedFieldDef(sectionId, fieldKey);
    const fieldId = `guided-stage-${sectionId}-${fieldKey}`;
    const label = fieldDisplayLabel(sectionId, fieldDef);

    if (!open) {
      const preview = (values[fieldKey] ?? "").trim();
      return (
        <p className="guided-stage__collapsed-preview">
          {preview || "Ready when you are"}
        </p>
      );
    }

    if (guided) {
      return (
        <>
          <GuidedEstateField
            sectionId={sectionId}
            fieldKey={fieldKey}
            label={label}
            value={values[fieldKey] ?? ""}
            notesValue={notesValue}
            onChange={(next) => onChange(fieldKey, next)}
            onNotesChange={
              fieldKey === "coreValues" ? onNotesChange : undefined
            }
            onFocus={() => onFocusField(fieldKey)}
            fieldId={fieldId}
            isActive={activeFieldKey === fieldKey}
            sectionValues={values}
          />
          <button
            type="button"
            className="guided-stage__done-btn"
            onClick={() => openNextQuestion(path)}
            data-testid={`stage-done-${fieldKey}`}
          >
            Done
          </button>
        </>
      );
    }

    return (
      <>
        {fieldDef.type === "textarea" ? (
          <textarea
            id={fieldId}
            value={values[fieldKey] ?? ""}
            onChange={(e) => onChange(fieldKey, e.target.value)}
            onFocus={() => onFocusField(fieldKey)}
            placeholder={
              fieldDef.placeholder ??
              "A sentence or two is plenty. Or choose I'm not sure."
            }
            className="business-estate-section-editor__textarea"
          />
        ) : (
          <input
            id={fieldId}
            type="text"
            value={values[fieldKey] ?? ""}
            onChange={(e) => onChange(fieldKey, e.target.value)}
            onFocus={() => onFocusField(fieldKey)}
            placeholder={fieldDef.placeholder ?? "Or: Not using one yet"}
            className="business-estate-section-editor__input"
          />
        )}
        {(areaId === "tools" || path.startsWith("tools.")) && (
          <div className="guided-stage__soft-choices">
            <button
              type="button"
              className="guided-estate-field__help-btn"
              onClick={() => onChange(fieldKey, "Not using one yet")}
            >
              Not using one yet
            </button>
            <button
              type="button"
              className="guided-estate-field__help-btn"
              onClick={() => onChange(fieldKey, "I'm not sure")}
            >
              I&apos;m not sure
            </button>
          </div>
        )}
        {/* Section help replaces the broader assistance bar for estate fields */}
        {!roomChrome && areaId === "people-i-help" ? (
          <GuidedAssistanceBar
            fieldPath={path}
            currentValue={values[fieldKey] ?? ""}
            estateSectionId={sectionId}
            estateFieldKey={fieldKey}
          />
        ) : null}
        <button
          type="button"
          className="guided-stage__done-btn"
          onClick={() => openNextQuestion(path)}
          data-testid={`stage-done-${fieldKey}`}
        >
          Done
        </button>
      </>
    );
  }

  if (!entryMode && !roomChrome) {
    return (
      <div className="guided-stage-entry" data-testid="guided-stage-entry">
        <p className="guided-stage-entry__lead">
          Choose how you&apos;d like to begin.
        </p>
        <div className="guided-stage-entry__options" role="group" aria-label="Setup choices">
          <button
            type="button"
            className="guided-stage-entry__option"
            onClick={() => selectEntry("quick_start")}
            data-testid="entry-quick-start"
          >
            <span className="guided-stage-entry__option-title">Quick Start</span>
            <span className="guided-stage-entry__option-desc">
              Just the 2–3 highest-value questions.
            </span>
          </button>
          <button
            type="button"
            className="guided-stage-entry__option"
            onClick={() => selectEntry("guided_setup")}
            data-testid="entry-guided-setup"
          >
            <span className="guided-stage-entry__option-title">
              Guided Setup
            </span>
            <span className="guided-stage-entry__option-desc">
              One short stage at a time — stop whenever you like.
            </span>
          </button>
          <button
            type="button"
            className="guided-stage-entry__option"
            onClick={() => selectEntry("browse")}
            data-testid="entry-browse"
          >
            <span className="guided-stage-entry__option-title">
              Browse and Update
            </span>
            <span className="guided-stage-entry__option-desc">
              Jump to any stage or existing answer.
            </span>
          </button>
        </div>
        <button
          type="button"
          className="guided-stage-entry__cancel"
          onClick={onCancel}
          data-testid="guided-stage-entry-cancel"
        >
          Cancel
        </button>
        <span className="sr-only">
          autoSave={String(GUIDED_STAGES_MAY_AUTO_SAVE)}
        </span>
      </div>
    );
  }

  const effectiveEntryMode: GuidedEntryMode = entryMode ?? "guided_setup";

  const peopleSingleQuestion =
    areaId === "people-i-help" && !roomChrome && Boolean(entryMode);

  if (peopleSingleQuestion) {
    const currentPath =
      openFieldPath && visiblePaths.includes(openFieldPath)
        ? openFieldPath
        : visiblePaths[0] ?? null;
    const currentKey = currentPath ? pathToFieldKey(currentPath) : null;
    const stepIndex = currentPath ? Math.max(0, visiblePaths.indexOf(currentPath)) : 0;
    const stepCount = visiblePaths.length;
    const isLastInStage = stepIndex >= stepCount - 1;

    if (quickStartDone) {
      return (
        <div
          className="guided-stage-complete"
          data-testid="quick-start-complete"
        >
          <p>{GUIDED_QUICK_START_DONE_MESSAGE}</p>
          <div className="guided-stage-complete__actions">
            <button
              type="button"
              className="pih-single-question__primary"
              onClick={() => {
                setEntryMode("guided_setup");
                setQuickStartDone(false);
                setStageIndex(0);
                setOpenFieldPath(stages[0]?.fieldPaths[0] ?? null);
              }}
            >
              Continue
            </button>
            <button
              type="button"
              className="pih-single-question__secondary"
              onClick={onSaveAndReturnLater}
            >
              Enough for now
            </button>
            <button
              type="button"
              className="pih-single-question__secondary"
              onClick={() => {
                setQuickStartDone(false);
                setOpenFieldPath(area.quickStartFieldPaths[0] ?? null);
              }}
            >
              Review answers
            </button>
          </div>
        </div>
      );
    }

    if (showStageComplete && activeStage) {
      const hasNext = activeStageIndex < stages.length - 1;
      return (
        <div
          className="guided-stage-complete"
          data-testid="stage-complete-panel"
        >
          <p>{GUIDED_STAGE_COMPLETION_PROMPT}</p>
          <p className="guided-stage-complete__sub">
            {activeStage.completionMessage}
          </p>
          <div className="guided-stage-complete__actions">
            <button
              type="button"
              className="pih-single-question__primary"
              onClick={() => {
                if (hasNext) {
                  goToStage(activeStageIndex + 1);
                } else {
                  setShowStageComplete(false);
                  onSaveAndReturnLater();
                }
              }}
              data-testid="stage-continue"
            >
              {hasNext ? "Continue" : "Save Progress"}
            </button>
            <button
              type="button"
              className="pih-single-question__secondary"
              onClick={() => {
                markStageEnoughForNow(activeStage.id);
                onEnoughForNow?.();
                onSaveAndReturnLater();
              }}
              data-testid="stage-enough-for-now"
            >
              Enough for now
            </button>
            <button
              type="button"
              className="pih-single-question__secondary"
              onClick={() => {
                setShowStageComplete(false);
                setOpenFieldPath(activeStage.fieldPaths[0] ?? null);
              }}
              data-testid="stage-review"
            >
              Review answers
            </button>
          </div>
        </div>
      );
    }

    if (!currentPath || !currentKey) {
      return (
        <div className="pih-single-question" data-testid="pih-single-question">
          <p className="pih-single-question__guidance">
            Choose a stage above to continue.
          </p>
          <button
            type="button"
            className="pih-single-question__secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      );
    }

    const meta = getPeopleIHelpGuidedField(currentKey);
    const question =
      currentPath === "people-i-help.link"
        ? "Who this business helps"
        : (meta?.question ?? currentKey);
    const guidance =
      meta?.definition ??
      "A sentence or two is enough. You can change this anytime.";
    const stageTitle =
      effectiveEntryMode === "quick_start"
        ? "Quick Start"
        : (activeStage?.title ?? "People I Help");

    let primaryLabel = "Continue";
    if (effectiveEntryMode === "quick_start" && isLastInStage) {
      primaryLabel = "Finish Quick Start";
    } else if (effectiveEntryMode !== "quick_start" && isLastInStage) {
      primaryLabel = "Finish Stage";
    }

    const answerBody =
      renderPeopleField?.(currentKey, true, () =>
        openNextQuestion(currentPath),
      ) ?? null;

    return (
      <PeopleIHelpSingleQuestionScreen
        stageTitle={stageTitle}
        stepIndex={stepIndex}
        stepCount={stepCount}
        question={question}
        guidance={guidance}
        answer={answerBody}
        help={
          <PeopleIHelpQuestionHelp
            key={currentKey}
            fieldKey={currentKey}
            currentValue={values[currentKey] ?? ""}
          />
        }
        primaryLabel={primaryLabel}
        onPrimary={() => openNextQuestion(currentPath)}
        onSaveLater={onSaveAndReturnLater}
        onCancel={onCancel}
        showStageOverview={effectiveEntryMode !== "quick_start"}
        stageOverview={stageStatuses}
        activeStageId={activeStage?.id ?? null}
        onSelectStage={(stageId) => {
          const idx = stages.findIndex((s) => s.id === stageId);
          if (idx >= 0) {
            setEntryMode((mode) =>
              mode === "quick_start" ? "browse" : mode ?? "browse",
            );
            goToStage(idx);
          }
        }}
      />
    );
  }

  return (
    <div
      className={`guided-stage-workspace${
        roomChrome ? " guided-stage-workspace--room-chrome" : ""
      }`}
      data-testid="guided-stage-workspace"
    >
      {!roomChrome ? (
      <div className="guided-stage-workspace__status-list" role="list">
        {stageStatuses.map(({ stage, label }) => (
          <button
            key={stage.id}
            type="button"
            role="listitem"
            className={`guided-stage-workspace__status-item${
              stage.optional ? " guided-stage-workspace__status-item--optional" : ""
            }${
              effectiveEntryMode !== "quick_start" && activeStage?.id === stage.id
                ? " guided-stage-workspace__status-item--active"
                : ""
            }`}
            onClick={() => {
              if (effectiveEntryMode === "quick_start") return;
              const idx = stages.findIndex((s) => s.id === stage.id);
              if (idx >= 0) {
                setStageIndex(idx);
                setEntryMode("browse");
                setShowStageComplete(false);
                setOpenFieldPath(stage.fieldPaths[0] ?? null);
              }
            }}
          >
            <span>{stage.title}</span>
            <span className="guided-stage-workspace__status-label">{label}</span>
          </button>
        ))}
      </div>
      ) : null}

      <div
        className={`guided-stage-workspace__scroll${
          roomChrome ? " guided-stage-workspace__scroll--inline" : ""
        }`}
      >
        {effectiveEntryMode === "quick_start" ? (
          <header className="guided-stage-workspace__stage-header">
            <h3 className="guided-stage-workspace__stage-title">Quick Start</h3>
            <p className="guided-stage-workspace__stage-desc">
              A few essentials — enough for Shari to begin personalizing help.
            </p>
          </header>
        ) : activeStage && !roomChrome ? (
          <header className="guided-stage-workspace__stage-header">
            <h3 className="guided-stage-workspace__stage-title">
              {activeStage.title}
              {activeStage.optional ? (
                <span className="guided-stage-workspace__optional-tag">
                  Optional
                </span>
              ) : null}
            </h3>
            <p className="guided-stage-workspace__stage-desc">
              {activeStage.description}
            </p>
            <p className="guided-stage-workspace__stage-status">
              {formatStageStatusLabel(
                deriveStageStatus(activeStage, values),
              )}
            </p>
          </header>
        ) : null}

        {!showStageComplete && !quickStartDone ? (
          <div className="guided-stage-workspace__questions">
            {(roomChrome
              ? visiblePaths.filter(
                  (path) => path === (openFieldPath ?? visiblePaths[0]),
                )
              : visiblePaths
            ).map((path) => {
              const isOpen = roomChrome
                ? true
                : openFieldPath === path;

              const title =
                path === "people-i-help.link"
                  ? "Who this business helps"
                  : (() => {
                      const key = pathToFieldKey(path);
                      if (!key) return path;
                      if (areaId === "people-i-help") {
                        return (
                          getPeopleIHelpGuidedField(key)?.question ?? key
                        );
                      }
                      const sectionId = areaId as BusinessEstateSectionId;
                      const def = BUSINESS_ESTATE_SECTION_FIELDS[
                        sectionId
                      ]?.find((f) => f.key === key);
                      return def
                        ? fieldDisplayLabel(sectionId, def)
                        : key;
                    })();

              const fieldKey = pathToFieldKey(path);

              return (
                <div
                  key={path}
                  className={`guided-stage-question${
                    isOpen ? " guided-stage-question--open" : ""
                  }`}
                  data-testid={`stage-question-${path}`}
                >
                  {roomChrome ? (
                    <h4 className="guided-stage-question__toggle" id={`q-${path}`}>
                      {title}
                    </h4>
                  ) : (
                    <button
                      type="button"
                      className="guided-stage-question__toggle"
                      aria-expanded={isOpen}
                      onClick={() => {
                        setOpenFieldPath(isOpen ? null : path);
                        const key = pathToFieldKey(path);
                        if (key && !isOpen) onFocusField(key);
                      }}
                    >
                      <span>{title}</span>
                      <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
                    </button>
                  )}
                  {isOpen ? (
                    <div className="guided-stage-question__body">
                      {renderEstateField(path, true)}
                      {activeStage &&
                      effectiveEntryMode !== "quick_start" &&
                      fieldKey &&
                      areaId !== "people-i-help" ? (
                        <div
                          className="business-estate-section-help"
                          data-testid="business-estate-section-help"
                          data-stage-id={activeStage.id}
                          data-field-path={path}
                        >
                          <p className="business-estate-section-help__label">
                            Help with {activeStage.title}
                          </p>
                          <div
                            className="business-estate-section-help__actions"
                            role="group"
                            aria-label={`Help for ${activeStage.title}`}
                          >
                            <button
                              type="button"
                              className="guided-estate-field__help-btn"
                              data-testid="section-help-me-answer"
                              onClick={() => {
                                const sectionId = path.includes(".")
                                  ? path.slice(0, path.indexOf("."))
                                  : activeStage.areaId;
                                requestGuidedFieldHelp({
                                  sectionId,
                                  fieldKey,
                                  fieldPath: path,
                                  helpMode: "help_me_develop",
                                  currentValue: values[fieldKey] ?? "",
                                  approvedBusinessContext:
                                    collectApprovedBusinessEstateContext(),
                                  relatedFieldValues: {},
                                  question: `${activeStage.title} — ${title}`,
                                  definition: activeStage.description,
                                  guidedQuestions: [...activeStage.fieldPaths],
                                });
                              }}
                            >
                              Help Me Answer
                            </button>
                            {businessEstateFieldSupportsResearch(path) ? (
                              <button
                                type="button"
                                className="guided-estate-field__help-btn"
                                data-testid="section-research-this"
                                onClick={() => {
                                  const sectionId = path.includes(".")
                                    ? path.slice(0, path.indexOf("."))
                                    : activeStage.areaId;
                                  requestGuidedFieldHelp({
                                    sectionId,
                                    fieldKey,
                                    fieldPath: path,
                                    helpMode: "research_with_shari",
                                    currentValue: values[fieldKey] ?? "",
                                    approvedBusinessContext:
                                      collectApprovedBusinessEstateContext(),
                                    relatedFieldValues: {},
                                    question: `${activeStage.title} — ${title}`,
                                    definition: activeStage.description,
                                    guidedQuestions: [
                                      ...activeStage.fieldPaths,
                                    ],
                                  });
                                }}
                              >
                                Research This
                              </button>
                            ) : null}
                          </div>
                          <p
                            className="business-estate-section-help__hint"
                            data-testid="business-estate-section-help-hint"
                          >
                            Shari will use this question and your current answer
                            as context.
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="guided-stage-question__preview">
                      {renderEstateField(path, false)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}

        {quickStartDone ? (
          <div
            className="guided-stage-complete"
            data-testid="quick-start-complete"
          >
            <p>{GUIDED_QUICK_START_DONE_MESSAGE}</p>
            <div className="guided-stage-complete__actions">
              <button
                type="button"
                className="business-estate-section-editor__save"
                onClick={() => {
                  setEntryMode("guided_setup");
                  setQuickStartDone(false);
                  setStageIndex(0);
                  setOpenFieldPath(stages[0]?.fieldPaths[0] ?? null);
                }}
              >
                Continue
              </button>
              <button
                type="button"
                className="guided-estate-field__help-btn"
                onClick={() => {
                  onSaveAndReturnLater();
                }}
              >
                Enough for now
              </button>
              <button
                type="button"
                className="guided-estate-field__help-btn"
                onClick={() => {
                  setQuickStartDone(false);
                  setOpenFieldPath(area.quickStartFieldPaths[0] ?? null);
                }}
              >
                Review answers
              </button>
            </div>
          </div>
        ) : null}

        {showStageComplete && activeStage ? (
          <div
            className="guided-stage-complete"
            data-testid="stage-complete-panel"
          >
            <p>{GUIDED_STAGE_COMPLETION_PROMPT}</p>
            <p className="guided-stage-complete__sub">
              {activeStage.completionMessage}
            </p>
            <div className="guided-stage-complete__actions">
              <button
                type="button"
                className="business-estate-section-editor__save"
                onClick={() => {
                  if (activeStageIndex < stages.length - 1) {
                    goToStage(activeStageIndex + 1);
                  } else {
                    setShowStageComplete(false);
                    onSaveAndReturnLater();
                  }
                }}
                data-testid="stage-continue"
              >
                Continue
              </button>
              <button
                type="button"
                className="guided-estate-field__help-btn"
                onClick={() => {
                  markStageEnoughForNow(activeStage.id);
                  onEnoughForNow?.();
                  onSaveAndReturnLater();
                }}
                data-testid="stage-enough-for-now"
              >
                Enough for now
              </button>
              <button
                type="button"
                className="guided-estate-field__help-btn"
                onClick={() => {
                  setShowStageComplete(false);
                  setOpenFieldPath(activeStage.fieldPaths[0] ?? null);
                }}
                data-testid="stage-review"
              >
                Review answers
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="guided-stage-workspace__footer">
        {!roomChrome ? (
        <div className="guided-stage-workspace__footer-actions">
          <button
            type="button"
            className="business-estate-section-editor__cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="guided-estate-field__help-btn"
            onClick={onSaveAndReturnLater}
            data-testid="save-and-return-later"
          >
            Save and Return Later
          </button>
          <button
            type="button"
            className="business-estate-section-editor__save"
            onClick={onSaveAndReturnLater}
            data-testid="guided-stage-save"
          >
            Save Changes
          </button>
        </div>
        ) : null}
        {effectiveEntryMode === "quick_start" &&
        isQuickStartSatisfied(areaId, values) &&
        !quickStartDone ? (
          <button
            type="button"
            className="guided-estate-field__help-btn"
            onClick={() => setQuickStartDone(true)}
          >
            I&apos;m done with Quick Start
          </button>
        ) : null}
        {!roomChrome ? (
        <button
          type="button"
          className="guided-stage__change-mode"
          onClick={() => setEntryMode(null)}
        >
          Change how I work here
        </button>
        ) : null}
      </div>
    </div>
  );
}
