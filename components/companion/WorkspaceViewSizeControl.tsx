"use client";

import {
  VIEW_SIZE_PRESET_LABELS,
  type WorkspaceViewSizePreset,
} from "@/lib/workspaceViewSize";

const PRESET_ORDER: WorkspaceViewSizePreset[] = [
  "balanced",
  "chat-focus",
  "workspace-focus",
];

export function WorkspaceViewSizeControl({
  value,
  onChange,
}: {
  value: WorkspaceViewSizePreset;
  onChange: (preset: WorkspaceViewSizePreset) => void;
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-1"
      role="group"
      aria-label="View size"
      data-testid="workspace-view-size-control"
    >
      <span className="hidden text-xs font-semibold text-[#6b635a] sm:inline">
        View:
      </span>
      {PRESET_ORDER.map((preset) => {
        const active = preset === value;
        return (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            aria-pressed={active}
            data-testid={`view-size-${preset}`}
            className={`rounded-lg px-2 py-1 text-xs font-semibold transition-colors ${
              active
                ? "bg-[#1e4f4f]/15 text-[#1e4f4f]"
                : "text-[#1e4f4f] hover:bg-[#1e4f4f]/10"
            }`}
          >
            {VIEW_SIZE_PRESET_LABELS[preset]}
          </button>
        );
      })}
    </div>
  );
}
