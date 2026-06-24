"use client";

import {
  INTELLIGENCE_VIEW_MODE_LABELS,
  type IntelligenceViewMode,
} from "@/lib/visualFocus/intelligence/themes";

export function IntelligenceViewModeToggle({
  mode,
  onChange,
}: {
  mode: IntelligenceViewMode;
  onChange: (mode: IntelligenceViewMode) => void;
}) {
  const modes: IntelligenceViewMode[] = [
    "canvas-intelligence",
    "canvas-only",
    "intelligence-only",
  ];

  return (
    <div
      className="flex flex-wrap gap-1 rounded-xl border border-[#e7dfd4] bg-white p-1"
      role="group"
      aria-label="Intelligence view mode"
      data-testid="intelligence-view-mode"
    >
      {modes.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            mode === m
              ? "bg-[#1e4f4f] text-white"
              : "text-[#6b635a] hover:bg-[#faf7f2]"
          }`}
          aria-pressed={mode === m}
        >
          {INTELLIGENCE_VIEW_MODE_LABELS[m]}
        </button>
      ))}
    </div>
  );
}
