"use client";

import { useEffect, useState } from "react";
import {
  JOURNAL_WORKSHOP_PAPER_NEXT,
  JOURNAL_WORKSHOP_PAPER_SPARK,
} from "@/lib/journalGazebo/hospitality";
import { JOURNAL_WORKSHOP_PAPER_OPTIONS } from "@/lib/journalGazebo/workshopCatalog";
import { playJournalPageTurnSound } from "@/lib/journalGazebo/ritualSounds";

type Props = {
  paperIndex: number;
  onIndexChange: (index: number) => void;
  onChoose: () => void;
};

/** One paper spread at a time — pages physically turn between options. */
export function JournalGazeboPaperPicker({
  paperIndex,
  onIndexChange,
  onChoose,
}: Props) {
  const [turning, setTurning] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(paperIndex);
  const option = JOURNAL_WORKSHOP_PAPER_OPTIONS[displayIndex]!;
  const isLast = paperIndex >= JOURNAL_WORKSHOP_PAPER_OPTIONS.length - 1;

  useEffect(() => {
    if (paperIndex === displayIndex) return;
    setTurning(true);
    playJournalPageTurnSound(520);
    const timer = window.setTimeout(() => {
      setDisplayIndex(paperIndex);
      setTurning(false);
    }, 520);
    return () => window.clearTimeout(timer);
  }, [paperIndex, displayIndex]);

  function nextPaper() {
    if (turning || isLast) return;
    onIndexChange(paperIndex + 1);
  }

  return (
    <div className="jg-paper-picker">
      <div
        className={[
          "jg-paper-picker__spread-wrap",
          turning ? "jg-paper-picker__spread-wrap--turning" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div
          className={[
            "jg-paper-picker__spread",
            `jg-paper-picker__spread--${option.texture}`,
          ].join(" ")}
          data-paper-texture={option.texture}
        >
          <p className="jg-paper-picker__label">{option.label}</p>
        </div>
      </div>
      <div className="jg-paper-picker__actions">
        {!isLast ? (
          <button
            type="button"
            className="jg-workshop__choice"
            onClick={nextPaper}
            disabled={turning}
          >
            {JOURNAL_WORKSHOP_PAPER_NEXT}
          </button>
        ) : (
          <button
            type="button"
            className="jg-workshop__choice"
            onClick={onChoose}
            disabled={turning}
          >
            This one
          </button>
        )}
      </div>
    </div>
  );
}
