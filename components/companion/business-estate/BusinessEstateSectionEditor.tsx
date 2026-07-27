"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  applyFormVoiceTranscript,
  FormVoiceEntryControl,
} from "@/components/companion/FormVoiceEntryControl";
import { GuidedStageWorkspace } from "@/components/companion/guided-stages/GuidedStageWorkspace";
import { BusinessEstateRoomLayout } from "@/components/companion/business-estate/BusinessEstateRoomLayout";
import { BusinessEstateRoomHeader } from "@/components/companion/business-estate/BusinessEstateRoomHeader";
import { BusinessEstateProgressOverview } from "@/components/companion/business-estate/BusinessEstateProgressOverview";
import { BusinessEstatePrimaryAction } from "@/components/companion/business-estate/BusinessEstatePrimaryAction";
import { GetExpertHelpAction } from "@/components/companion/advisory/GetExpertHelpAction";
import {
  getBusinessEstateEnvelope,
  getBusinessEstateSectionStatus,
  saveBusinessEstateSection,
  type BusinessEstateSectionId,
} from "@/lib/profile/businessEstateProfile";
import {
  BUSINESS_ESTATE_SECTION_FIELDS,
  sectionStorageKey,
} from "@/lib/profile/businessEstateSectionFields";
import {
  businessEstateRoomStatusLabel,
  businessEstateRoomStatusTone,
} from "@/lib/profile/businessEstateRoomChrome";
import { estateRoomTimeEstimate } from "@/lib/profile/businessEstateRedesign";
import type { GuidedStageAreaId } from "@/lib/profile/guidedStageTypes";
import { getGuidedAreaStages } from "@/lib/profile/guidedStageRegistry";
import {
  ContextualResearchPanel,
  type ContextualResearchMessage,
} from "@/components/companion/contextualWorkspace/ContextualResearchPanel";
import {
  addBusinessEstateResearchResponseToField,
  addBusinessEstateResearchSessionToField,
  getBusinessEstateResearchAddedResponses,
  getBusinessEstateResearchThreadMessages,
  saveBusinessEstateResearchThread,
} from "@/lib/profile/businessEstateProfile";
import {
  BUSINESS_ESTATE_RESEARCH_LABELS,
  buildBusinessEstateResearchAutoPrompt,
  buildBusinessEstateResearchSystemPrompt,
  businessEstateResearchThreadKey,
} from "@/lib/profile/businessProfileResearchConfig";

