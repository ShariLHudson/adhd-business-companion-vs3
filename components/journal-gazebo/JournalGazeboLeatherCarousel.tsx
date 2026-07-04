"use client";

import { useCallback, useRef } from "react";
import { JOURNAL_LEATHER_OPTIONS } from "@/lib/journalGazebo/catalog";
import type { JournalLeatherColor } from "@/lib/journalGazebo/types";
import { JournalGazeboHeroJournal } from "./JournalGazeboHeroJournal";
import type { JournalGazeboConfig } from "@/lib/journalGazebo/types";

type Props = {
  config: JournalGazeboConfig;
  colorIndex: number;
  onColorIndexChange: (index: number) => void;
  onChoose: (color: JournalLeatherColor) => void;
  choosing?: boolean;
};

/** One heirloom journal — leather color shifts like paint samples. */
export function JournalGazeboLeatherCarousel({
  config,
  colorIndex,
  onColorIndexChange,
  onChoose,
  choosing = false,
}: Props) {
  const touchStartX = useRef<number | null>(null);
  const option = JOURNAL_LEATHER_OPTIONS[colorIndex]!;
  const total = JOURNAL_LEATHER_OPTIONS.length;

  const goPrev = useCallback(() => {
    onColorIndexChange((colorIndex - 1 + total) % total);
  }, [colorIndex, onColorIndexChange, total]);

  const goNext = useCallback(() => {
    onColorIndexChange((colorIndex + 1) % total);
  }, [colorIndex, onColorIndexChange, total]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start == null) return;
    const end = e.changedTouches[0]?.clientX ?? start;
    const delta = end - start;
    if (Math.abs(delta) < 40) return;
    if (delta > 0) goPrev();
    else goNext();
  }

  return (
    <div
      className={[
        "jg-leather-carousel",
        choosing ? "jg-leather-carousel--choosing" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        type="button"
        className="jg-leather-carousel__nav jg-leather-carousel__nav--prev"
        onClick={goPrev}
        aria-label="Previous leather color"
      >
        <span aria-hidden="true" />
      </button>

      <button
        type="button"
        className="jg-leather-carousel__journal-hit"
        onClick={() => onChoose(option.id)}
        aria-label={`Choose ${option.label} leather`}
      >
        <JournalGazeboHeroJournal
          config={{ ...config, leatherColor: option.id, showSparkFlame: true }}
          moment="closed"
          cinematic
          ceremony
          heirloom
          onDesk
          showCoverTitle={false}
        />
      </button>

      <button
        type="button"
        className="jg-leather-carousel__nav jg-leather-carousel__nav--next"
        onClick={goNext}
        aria-label="Next leather color"
      >
        <span aria-hidden="true" />
      </button>

      <p className="jg-leather-carousel__swatch-name" aria-live="polite">
        <span className="jg-leather-carousel__color">{option.label}</span>
        <span className="jg-leather-carousel__texture">{option.textureLabel}</span>
      </p>
    </div>
  );
}
