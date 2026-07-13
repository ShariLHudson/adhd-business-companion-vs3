"use client";

import { useCallback, useEffect, useState } from "react";
import {
  applyFormVoiceTranscript,
  FormVoiceEntryControl,
} from "@/components/companion/FormVoiceEntryControl";
import { GuidedStageWorkspace } from "@/components/companion/guided-stages/GuidedStageWorkspace";
import {
  getBusinessEstateEnvelope,
  saveBusinessEstateSection,
  type BusinessEstateSectionId,
} from "@/lib/profile/businessEstateProfile";
import {
  BUSINESS_ESTATE_SECTION_FIELDS,
  fieldDisplayLabel,
  sectionStorageKey,
} from "@/lib/profile/businessEstateSectionFields";
import type { GuidedStageAreaId } from "@/lib/profile/guidedStageTypes";
import { listAreaStageStatuses } from "@/lib/profile/guidedStageCompletion";

type Props = {
  sectionId: BusinessEstateSectionId;
  title: string;
  description: string;
  /** Open directly in edit mode (e.g. overview Update Identity Office). */
  initialMode?: "view" | "edit";
  onBack: () => void;
  onDirtyChange?: (dirty: boolean) => void;
};

function needsReviewBanner(sectionId: BusinessEstateSectionId): boolean {
  const envelope = getBusinessEstateEnvelope();
  const storageKey = sectionStorageKey(sectionId);
  const section = envelope.sections[storageKey] as Record<string, string>;
  return Object.keys(section).some((key) => {
    const value = section[key] ?? "";
    if (!value.trim()) return false;
    return envelope.approval[`${sectionId}.${key}`] !== true;
  });
}

function readSectionValues(sectionId: BusinessEstateSectionId): Record<string, string> {
  const fields = BUSINESS_ESTATE_SECTION_FIELDS[sectionId];
  const storageKey = sectionStorageKey(sectionId);
  const envelope = getBusinessEstateEnvelope();
  const section = envelope.sections[storageKey] as Record<string, string>;
  const initial: Record<string, string> = {};
  for (const field of fields) {
    initial[field.key] = section[field.key] ?? "";
  }
  return initial;
}

function valuesAreDirty(
  sectionId: BusinessEstateSectionId,
  values: Record<string, string>,
): boolean {
  const saved = readSectionValues(sectionId);
  return BUSINESS_ESTATE_SECTION_FIELDS[sectionId].some(
    (field) => (values[field.key] ?? "") !== (saved[field.key] ?? ""),
  );
}

function isHiddenCompanionField(key: string): boolean {
  return key === "coreValueNotes";
}

