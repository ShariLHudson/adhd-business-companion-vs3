"use client";

import { useCallback, useEffect, useState } from "react";
import { VoiceAnswerField } from "@/components/companion/VoiceAnswerField";
import {
  getBusinessEstateEnvelope,
  saveBusinessEstateSection,
  type BusinessEstateSectionId,
} from "@/lib/profile/businessEstateProfile";
import {
  BUSINESS_ESTATE_SECTION_FIELDS,
  sectionStorageKey,
} from "@/lib/profile/businessEstateSectionFields";

type Props = {
  sectionId: BusinessEstateSectionId;
  title: string;
  description: string;
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

export function BusinessEstateSectionEditor({
  sectionId,
  title,
  description,
  onBack,
  onDirtyChange,
}: Props) {
  const fields = BUSINESS_ESTATE_SECTION_FIELDS[sectionId];
  const [values, setValues] = useState<Record<string, string>>(() =>
    readSectionValues(sectionId),
  );
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [reviewNotice, setReviewNotice] = useState(false);

  const reload = useCallback(() => {
    setValues(readSectionValues(sectionId));
    setReviewNotice(needsReviewBanner(sectionId));
    setSavedMessage(null);
  }, [sectionId]);

  useEffect(() => {
    reload();
    setMode("view");
  }, [reload, sectionId]);

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
    reload();
  }

  function handleCancel() {
    reload();
    setMode("view");
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
        <p className="estate-workspace__kicker">My Business Estate</p>
        <h2 className="business-estate-section-editor__title">{title}</h2>
        <p className="my-business-estate-panel__lead">{description}</p>
      </header>

      {reviewNotice ? (
        <p className="business-estate-section-editor__review" role="status">
          Some earlier imported information may need your review. Edit any field,
          then save what you want to keep.
        </p>
      ) : null}

      {mode === "view" ? (
        <div className="business-estate-section-editor__view">
          {fields.map((field) => {
            const value = values[field.key]?.trim() ?? "";
            return (
              <div key={field.key} className="business-estate-section-editor__view-row">
                <span className="business-estate-section-editor__view-label">
                  {field.label}
                </span>
                <span className="business-estate-section-editor__view-value">
                  {value || "Not set"}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="business-estate-section-editor__fields">
          {fields.map((field) => (
            <label key={field.key} className="business-estate-section-editor__field">
              <span className="business-estate-section-editor__label">
                {field.label}
              </span>
              <VoiceAnswerField
                value={values[field.key] ?? ""}
                onChange={(value) => updateField(field.key, value)}
                multiline={field.type === "textarea"}
                placeholder={field.placeholder}
                inputClassName={
                  field.type === "textarea"
                    ? "business-estate-section-editor__textarea"
                    : "business-estate-section-editor__input"
                }
              />
            </label>
          ))}
        </div>
      )}

      {savedMessage ? (
        <p className="business-estate-section-editor__saved" role="status">
          {savedMessage}
        </p>
      ) : null}

      <div className="business-estate-section-editor__actions">
        {mode === "view" ? (
          <button
            type="button"
            className="business-estate-section-editor__save"
            onClick={() => {
              setSavedMessage(null);
              setMode("edit");
            }}
          >
            Edit
          </button>
        ) : (
          <>
            <button
              type="button"
              className="business-estate-section-editor__cancel"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="business-estate-section-editor__save"
              onClick={handleSave}
            >
              Save
            </button>
          </>
        )}
      </div>
    </div>
  );
}
