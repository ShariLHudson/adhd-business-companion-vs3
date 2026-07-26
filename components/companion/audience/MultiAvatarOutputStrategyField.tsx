"use client";

import {
  MULTI_AVATAR_OUTPUT_MODES,
  OUTPUT_MODE_LABELS,
  type MultiAvatarOutputMode,
} from "@/lib/audienceSelection";

/**
 * MultiAvatarOutputStrategyField — how to produce output when several audiences
 * are chosen. Natural language only. The parent renders this only when more
 * than one audience actually resolves (outputStrategyApplies).
 */
export type MultiAvatarOutputStrategyFieldProps = {
  value: MultiAvatarOutputMode;
  onChange: (mode: MultiAvatarOutputMode) => void;
};

export function MultiAvatarOutputStrategyField({
  value,
  onChange,
}: MultiAvatarOutputStrategyFieldProps) {
  return (
    <div data-testid="multi-avatar-output-strategy">
      <p className="text-sm font-semibold text-[#1f1c19]">
        You picked more than one audience. How should I handle it?
      </p>
      <div className="mt-2 flex flex-col gap-1.5">
        {MULTI_AVATAR_OUTPUT_MODES.map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            aria-pressed={value === mode}
            data-testid={`output-mode-${mode}`}
            className={`rounded-xl border px-3 py-2 text-left text-sm font-medium transition-colors ${
              value === mode
                ? "border-[#1e4f4f] bg-[#1e4f4f]/8 text-[#1f1c19]"
                : "border-[#d4cdc3] bg-white text-[#4b463f] hover:border-[#1e4f4f]"
            }`}
          >
            {OUTPUT_MODE_LABELS[mode]}
          </button>
        ))}
      </div>
    </div>
  );
}