export function BusinessEstateSectionEditor({
  sectionId,
  title,
  description,
  initialMode = "view",
  onBack,
  onDirtyChange,
}: Props) {
  const fields = BUSINESS_ESTATE_SECTION_FIELDS[sectionId];
  const visibleFields = fields.filter((f) => !isHiddenCompanionField(f.key));
  const [values, setValues] = useState<Record<string, string>>(() =>
    readSectionValues(sectionId),
  );
  const [mode, setMode] = useState<"view" | "edit">(initialMode);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [reviewNotice, setReviewNotice] = useState(false);
  const [activeFieldKey, setActiveFieldKey] = useState<string | null>(null);

  const reload = useCallback(() => {
    setValues(readSectionValues(sectionId));
    setReviewNotice(needsReviewBanner(sectionId));
    setSavedMessage(null);
  }, [sectionId]);

  useEffect(() => {
    reload();
    setMode(initialMode);
    setActiveFieldKey(null);
  }, [reload, sectionId, initialMode]);

  useEffect(() => {
    onDirtyChange?.(mode === "edit" && valuesAreDirty(sectionId, values));
  }, [mode, onDirtyChange, sectionId, values]);

  function updateField(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setSavedMessage(null);
  }

  function handleSave() {
    saveBusinessEstateSection(sectionId, values);
    setReviewNotice(false);
    setMode("view");
    setSavedMessage("Saved");
    setActiveFieldKey(null);
    reload();
  }

  function handleCancel() {
    reload();
    setMode("view");
    setActiveFieldKey(null);
  }

  function handleBack() {
    if (mode === "edit" && valuesAreDirty(sectionId, values)) {
      const discard = window.confirm(
        "You have unsaved changes. Discard them and go back?",
      );
      if (!discard) return;
    }
    onBack();
  }

  function enterEditMode() {
    setSavedMessage(null);
    setMode("edit");
  }

  const activeFieldLabel =
    visibleFields.find((field) => field.key === activeFieldKey)?.label ?? null;

  const stageStatuses = listAreaStageStatuses(
    sectionId as GuidedStageAreaId,
    values,
  );

  return (
    <div className="business-estate-section-editor">
      <button
        type="button"
        className="business-estate-section-editor__back"
        onClick={handleBack}
      >
        ← Back to My Business Estate
      </button>

      <header className="business-estate-section-editor__header">
        <div className="business-estate-section-editor__header-row">
          <div>
            <p className="estate-workspace__kicker">Business Area</p>
            <h2 className="business-estate-section-editor__title">{title}</h2>
          </div>
          {mode === "view" ? (
            <button
              type="button"
              className="business-estate-section-editor__save"
              onClick={enterEditMode}
              data-testid="business-estate-edit-profile"
            >
              Update
            </button>
          ) : null}
        </div>
        <p className="my-business-estate-panel__lead">{description}</p>
      </header>

      {reviewNotice ? (
        <p className="business-estate-section-editor__review" role="status">
          Some earlier imported information may need your review. Edit any field,
          then save what you want to keep.
        </p>
      ) : null}

      {mode === "view" ? (
        <>
          <div
            className="guided-stage-workspace__status-list guided-stage-workspace__status-list--view"
            role="list"
          >
            {stageStatuses.map(({ stage, label }) => (
              <div
                key={stage.id}
                role="listitem"
                className={`guided-stage-workspace__status-item${
                  stage.optional
                    ? " guided-stage-workspace__status-item--optional"
                    : ""
                }`}
              >
                <span>{stage.title}</span>
                <span className="guided-stage-workspace__status-label">
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div className="business-estate-section-editor__view">
            {visibleFields.map((field) => {
              const value = values[field.key]?.trim() ?? "";
              return (
                <button
                  key={field.key}
                  type="button"
                  className="business-estate-section-editor__view-row"
                  onClick={enterEditMode}
                  aria-label={`Edit ${fieldDisplayLabel(sectionId, field)}`}
                >
                  <span className="business-estate-section-editor__view-label">
                    {fieldDisplayLabel(sectionId, field)}
                  </span>
                  <span className="business-estate-section-editor__view-value">
                    {value || "Ready when you are"}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="business-estate-section-editor__fields business-estate-section-editor__fields--staged">
          <div className="business-estate-section-editor__voice-bar">
            <FormVoiceEntryControl
              activeFieldKey={activeFieldKey}
              activeFieldLabel={activeFieldLabel}
              onTranscript={(fieldKey, spoken) => {
                setValues((current) => ({
                  ...current,
                  [fieldKey]: applyFormVoiceTranscript(
                    current[fieldKey] ?? "",
                    spoken,
                  ),
                }));
                setSavedMessage(null);
              }}
            />
          </div>
          <GuidedStageWorkspace
            areaId={sectionId as GuidedStageAreaId}
            values={values}
            onChange={updateField}
            onFocusField={setActiveFieldKey}
            activeFieldKey={activeFieldKey}
            onSaveAndReturnLater={handleSave}
            onCancel={handleCancel}
            notesValue={values.coreValueNotes ?? ""}
            onNotesChange={(next) => updateField("coreValueNotes", next)}
          />
        </div>
      )}

      {savedMessage ? (
        <p className="business-estate-section-editor__saved" role="status">
          {savedMessage}
        </p>
      ) : null}
    </div>
  );
}
