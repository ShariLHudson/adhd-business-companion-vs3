"use client";

import { NO_CATEGORY } from "@/lib/categoryRevealUx";

export type CategoryOption<T extends string = string> = {
  value: T;
  label: string;
};

type CategoryPickerSelectProps<T extends string> = {
  label: string;
  value: T | typeof NO_CATEGORY;
  onChange: (value: T | typeof NO_CATEGORY) => void;
  options: CategoryOption<T>[];
  placeholder?: string;
  id?: string;
  className?: string;
  /** When true, only the text label is hidden — the select stays visible. */
  hideLabel?: boolean;
};

const SELECT_CLASS =
  "w-full rounded-lg border border-[#c9bfb0] bg-white px-3 py-2.5 text-base font-medium text-[#1f1c19] outline-none focus:border-[#1e4f4f]";

export function CategoryPickerSelect<T extends string>({
  label,
  value,
  onChange,
  options,
  placeholder = "Select…",
  id,
  className = "",
  hideLabel = false,
}: CategoryPickerSelectProps<T>) {
  const selectId = id ?? `category-picker-${label.replace(/\s+/g, "-").toLowerCase()}`;

  if (hideLabel) {
    return (
      <div className={className}>
        <label htmlFor={selectId} className="sr-only">
          {label}
        </label>
        <select
          id={selectId}
          value={value}
          aria-label={label}
          onChange={(e) =>
            onChange(
              e.target.value ? (e.target.value as T) : NO_CATEGORY,
            )
          }
          className={SELECT_CLASS}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <label
      htmlFor={selectId}
      className={`block text-xs font-bold uppercase tracking-wide text-[#6b635a] ${className}`}
    >
      {label}
      <select
        id={selectId}
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value ? (e.target.value as T) : NO_CATEGORY,
          )
        }
        className={`mt-1 ${SELECT_CLASS}`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
