"use client";

import type { CreateBuilderAction } from "@/lib/createBuilderChat";

export function CreateBuilderActionBar({
  actions,
  onAction,
  disabled,
}: {
  actions: CreateBuilderAction[];
  onAction: (action: CreateBuilderAction) => void;
  disabled?: boolean;
}) {
  if (!actions.length) return null;

  return (
    <div
      className="mb-2 rounded-xl border border-[#1e4f4f]/20 bg-[#f0f5f5]/90 px-3 py-3"
      role="region"
      aria-label="Create builder actions"
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        {actions.map((action) => (
          <button
            key={`${action.id}-${action.label}`}
            type="button"
            disabled={disabled}
            onClick={() => onAction(action)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
              action.id === "create-draft" || action.id === "use-this"
                ? "bg-[#1e4f4f] text-white hover:bg-[#163a3a]"
                : "border border-[#1e4f4f]/30 bg-white text-[#1e4f4f] hover:bg-[#1e4f4f]/8"
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
