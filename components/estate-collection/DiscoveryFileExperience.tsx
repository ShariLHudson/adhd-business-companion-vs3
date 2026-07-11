"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { GrowthMicButton } from "@/components/companion/GrowthMicButton";
import { GrowthAttachmentsField } from "@/components/companion/GrowthAttachmentsField";
import type { GrowthAttachment } from "@/lib/growthAttachments";
import type {
  EstateCollectionCaptureConfig,
  EstateCollectionCaptureValues,
} from "@/lib/estate/collectionFramework/types";
import { detectDiscoverySectionSuggestions } from "@/lib/estate/discoveryFileListening";
import {
  DISCOVERY_FILE_LEFT_PAGE_TITLE,
  DISCOVERY_FILE_OPENING_PROMPT,
  DISCOVERY_FILE_OPTIONAL_SECTIONS,
  DISCOVERY_FILE_SAVE_LABEL,
  DISCOVERY_FILE_SAVED_MESSAGE,
  type DiscoverySectionId,
} from "@/lib/estate/discoveryFileSections";
import {
  EVIDENCE_VAULT_DISCOVERY_GUIDE_FIELDS,
  EVIDENCE_VAULT_POST_SAVE_NAV,
} from "@/lib/estate/evidenceVaultExperience";
import "./discovery-file.css";

export type DiscoveryFilePhase =
  | "folder"
  | "opening"
  | "open"
  | "saving"
  | "saved";

type Props = {
  capture: EstateCollectionCaptureConfig;
  values: EstateCollectionCaptureValues;
  onChange: (values: EstateCollectionCaptureValues) => void;
  attachments: GrowthAttachment[];
  onAttachmentsChange?: (attachments: GrowthAttachment[]) => void;
  onSave: () => void;
  onCancelEdit?: () => void;
  editingId?: string | null;
  phase: DiscoveryFilePhase;
  onPhaseChange: (phase: DiscoveryFilePhase) => void;
  lastSavedId?: string | null;
  onViewDiscovery?: (id: string) => void;
  onAddAnother?: () => void;
  onReturnToEstate?: () => void;
  chatPrefillNote?: string | null;
  onDismissChatPrefillNote?: () => void;
};

function fieldRows(capture: EstateCollectionCaptureConfig, fieldId: string) {
  return capture.fields.find((field) => field.id === fieldId)?.rows ?? 4;
}

/**
 * Evidence Vault — tactile Discovery File over the room plate.
 */
