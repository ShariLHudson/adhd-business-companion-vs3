"use client";

import type { IdealClientAvatar } from "@/lib/companionStore";
import {
  AUDIENCE_MODE_LABELS,
  isAvatarCompleted,
  onlyDraftsAvailable,
  outputStrategyApplies,
  updateAudienceSelection,
  type AudienceSelection,
  type AudienceSelectionMode,
} from "@/lib/audienceSelection";
import { MultiAvatarOutputStrategyField } from "./MultiAvatarOutputStrategyField";

/**
 * AudienceSelectionField — the one reusable, optional, non-blocking audience
 * picker. Natural language only (no "mode" / "multi-select" wording). Phase 1
 * foundation: fully self-contained and controlled; not wired into any workspace.
 */
export type AudienceSelectionFieldProps = {
  value: AudienceSelection;
  onChange: (next: AudienceSelection) => void;
  avatars: IdealClientAvatar[];
  /** Offered (not forced) when the member has no avatars yet. */
  onCreateAvatar?: () => void;
  /** Deterministic timestamp for tests; defaults to now. */
  now?: string;
};

const MODE_ORDER: AudienceSelectionMode[] = [
  "none",
  "single",
  "multiple",
  "all",
];

export function AudienceSelectionField({
  value,
  onChange,
  avatars,
  onCreateAvatar,
  now,
}: AudienceSelectionFieldProps) {
  const hasAvatars = avatars.length > 0;

  // Every call here is an explicit member change, so the update helper stamps a
  // fresh lastUpdatedAt. Reads elsewhere never regenerate it.
  function commit(patch: Partial<AudienceSelection>) {
    onChange(updateAudienceSelection(value, patch, avatars, now));
  }

  function setMode(mode: AudienceSelectionMode) {
    commit({ selectionMode: mode, selectedAvatarIds: [] });
  }

  function chooseSingle(id: string) {
    commit({ selectionMode: "single", selectedAvatarIds: [id] });
  }

  function toggleMultiple(id: string) {
    const has = value.selectedAvatarIds.includes(id);
    commit({
      selectionMode: "multiple",
      selectedAvatarIds: has
        ? value.selectedAvatarIds.filter((x) => x !== id)
        : [...value.selectedAvatarIds, id],
    });
  }

  const availableModes = hasAvatars ? MODE_ORDER : (["none"] as const);
  const selectableAvatars = avatars; // always listed; drafts gated by includeDrafts

  return (
    <div
      className="rounded-2xl border border-[#d4cdc3] bg-white/80 p-4"
      data-testid="audience-selection-field"
    >
      <p className="text-sm font-semibold text-[#1f1c19]">Who is this for?</p>
      <p className="mt-0.5 text-xs text-[#6b635a]">
        Optional — you can create for a specific audience, or skip this.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {availableModes.map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setMode(mode)}
            aria-pressed={value.selectionMode === mode}
            data-testid={`audience-mode-${mode}`}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              value.selectionMode === mode
                ? "border-[#1e4f4f] bg-[#1e4f4f] text-white"
                : "border-[#c9bfb0] bg-white text-[#4b463f] hover:border-[#1e4f4f]"
            }`}
          >
            {AUDIENCE_MODE_LABELS[mode]}
          </button>
        ))}
      </div>

      {!hasAvatars ? (
        <div className="mt-3 rounded-xl bg-[#1e4f4f]/6 px-3 py-2 text-sm text-[#4b463f]">
          You don&apos;t have any Client Avatars yet. You can keep going with{" "}
          <strong>No specific audience</strong>
          {onCreateAvatar ? (
            <>
              {" "}
              or{" "}
              <button
                type="button"
                onClick={onCreateAvatar}
                className="font-semibold text-[#1e4f4f] underline"
                data-testid="audience-create-avatar"
              >
                Create a Client Avatar
              </button>
            </>
          ) : null}
          .
        </div>
      ) : null}

      {hasAvatars && onlyDraftsAvailable(avatars) && !value.includeDrafts ? (
        <p className="mt-3 text-sm italic text-[#9a8f82]" data-testid="only-drafts-note">
          Your avatars are still drafts. Turn on “Include draft avatars” to use
          one intentionally.
        </p>
      ) : null}

      {hasAvatars &&
      (value.selectionMode === "single" || value.selectionMode === "multiple") ? (
        <div className="mt-3 flex flex-col gap-2" data-testid="audience-avatar-list">
          {value.selectionMode === "multiple" ? (
            <div className="flex items-center justify-between text-xs text-[#6b635a]">
              <span data-testid="audience-selected-count">
                {value.selectedAvatarIds.length} selected
              </span>
              {value.selectedAvatarIds.length > 0 ? (
                <button
                  type="button"
                  onClick={() =>
                    commit({ selectedAvatarIds: [] })
                  }
                  className="font-semibold text-[#1e4f4f] hover:underline"
                  data-testid="audience-clear-selection"
                >
                  Clear Selection
                </button>
              ) : null}
            </div>
          ) : null}

          {selectableAvatars.map((a) => {
            const completed = isAvatarCompleted(a);
            const disabled = !completed && !value.includeDrafts;
            const selected = value.selectedAvatarIds.includes(a.id);
            return (
              <button
                key={a.id}
                type="button"
                disabled={disabled}
                onClick={() =>
                  value.selectionMode === "single"
                    ? chooseSingle(a.id)
                    : toggleMultiple(a.id)
                }
                aria-pressed={selected}
                data-testid={`audience-avatar-${a.id}`}
                className={`flex items-start justify-between gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
                  selected
                    ? "border-[#1e4f4f] bg-[#1e4f4f]/8"
                    : "border-[#d4cdc3] bg-white hover:border-[#1e4f4f]"
                } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[#1f1c19]">
                    {a.name?.trim() || "Untitled client"}
                  </span>
                  {a.who?.trim() ? (
                    <span className="mt-0.5 line-clamp-1 block text-xs text-[#6b635a]">
                      {a.who.trim()}
                    </span>
                  ) : null}
                </span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[0.68rem] font-semibold ${
                    completed
                      ? "bg-[#1e4f4f]/10 text-[#1e4f4f]"
                      : "bg-[#f3efe8] text-[#9a8f82]"
                  }`}
                >
                  {completed ? "Complete" : "Draft"}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {hasAvatars ? (
        <label className="mt-3 flex items-center gap-2 text-sm text-[#4b463f]">
          <input
            type="checkbox"
            checked={value.includeDrafts}
            onChange={(e) =>
              commit({ includeDrafts: e.target.checked })
            }
            data-testid="audience-include-drafts"
          />
          Include draft avatars
        </label>
      ) : null}

      {outputStrategyApplies(value, avatars) ? (
        <div className="mt-4 border-t border-[#e6ded2] pt-3">
          <MultiAvatarOutputStrategyField
            value={value.multiAvatarOutputMode}
            onChange={(mode) =>
              commit({ multiAvatarOutputMode: mode })
            }
          />
        </div>
      ) : null}
    </div>
  );
}
