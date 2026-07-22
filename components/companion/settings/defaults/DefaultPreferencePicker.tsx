"use client";

import type { DefaultOption } from "@/lib/connections";

type Props<T extends string> = {
  options: DefaultOption<T>[];
  currentId: T;
  onSelect: (id: T) => void;
  onConnectToUse?: (id: T) => void;
  testIdPrefix: string;
};

/**
 * Expanded choices for a Defaults group — only available options.
 */
export function DefaultPreferencePicker<T extends string>({
  options,
  currentId,
  onSelect,
  onConnectToUse,
  testIdPrefix,
}: Props<T>) {
  return (
    <ul className="flex flex-col gap-2" role="listbox" aria-label="Choose a default">
      {options.map((option) => {
        const selected = option.id === currentId && option.selectable;
        return (
          <li key={option.id}>
            {option.selectable ? (
              <button
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => onSelect(option.id)}
                className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f] ${
                  selected
                    ? "border-[#1e4f4f] bg-[#1e4f4f]/[0.06] text-[#1f1c19]"
                    : "border-[#d4cdc3] bg-white text-[#1f1c19] hover:border-[#1e4f4f]/45"
                }`}
                data-testid={`${testIdPrefix}-option-${option.id}`}
              >
                {option.label}
                {selected ? (
                  <span className="ml-2 text-[#1e4f4f]" aria-hidden="true">
                    ✓
                  </span>
                ) : null}
              </button>
            ) : option.connectToUse ? (
              <button
                type="button"
                onClick={() => onConnectToUse?.(option.id)}
                className="w-full rounded-lg border border-dashed border-[#c9bfb0] bg-[#faf7f2] px-3 py-2.5 text-left text-sm font-semibold text-[#6b635a] hover:border-[#1e4f4f]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
                data-testid={`${testIdPrefix}-connect-${option.id}`}
              >
                {option.label} — Connect to use
              </button>
            ) : (
              <p
                className="rounded-lg border border-[#ece6dc] bg-[#faf7f2] px-3 py-2.5 text-sm text-[#9a8f82]"
                data-testid={`${testIdPrefix}-unavailable-${option.id}`}
              >
                {option.label}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