export function DiscoveryFileExperience({
  capture,
  values,
  onChange,
  attachments,
  onAttachmentsChange,
  onSave,
  onCancelEdit,
  editingId,
  phase,
  onPhaseChange,
  lastSavedId,
  onViewDiscovery,
  onAddAnother,
  onReturnToEstate,
  chatPrefillNote,
  onDismissChatPrefillNote,
}: Props) {
  const [expandedSections, setExpandedSections] = useState<Set<DiscoverySectionId>>(
    () => new Set(),
  );
  const [dismissedSuggestions, setDismissedSuggestions] = useState<
    Set<DiscoverySectionId>
  >(() => new Set());

  const guidedDiscovery = Boolean(capture.discoveryPreserveMode && !editingId);
  const story = guidedDiscovery
    ? EVIDENCE_VAULT_DISCOVERY_GUIDE_FIELDS.map(
        ({ fieldId }) => values[fieldId] ?? "",
      ).join("\n")
    : (values.situation ?? "");
  const canSave = guidedDiscovery
    ? EVIDENCE_VAULT_DISCOVERY_GUIDE_FIELDS.some(
        ({ fieldId }) => (values[fieldId] ?? "").trim().length > 0,
      )
    : story.trim().length > 0;

  const suggestions = useMemo(
    () =>
      detectDiscoverySectionSuggestions(story, expandedSections, values).filter(
        (section) => !dismissedSuggestions.has(section.id),
      ),
    [story, expandedSections, values, dismissedSuggestions],
  );

  useEffect(() => {
    if (phase !== "opening") return;
    const timer = window.setTimeout(() => onPhaseChange("open"), 720);
    return () => window.clearTimeout(timer);
  }, [phase, onPhaseChange]);

  useEffect(() => {
    if (phase !== "saving") return;
    const timer = window.setTimeout(() => onPhaseChange("saved"), 1400);
    return () => window.clearTimeout(timer);
  }, [phase, onPhaseChange]);

  const openFolder = useCallback(() => {
    onPhaseChange("opening");
  }, [onPhaseChange]);

  function setField(id: string, value: string) {
    onChange({ ...values, [id]: value });
  }

  function addSection(id: DiscoverySectionId) {
    setExpandedSections((current) => new Set([...current, id]));
    setDismissedSuggestions((current) => new Set([...current, id]));
  }

  function dismissSuggestion(id: DiscoverySectionId) {
    setDismissedSuggestions((current) => new Set([...current, id]));
  }

  function handlePreserve() {
    if (!canSave) return;
    if (editingId) {
      onSave();
      return;
    }
    onPhaseChange("saving");
    onSave();
  }

  const showPortfolio =
    phase === "opening" || phase === "open" || phase === "saving" || editingId;
  const showFolder = phase === "folder" && !editingId;
  const showSaved = phase === "saved";

  const saveDateLabel = new Date().toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className="discovery-file"
      data-phase={phase}
      data-testid="discovery-file-experience"
    >
      {showFolder ? (
        <div className="discovery-file__arrival" aria-label="Discovery File">
          <p className="discovery-file__arrival-prompt">{DISCOVERY_FILE_OPENING_PROMPT}</p>
          <button
            type="button"
            className="discovery-file__folder"
            onClick={openFolder}
            aria-label="Open today's Discovery File"
            data-testid="discovery-file-folder"
          >
            <span className="discovery-file__folder-spine" aria-hidden />
            <span className="discovery-file__folder-cover">
              <span className="discovery-file__folder-label">Discovery File</span>
            </span>
          </button>
        </div>
      ) : null}

      {showPortfolio ? (
        <div
          className={[
            "discovery-file__portfolio",
            phase === "saving" ? "discovery-file__portfolio--closing" : "",
          ].join(" ")}
          role="region"
          aria-label="Discovery File portfolio"
        >
          <div className="discovery-file__portfolio-inner">
            <div className="discovery-file__page discovery-file__page--left">
              <p className="discovery-file__page-kicker">{DISCOVERY_FILE_LEFT_PAGE_TITLE}</p>
              <p className="discovery-file__page-prompt">{DISCOVERY_FILE_OPENING_PROMPT}</p>
              {chatPrefillNote ? (
                <p className="discovery-file__prefill-note">{chatPrefillNote}</p>
              ) : null}
              {guidedDiscovery ? (
                <div
                  className="discovery-file__guide-fields"
                  aria-label="Guided discovery questions"
                >
                  {EVIDENCE_VAULT_DISCOVERY_GUIDE_FIELDS.map(({ question, fieldId }) => (
                    <div key={fieldId} className="discovery-file__guide-field">
                      <label
                        className="discovery-file__guide-label"
                        htmlFor={`discovery-guide-${fieldId}`}
                      >
                        {question}
                      </label>
                      <textarea
                        id={`discovery-guide-${fieldId}`}
                        className="discovery-file__guide-input"
                        value={values[fieldId] ?? ""}
                        onChange={(event) => setField(fieldId, event.target.value)}
                        placeholder="Write here…"
                        rows={fieldId === "situation" ? 4 : 3}
                        aria-label={question}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="discovery-file__story-wrap">
                  <GrowthMicButton
                    value={story}
                    onChange={(v) => setField("situation", v)}
                    className="discovery-file__mic"
                  />
                  <textarea
                    className="discovery-file__story"
                    value={values.situation ?? ""}
                    onChange={(event) => setField("situation", event.target.value)}
                    placeholder="Begin writing…"
                    rows={8}
                    aria-label="Today's discovery"
                  />
                </div>
              )}

              {suggestions.map((section) => (
                <div
                  key={section.id}
                  className="discovery-file__suggestion"
                  data-testid={`discovery-suggestion-${section.id}`}
                >
                  <p className="discovery-file__suggestion-title">{section.title}</p>
                  {section.suggestionMessage.split("\n").map((line) => (
                    <p key={line} className="discovery-file__suggestion-line">
                      {line}
                    </p>
                  ))}
                  <div className="discovery-file__suggestion-actions">
                    <button
                      type="button"
                      className="discovery-file__add-btn"
                      onClick={() => addSection(section.id)}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      className="discovery-file__dismiss-btn"
                      onClick={() => dismissSuggestion(section.id)}
                    >
                      Not now
                    </button>
                  </div>
                </div>
              ))}

              {DISCOVERY_FILE_OPTIONAL_SECTIONS.filter((section) =>
                expandedSections.has(section.id),
              ).map((section) => (
                <div key={section.id} className="discovery-file__section">
                  <p className="discovery-file__section-title">{section.title}</p>
                  <textarea
                    className="discovery-file__section-input"
                    value={values[section.fieldId] ?? ""}
                    onChange={(event) => setField(section.fieldId, event.target.value)}
                    placeholder={section.placeholder}
                    rows={fieldRows(capture, section.fieldId)}
                  />
                </div>
              ))}

              {capture.enableAttachments && onAttachmentsChange ? (
                <div className="discovery-file__attachments">
                  <GrowthAttachmentsField
                    attachments={attachments}
                    onChange={onAttachmentsChange}
                    label="Attachments"
                  />
                </div>
              ) : null}

              <div className="discovery-file__actions">
                <button
                  type="button"
                  className="discovery-file__preserve-btn"
                  disabled={!canSave || phase === "saving"}
                  onClick={handlePreserve}
                >
                  {DISCOVERY_FILE_SAVE_LABEL}
                </button>
                {editingId && onCancelEdit ? (
                  <button
                    type="button"
                    className="discovery-file__cancel-btn"
                    onClick={onCancelEdit}
                  >
                    Start fresh
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {phase === "saving" ? (
            <div className="discovery-file__ceremony" aria-hidden>
              <p className="discovery-file__date-stamp">{saveDateLabel}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      {showSaved ? (
        <div
          className="discovery-file__saved"
          role="status"
          data-testid="discovery-file-saved"
        >
          <p className="discovery-file__saved-message">{DISCOVERY_FILE_SAVED_MESSAGE}</p>
          <ul className="discovery-file__post-save">
            {EVIDENCE_VAULT_POST_SAVE_NAV.map((action) => (
              <li key={action.id}>
                <button
                  type="button"
                  className="discovery-file__post-save-btn"
                  onClick={() => {
                    if (action.id === "view" && lastSavedId) {
                      onViewDiscovery?.(lastSavedId);
                    } else if (action.id === "another") {
                      onAddAnother?.();
                    } else if (action.id === "estate") {
                      onReturnToEstate?.();
                    }
                  }}
                  disabled={
                    (action.id === "view" && !lastSavedId) ||
                    (action.id === "view" && !onViewDiscovery) ||
                    (action.id === "another" && !onAddAnother) ||
                    (action.id === "estate" && !onReturnToEstate)
                  }
                >
                  {action.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
