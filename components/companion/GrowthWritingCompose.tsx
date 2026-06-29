"use client";

import { GrowthMicButton } from "@/components/companion/GrowthMicButton";

type GrowthWritingComposeProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
  saveLabel: string;
  onSave: () => void;
  saveDisabled?: boolean;
  statusMessage?: string | null;
  statusRole?: "status" | "alert";
};

/** Universal Growth writing card — matches Journal layout. */
export function GrowthWritingCompose({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
  saveLabel,
  onSave,
  saveDisabled,
  statusMessage,
  statusRole = "status",
}: GrowthWritingComposeProps) {
  return (
    <div className="journal-room__compose">
      <div className="journal-room__compose-field">
        <label className="sr-only" htmlFor={id}>
          {label}
        </label>
        <GrowthMicButton
          value={value}
          onChange={onChange}
          className="journal-room__mic"
        />
        <textarea
          id={id}
          className="journal-room__textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
        />
      </div>
      <div className="journal-room__compose-actions">
        <button
          type="button"
          className="journal-room__save"
          disabled={saveDisabled ?? !value.trim()}
          onClick={onSave}
        >
          {saveLabel}
        </button>
        {statusMessage ? (
          <span className="journal-room__saved-note" role={statusRole}>
            {statusMessage}
          </span>
        ) : null}
      </div>
    </div>
  );
}
