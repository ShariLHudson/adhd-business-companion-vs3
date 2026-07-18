"use client";

import { SETTINGS_SURFACE, SETTINGS_TEXT } from "./settingsTokens";

export type SettingsDropdownOption = {
  value: string;
  label: string;
  description?: string;
};

type Props = {
  id: string;
  label: string;
  value: string;
  options: readonly SettingsDropdownOption[];
  onChange: (value: string) => void;
  description?: string;
  className?: string;
  testId?: string;
};

/** One choice from several — never a card stack. */
export function SettingsDropdown({
  id,
  label,
  value,
  options,
  onChange,
  description,
  className = "",
  testId,
}: Props) {
  const selected = options.find((o) => o.value === value);
  const shownDescription = description ?? selected?.description;

  return (
    <div
      className={`settings-dropdown ${className}`.trim()}
      data-testid={testId ?? `settings-dropdown-${id}`}
    >
      <label htmlFor={id} className={`block text-sm font-semibold ${SETTINGS_TEXT.secondary}`}>
        {label}
      </label>
      <select
        id={id}
        className={SETTINGS_SURFACE.field}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {shownDescription ? (
        <p
          className={`mt-2 text-sm leading-relaxed ${SETTINGS_TEXT.helper}`}
          data-testid={`${testId ?? `settings-dropdown-${id}`}-description`}
        >
          {shownDescription}
        </p>
      ) : null}
    </div>
  );
}
