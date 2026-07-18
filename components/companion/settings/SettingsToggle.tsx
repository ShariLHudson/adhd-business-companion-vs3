"use client";

import { SETTINGS_TEXT } from "./settingsTokens";

type Props = {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  testId?: string;
};

export function SettingsToggle({
  id,
  label,
  checked,
  onChange,
  description,
  testId,
}: Props) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3"
      data-testid={testId ?? `settings-toggle-${id}`}
    >
      <input
        id={id}
        type="checkbox"
        className="mt-1 h-5 w-5 accent-[#1e4f4f]"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-describedby={description ? `${id}-desc` : undefined}
      />
      <span>
        <span className={`block text-sm font-semibold ${SETTINGS_TEXT.secondary}`}>
          {label}
        </span>
        {description ? (
          <span
            id={`${id}-desc`}
            className={`mt-0.5 block text-sm ${SETTINGS_TEXT.helper}`}
          >
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}
