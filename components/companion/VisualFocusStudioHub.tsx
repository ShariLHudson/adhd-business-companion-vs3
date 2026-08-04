"use client";

import { useMemo, useState } from "react";
import { BackButton } from "@/components/companion/BackButton";
import { ContinueThinkingCard } from "@/components/companion/ContinueThinkingCard";
import { VisualThinkingGuidancePanel } from "@/components/companion/VisualThinkingGuidancePanel";
import { VisualThinkingHomeBox } from "@/components/companion/VisualThinkingHomeBox";
import { LibraryCloseButton } from "@/components/companion/LibraryOrientationChrome";
import { listContinueThinkingMaps } from "@/lib/visualFocus/continueThinking";
import type { VisualFocusMap } from "@/lib/visualFocus";
import {
  listVisualThinkingHomeByCategory,
  type VisualThinkingHomeCategoryId,
  type VisualThinkingHomeTypeId,
} from "@/lib/visualThinkingHome";

export function VisualFocusStudioHub({
  maps,
  onOpenHomeType,
  onOpenMap,
  onRemoveMap,
  onDeleteMap,
  onWorkWithShari: _onWorkWithShari,
  onBack,
  onClose,
}: {
  maps: VisualFocusMap[];
  onOpenHomeType: (homeTypeId: VisualThinkingHomeTypeId) => void;
  onOpenMap: (id: string) => void;
  onRemoveMap?: (id: string) => void;
  onDeleteMap?: (id: string) => void;
  onWorkWithShari?: (context?: { fromHub?: boolean }) => void;
  onBack?: () => void;
  onClose?: () => void;
}) {
  const continueThinking = useMemo(
    () => listContinueThinkingMaps(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [maps],
  );
  const categories = listVisualThinkingHomeByCategory();
  const [continueOpen, setContinueOpen] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [openCategory, setOpenCategory] =
    useState<VisualThinkingHomeCategoryId | null>(null);

  function toggleCategory(category: VisualThinkingHomeCategoryId) {
    setOpenCategory((current) => (current === category ? null : category));
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-testid="visual-focus-studio-hub">
      {(onBack || onClose) ? (
        <div className="mb-4 flex shrink-0 flex-wrap items-center justify-end gap-2">
          {onBack ? (
            <BackButton onClick={onBack} size="compact" label="Back" />
          ) : null}
          {onClose ? <LibraryCloseButton onClose={onClose} /> : null}
        </div>
      ) : null}

      <VisualThinkingGuidancePanel
        onOpenHomeType={onOpenHomeType}
        onWorkWithShari={onWorkWithShari}
      />

      {continueThinking.length > 0 ? (
        <section className="mt-4" data-testid="continue-thinking">
          <button
            type="button"
            onClick={() => setContinueOpen((v) => !v)}
            aria-expanded={continueOpen}
            className="flex w-full items-center justify-between gap-2 rounded-xl border border-[#e7dfd4] bg-white/80 px-3.5 py-2.5 text-left hover:bg-[#faf7f2]"
          >
            <span className="text-sm font-semibold text-[#1f1c19]">
              {continueOpen ? "▼" : "▶"} Continue Thinking™ ({continueThinking.length})
            </span>
            <span className="text-xs text-[#6b635a]">Pick up where you left off</span>
          </button>
          {continueOpen ? (
            <div className="mt-3 flex flex-col gap-3">
              {continueThinking.map((map) => (
                <ContinueThinkingCard
                  key={map.id}
                  map={map}
                  onOpen={() => onOpenMap(map.id)}
                  onRemove={onRemoveMap ? () => onRemoveMap(map.id) : undefined}
                  onDelete={onDeleteMap ? () => onDeleteMap(map.id) : undefined}
                />
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="mt-4" data-testid="browse-visual-tools">
        <button
          type="button"
          onClick={() => setBrowseOpen((v) => !v)}
          aria-expanded={browseOpen}
          className="flex w-full items-center justify-between gap-2 rounded-xl border border-[#e7dfd4] bg-white/80 px-3.5 py-2.5 text-left hover:bg-[#faf7f2]"
        >
          <span className="text-sm font-semibold text-[#1f1c19]">
            {browseOpen ? "▼" : "▶"} Browse Visual Tools
          </span>
          <span className="text-xs text-[#6b635a]">All maps by category</span>
        </button>
        {browseOpen ? (
          <div className="mt-3 space-y-2">
            {categories.map((group) => {
              const expanded = openCategory === group.category;
              return (
                <div
                  key={group.category}
                  className="overflow-hidden rounded-xl border border-[#e7dfd4] bg-white"
                  data-testid={`visual-thinking-category-${group.category}`}
                >
                  <button
                    type="button"
                    onClick={() => toggleCategory(group.category)}
                    aria-expanded={expanded}
                    className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left hover:bg-[#faf7f2]/80"
                  >
                    <span className="text-sm text-[#9a8f82]" aria-hidden>
                      {expanded ? "▼" : "▶"}
                    </span>
                    <span className="text-sm font-semibold text-[#1f1c19]">
                      {group.label}
                    </span>
                    <span className="ml-auto text-xs text-[#9a8f82]">
                      {group.types.length}
                    </span>
                  </button>
                  {expanded ? (
                    <ul className="border-t border-[#efe8de] p-2">
                      {group.types.map((type) => (
                        <li key={type.id} className="p-1">
                          <VisualThinkingHomeBox
                            type={type}
                            compact
                            onOpen={() => onOpenHomeType(type.id)}
                          />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </section>
    </div>
  );
}
