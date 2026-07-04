"use client";

import { JOURNAL_WORKSHOP_PEN_OPTIONS } from "@/lib/journalGazebo/workshopCatalog";
import type { JournalPenStyle } from "@/lib/journalGazebo/types";

type Props = {
  selected?: JournalPenStyle | null;
  onSelect: (pen: JournalPenStyle) => void;
};

/** Writing instruments resting on the desk — click to choose. */
export function JournalGazeboDeskPens({ selected, onSelect }: Props) {
  return (
    <div className="jg-desk-pens" role="listbox" aria-label="Choose a writing instrument">
      {JOURNAL_WORKSHOP_PEN_OPTIONS.map((pen) => {
        const isSelected = selected === pen.id;
        return (
          <button
            key={pen.id}
            type="button"
            role="option"
            aria-selected={isSelected}
            className={[
              "jg-desk-pen",
              `jg-desk-pen--${pen.deskClass}`,
              isSelected ? "jg-desk-pen--chosen" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onSelect(pen.id)}
          >
            <span className="jg-desk-pen__body" aria-hidden="true" />
            <span className="jg-desk-pen__label">{pen.label}</span>
          </button>
        );
      })}
    </div>
  );
}
