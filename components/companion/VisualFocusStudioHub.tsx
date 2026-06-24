"use client";

import { useMemo } from "react";
import { BackButton } from "@/components/companion/BackButton";
import { ContinueThinkingCard } from "@/components/companion/ContinueThinkingCard";
import { VisualFocusStudioCardView } from "@/components/companion/VisualFocusStudioCard";
import { LibraryCloseButton } from "@/components/companion/LibraryOrientationChrome";
import {
  VISUAL_FOCUS_STUDIO_CARDS,
  VISUAL_FOCUS_STUDIO_HERO,
  VISUAL_FOCUS_WORK_WITH_SHARI,
} from "@/lib/visualFocus/studioCards";
import { listContinueThinkingMaps } from "@/lib/visualFocus/continueThinking";
import type { VisualFocusMap, VisualFocusMode } from "@/lib/visualFocus";

export function VisualFocusStudioHub({
  maps,
  onCreate,
  onOpenMap,
  onRemoveMap,
  onDeleteMap,
  onWorkWithShari,
  onBack,
  onClose,
}: {
  maps: VisualFocusMap[];
  onCreate: (mode: VisualFocusMode) => void;
  onOpenMap: (id: string) => void;
  onRemoveMap?: (id: string) => void;
  onDeleteMap?: (id: string) => void;
  onWorkWithShari?: () => void;
  onBack?: () => void;
  onClose?: () => void;
}) {
  const continueThinking = useMemo(
    () => listContinueThinkingMaps(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [maps],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-testid="visual-focus-studio-hub">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e7dfd4] pb-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold text-[#1f1c19] lg:text-3xl">
            {VISUAL_FOCUS_STUDIO_HERO.title}
          </h1>
          <p className="mt-1 text-base font-medium text-[#1f1c19]">
            {VISUAL_FOCUS_STUDIO_HERO.tagline}
          </p>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-[#6b635a]">
            {VISUAL_FOCUS_STUDIO_HERO.microCopy}
          </p>
          <p className="mt-4 text-lg font-semibold text-[#1e4f4f]">
            {VISUAL_FOCUS_STUDIO_HERO.question}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {onBack ? (
            <BackButton onClick={onBack} size="compact" label="Back" />
          ) : null}
          {onClose ? <LibraryCloseButton onClose={onClose} /> : null}
        </div>
      </div>

      {continueThinking.length > 0 ? (
        <section className="mt-6" data-testid="continue-thinking">
          <p className="text-xs font-bold uppercase tracking-wide text-[#1e4f4f]">
            Continue Thinking™
          </p>
          <p className="mt-1 text-sm text-[#6b635a]">
            Resume momentum — not storage. Up to three active maps. Use{" "}
            <span className="font-semibold text-[#1f1c19]">Remove</span> to free a
            slot (map stays in Saved™) or <span className="font-semibold text-[#9b2c2c]">Delete</span>{" "}
            to remove it permanently.
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
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
        </section>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-2">
        {VISUAL_FOCUS_STUDIO_CARDS.map((card) => (
          <VisualFocusStudioCardView
            key={card.mode}
            card={card}
            onCreate={() => onCreate(card.mode)}
          />
        ))}
      </div>

      {onWorkWithShari ? (
        <div
          className="mt-6 rounded-2xl border border-[#c5e0e0] bg-gradient-to-br from-[#f0f8f8] to-[#faf7f2] px-5 py-4"
          data-testid="visual-focus-shari-strip"
        >
          <p className="text-sm font-semibold text-[#1f1c19]">
            {VISUAL_FOCUS_WORK_WITH_SHARI.headline}
          </p>
          <p className="mt-1 text-sm text-[#6b635a]">
            {VISUAL_FOCUS_WORK_WITH_SHARI.body}
          </p>
          <button
            type="button"
            onClick={onWorkWithShari}
            className="mt-3 rounded-xl bg-[#1e4f4f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163c3c]"
          >
            {VISUAL_FOCUS_WORK_WITH_SHARI.actionLabel}
          </button>
        </div>
      ) : null}

      <p className="mt-8 text-sm text-[#9a8f82]">{VISUAL_FOCUS_STUDIO_HERO.footer}</p>
    </div>
  );
}
