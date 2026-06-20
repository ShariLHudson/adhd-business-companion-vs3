"use client";

import { AudienceDropdownField } from "@/components/companion/AudienceDropdownField";
import { VoiceToneDropdownField } from "@/components/companion/VoiceToneDropdownField";
import {
  COMPANION_GENERATE_BTN_CLASS,
  COMPANION_SELECT_CLASS,
  COMPANION_SETUP_LABEL_CLASS,
  COMPANION_SETUP_ROW_CLASS,
} from "@/lib/companionFormControls";
import {
  getCustomAudienceName,
  getSelectedContentAudienceId,
} from "@/lib/contentAudience";

export type GenerateTypeOption = { value: string; label: string };

export function AudienceTypeGenerateBar({
  typeOptions,
  typeValue = "",
  onTypeChange,
  typeLabel = "Type",
  typePlaceholder = "Any type",
  typeShowPlaceholder = true,
  extraOptions,
  extraValue = "",
  onExtraChange,
  extraLabel = "Type",
  /** @deprecated Inline generate is always preferred — kept for API compatibility. */
  actionFullWidth = false,
  onGenerate,
  generating = false,
  generateLabel = "Generate",
}: {
  typeOptions?: GenerateTypeOption[];
  typeValue?: string;
  onTypeChange?: (value: string) => void;
  typeLabel?: string;
  typePlaceholder?: string;
  typeShowPlaceholder?: boolean;
  extraOptions?: GenerateTypeOption[];
  extraValue?: string;
  onExtraChange?: (value: string) => void;
  extraLabel?: string;
  actionFullWidth?: boolean;
  onGenerate: () => void;
  generating?: boolean;
  generateLabel?: string;
}) {
  const generateDisabled =
    generating ||
    (getSelectedContentAudienceId() === "custom" &&
      !getCustomAudienceName().trim());

  const generateBtn = (
    <button
      type="button"
      onClick={onGenerate}
      disabled={generateDisabled}
      className={
        actionFullWidth
          ? `${COMPANION_GENERATE_BTN_CLASS} mt-2 w-full basis-full`
          : COMPANION_GENERATE_BTN_CLASS
      }
    >
      {generating ? "…" : generateLabel}
    </button>
  );

  return (
    <div data-testid="audience-type-generate-bar">
      <div className={COMPANION_SETUP_ROW_CLASS}>
        <AudienceDropdownField />

        {typeOptions && onTypeChange ? (
          <label className="min-w-[7rem] flex-1">
            <span className={COMPANION_SETUP_LABEL_CLASS}>{typeLabel}</span>
            <select
              value={typeValue}
              onChange={(e) => onTypeChange(e.target.value)}
              className={`mt-0.5 ${COMPANION_SELECT_CLASS}`}
            >
              {typeShowPlaceholder ? (
                <option value="">{typePlaceholder}</option>
              ) : null}
              {typeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <VoiceToneDropdownField />
        )}

        {extraOptions && onExtraChange ? (
          <label className="min-w-[7rem] flex-1">
            <span className={COMPANION_SETUP_LABEL_CLASS}>{extraLabel}</span>
            <select
              value={extraValue}
              onChange={(e) => onExtraChange(e.target.value)}
              className={`mt-0.5 ${COMPANION_SELECT_CLASS}`}
            >
              {extraOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {!actionFullWidth ? generateBtn : null}
      </div>

      {actionFullWidth ? generateBtn : null}
    </div>
  );
}