type Props = {
  sectionId: BusinessEstateSectionId;
  title: string;
  /** One short purpose sentence for the room */
  purpose: string;
  /** Open directly in edit mode (e.g. overview Update Identity Office). */
  initialMode?: "view" | "edit";
  onBack: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  /** Opens Need Another Perspective? (Chamber / Board) */
  onOpenExpertHelp: () => void;
  /** Optional single How to Use control */
  helpControl?: ReactNode;
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
  purpose,
  initialMode = "view",
  onBack,
  onDirtyChange,
  onOpenExpertHelp,
  helpControl,
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
  const firstStageId =
    getGuidedAreaStages(sectionId as GuidedStageAreaId).stages[0]?.id ?? null;
  const [focusStageId, setFocusStageId] = useState<string | null>(() =>
    initialMode === "edit" ? firstStageId : null,
  );
  // Contextual research — one active field, one shared panel (mirrors Client Avatar).
  const [researchFieldKey, setResearchFieldKey] = useState<string | null>(null);
  const [researchMessages, setResearchMessages] = useState<
    ContextualResearchMessage[]
  >([]);
  const activeResearchKey = researchFieldKey
    ? businessEstateResearchThreadKey(sectionId, researchFieldKey)
    : null;

  const sectionStatus = getBusinessEstateSectionStatus(sectionId);
  const dirty = mode === "edit" && valuesAreDirty(sectionId, values);

  const reload = useCallback(() => {
    setValues(readSectionValues(sectionId));
    setReviewNotice(needsReviewBanner(sectionId));
    setSavedMessage(null);
  }, [sectionId]);

  useEffect(() => {
    reload();
    setMode(initialMode);
    setActiveFieldKey(null);
    setResearchFieldKey(null);
    const startId =
      getGuidedAreaStages(sectionId as GuidedStageAreaId).stages[0]?.id ?? null;
    setFocusStageId(initialMode === "edit" ? startId : null);
  }, [reload, sectionId, initialMode]);

  // Load the persisted thread when research opens for a field (resume).
  useEffect(() => {
    if (activeResearchKey) {
      setResearchMessages(
        getBusinessEstateResearchThreadMessages(activeResearchKey),
      );
    } else {
      setResearchMessages([]);
    }
  }, [activeResearchKey]);

  function openResearch(fieldKey: string) {
    // Load the persisted thread synchronously so the panel mounts non-empty and
    // resumes instead of auto-researching afresh (the empty-mount race).
    const key = businessEstateResearchThreadKey(sectionId, fieldKey);
    setResearchMessages(getBusinessEstateResearchThreadMessages(key));
    setResearchFieldKey(fieldKey);
  }

  function handleResearchMessages(next: ContextualResearchMessage[]) {
    setResearchMessages(next);
    if (activeResearchKey) saveBusinessEstateResearchThread(activeResearchKey, next);
  }

  function handleResearchAddResponse(message: ContextualResearchMessage) {
    if (!researchFieldKey) return;
    const result = addBusinessEstateResearchResponseToField(
      sectionId,
      researchFieldKey,
      values[researchFieldKey] ?? "",
      message,
    );
    if (result.added) updateField(researchFieldKey, result.value);
  }

  function handleResearchAddSession() {
    if (!researchFieldKey) return;
    const result = addBusinessEstateResearchSessionToField(
      sectionId,
      researchFieldKey,
      values[researchFieldKey] ?? "",
      researchMessages,
    );
    if (result.added) updateField(researchFieldKey, result.value);
  }

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  function updateField(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setSavedMessage(null);
  }

  function handleSave() {
    saveBusinessEstateSection(sectionId, values);
    setReviewNotice(false);
    setMode("view");
    setFocusStageId(null);
    setSavedMessage("Saved");
    setActiveFieldKey(null);
    setResearchFieldKey(null);
    reload();
  }

  function handleCancel() {
    reload();
    setMode("view");
    setFocusStageId(null);
    setActiveFieldKey(null);
    setResearchFieldKey(null);
  }

  function handleBack() {
    if (dirty) {
      const discard = window.confirm(
        "You have unsaved changes. Discard them and go back?",
      );
      if (!discard) return;
    }
    onBack();
  }

  function enterEditMode(stageId?: string) {
    setSavedMessage(null);
    const next =
      stageId ??
      focusStageId ??
      getGuidedAreaStages(sectionId as GuidedStageAreaId).stages[0]?.id ??
      null;
    setFocusStageId(next);
    setMode("edit");
  }

  function handleSelectStage(stageId: string) {
    if (mode === "edit" && focusStageId === stageId) {
      // Toggle closed — return to quiet overview
      setMode("view");
      setFocusStageId(null);
      setActiveFieldKey(null);
      return;
    }
    setFocusStageId(stageId);
    if (mode === "view") {
      enterEditMode(stageId);
    }
  }

  function primaryLabel(): string {
    if (mode === "view") {
      if (sectionStatus === "ready-to-review") return "Review";
      if (sectionStatus === "updated") return "Update";
      if (sectionStatus === "started") return "Continue";
      return "Begin";
    }
    return "Save Progress";
  }

  function handlePrimaryAction() {
    if (mode === "view") {
      enterEditMode(focusStageId ?? firstStageId ?? undefined);
      return;
    }
    handleSave();
  }

  const activeFieldLabel =
    visibleFields.find((field) => field.key === activeFieldKey)?.label ?? null;

  const editingOpen = mode === "edit" && Boolean(focusStageId);

  const expandedContent = editingOpen ? (
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
        roomChrome
        focusStageId={focusStageId}
        onFocusStageIdChange={setFocusStageId}
        onResearchField={openResearch}
      />

      {researchFieldKey ? (
        <ContextualResearchPanel
          open
          onToggle={() => setResearchFieldKey(null)}
          questionKey={activeResearchKey ?? ""}
          questionLabel={
            visibleFields.find((f) => f.key === researchFieldKey)?.label ??
            researchFieldKey
          }
          systemPrompt={buildBusinessEstateResearchSystemPrompt(
            sectionId,
            researchFieldKey,
            values[researchFieldKey] ?? "",
          )}
          autoPrompt={buildBusinessEstateResearchAutoPrompt(
            sectionId,
            researchFieldKey,
            values[researchFieldKey] ?? "",
          )}
          messages={researchMessages}
          onMessagesChange={handleResearchMessages}
          addedResponseIds={getBusinessEstateResearchAddedResponses()}
          onAddResponse={handleResearchAddResponse}
          onAddSession={handleResearchAddSession}
          toggleLabel={BUSINESS_ESTATE_RESEARCH_LABELS.toggleLabel}
          helperText={BUSINESS_ESTATE_RESEARCH_LABELS.helperText}
          addLabel={BUSINESS_ESTATE_RESEARCH_LABELS.addLabel}
          addAllLabel={BUSINESS_ESTATE_RESEARCH_LABELS.addAllLabel}
          addedLabel={BUSINESS_ESTATE_RESEARCH_LABELS.addedLabel}
        />
      ) : null}
    </div>
  ) : null;

  const expandedFooter = editingOpen ? (
    <BusinessEstatePrimaryAction
      label={primaryLabel()}
      onClick={handlePrimaryAction}
      testId="business-estate-primary-action"
    />
  ) : null;

  const notice = (
    <>
      {reviewNotice ? (
        <p className="business-estate-section-editor__review" role="status">
          Some earlier imported information may need your review. Edit any field,
          then save what you want to keep.
        </p>
      ) : null}
      {savedMessage ? (
        <p className="business-estate-section-editor__saved" role="status">
          {savedMessage}
        </p>
      ) : null}
    </>
  );

  return (
    <BusinessEstateRoomLayout
      header={
        <BusinessEstateRoomHeader
          title={title}
          purpose={purpose}
          statusLabel={businessEstateRoomStatusLabel(sectionStatus)}
          statusTone={businessEstateRoomStatusTone(sectionStatus)}
          onBack={handleBack}
          helpControl={helpControl}
          timeEstimate={estateRoomTimeEstimate(sectionId)}
        />
      }
      notice={notice}
      accordion={
        <BusinessEstateProgressOverview
          areaId={sectionId as GuidedStageAreaId}
          values={values}
          activeStageId={editingOpen ? focusStageId : null}
          onSelectStage={handleSelectStage}
          expandedContent={expandedContent}
          expandedFooter={expandedFooter}
        />
      }
      viewAction={
        mode === "view" ? (
          <BusinessEstatePrimaryAction
            label={primaryLabel()}
            onClick={handlePrimaryAction}
            testId="business-estate-edit-profile"
          />
        ) : null
      }
      perspective={
        <GetExpertHelpAction
          onOpen={onOpenExpertHelp}
          className="get-expert-help-action--in-area"
        />
      }
    />
  );
}
