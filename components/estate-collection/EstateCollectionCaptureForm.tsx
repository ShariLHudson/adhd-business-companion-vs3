"use client";

import { GrowthMicButton } from "@/components/companion/GrowthMicButton";
import { GrowthAttachmentsField } from "@/components/companion/GrowthAttachmentsField";
import type { GrowthAttachment } from "@/lib/growthAttachments";
import type {
  EstateCollectionCaptureConfig,
  EstateCollectionCaptureField,
  EstateCollectionCaptureValues,
} from "@/lib/estate/collectionFramework/types";
import { isCaptureValid } from "@/lib/estate/collectionFramework/captureUtils";

type Props = {
  roomId: string;
  capture: EstateCollectionCaptureConfig;
  values: EstateCollectionCaptureValues;
  onChange: (values: EstateCollectionCaptureValues) => void;
  onSave: () => void;
  onCancelEdit?: () => void;
  statusMessage?: string | null;
  editingId?: string | null;
  attachments?: GrowthAttachment[];
  onAttachmentsChange?: (attachments: GrowthAttachment[]) => void;
};

function renderFieldInput(
  roomId: string,
  field: EstateCollectionCaptureField,
  value: string,
  onFieldChange: (value: string) => void,
) {
  const fieldId = `collection-compose-${roomId}-${field.id}`;
  const kind = field.kind ?? "textarea";

  if (kind === "select" && field.options?.length) {
    return (
      <select
        id={fieldId}
        className="estate-collection-panel__select"
        value={value}
        onChange={(event) => onFieldChange(event.target.value)}
      >
        <option value="">Choose…</option>
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (kind === "date") {
    return (
      <input
        id={fieldId}
        type="date"
        className="estate-collection-panel__date"
        value={value}
        onChange={(event) => onFieldChange(event.target.value)}
      />
    );
  }

  if (kind === "text") {
    return (
      <input
        id={fieldId}
        type="text"
        className="estate-collection-panel__text"
        value={value}
        placeholder={field.placeholder}
        onChange={(event) => onFieldChange(event.target.value)}
      />
    );
  }

  return (
    <div className="estate-collection-panel__capture-input">
      <GrowthMicButton
        value={value}
        onChange={onFieldChange}
        className="estate-collection-panel__mic"
      />
      <textarea
        id={fieldId}
        className={[
          "estate-collection-panel__textarea",
          field.primary ? "estate-collection-panel__textarea--primary" : "",
        ].join(" ")}
        value={value}
        onChange={(event) => onFieldChange(event.target.value)}
        placeholder={field.placeholder}
        rows={field.rows ?? (field.primary ? 10 : 5)}
      />
    </div>
  );
}

/** Shared compose area — large writing surface, per-room questions from config. */
export function EstateCollectionCaptureForm({
  roomId,
  capture,
  values,
  onChange,
  onSave,
  onCancelEdit,
  statusMessage,
  editingId,
  attachments = [],
  onAttachmentsChange,
}: Props) {
  const canSave = isCaptureValid(capture.fields, values);
  const saveLabel = editingId
    ? (capture.updateLabel ?? capture.saveLabel)
    : capture.saveLabel;

  function setField(id: string, value: string) {
    onChange({ ...values, [id]: value });
  }

  const sortedFields = [...capture.fields].sort((a, b) => {
    if (a.primary && !b.primary) return -1;
    if (!a.primary && b.primary) return 1;
    return 0;
  });

  const visibleFields =
    capture.discoveryPreserveMode && !editingId
      ? sortedFields.filter((field) => field.primary)
      : sortedFields;

  return (
    <section
      className="estate-collection-panel__capture"
      aria-label={capture.composeTitle ?? "Compose"}
    >
      {capture.composeTitle ? (
        <h2 className="estate-collection-panel__compose-title">
          {editingId
            ? (capture.updateLabel ?? capture.composeTitle)
            : capture.composeTitle}
        </h2>
      ) : null}

      {visibleFields.map((field) => {
        const fieldId = `collection-compose-${roomId}-${field.id}`;
        const useTextareaWrap =
          (field.kind ?? "textarea") === "textarea" && field.primary;

        return (
          <div
            key={field.id}
            className={[
              "estate-collection-panel__capture-field",
              field.primary ? "estate-collection-panel__capture-field--primary" : "",
            ].join(" ")}
          >
            <label
              className="estate-collection-panel__capture-label"
              htmlFor={fieldId}
            >
              {field.label}
            </label>
            {useTextareaWrap
              ? renderFieldInput(roomId, field, values[field.id] ?? "", (v) =>
                  setField(field.id, v),
                )
              : renderFieldInput(roomId, field, values[field.id] ?? "", (v) =>
                  setField(field.id, v),
                )}
          </div>
        );
      })}

      {capture.enableAttachments && onAttachmentsChange ? (
        <GrowthAttachmentsField
          attachments={attachments}
          onChange={onAttachmentsChange}
          label={capture.attachmentLabel}
        />
      ) : null}

      <div className="estate-collection-panel__capture-actions">
        <button
          type="button"
          className="estate-collection-panel__save"
          disabled={!canSave}
          onClick={onSave}
        >
          {saveLabel}
        </button>
        {editingId && onCancelEdit ? (
          <button
            type="button"
            className="estate-collection-panel__cancel-edit"
            onClick={onCancelEdit}
          >
            Start fresh
          </button>
        ) : null}
        {statusMessage ? (
          <div className="estate-collection-panel__status-block" role="status">
            {statusMessage.split("\n\n").map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="estate-collection-panel__status">
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
