"use client";

import { SETTINGS_TEXT } from "./settingsTokens";

type Props = {
  id: string;
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  valueLabel?: string;
  testId?: string;
};

export function SettingsSlider({
  id,
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  valueLabel,
  testId,
}: Props) {
  return (
    <div data-testid={testId ?? `settings-slider-${id}`}>
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={id}
          className={`text-sm font-semibold ${SETTINGS_TEXT.secondary}`}
        >
          {label}
        </label>
        <span className={`text-sm ${SETTINGS_TEXT.helper}`} aria-live="polite">
          {valueLabel ?? String(value)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        aria-valuetext={valueLabel ?? String(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[#1e4f4f]"
      />
    </div>
  );
}
