"use client";

import {
  creationSaveStateTone,
  labelForCreationSaveState,
  type CreationSaveState,
} from "@/lib/creationDurable";

export function CreationSaveStateBadge({
  state,
}: {
  state: CreationSaveState;
}) {
  const label = labelForCreationSaveState(state);
  if (!label) return null;
  const tone = creationSaveStateTone(state);
  const toneClass =
    tone === "success"
      ? "border-[#b7cfc7] bg-[#eef6f3] text-[#1e4f4f]"
      : tone === "progress"
        ? "border-[#c9bfb0] bg-[#faf7f2] text-[#4b463f]"
        : tone === "caution"
          ? "border-[#c9a27a] bg-[#fff8f0] text-[#5c4030]"
          : "border-[#e7dfd4] bg-[#faf7f2] text-[#6b635a]";

  return (
    <p
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold tracking-wide ${toneClass}`}
      data-testid="creation-save-state"
      data-save-state={state}
      role="status"
      aria-live="polite"
    >
      {label}
    </p>
  );
}
