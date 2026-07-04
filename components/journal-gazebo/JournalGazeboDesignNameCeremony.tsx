"use client";

import type { ReactNode } from "react";
import { JOURNAL_NAME_SUGGESTIONS } from "@/lib/journalGazebo/catalog";
import type { CoverTitleTone } from "@/lib/journalGazebo/coverTitleContrast";
import type { JournalLeatherColor } from "@/lib/journalGazebo/types";
import { JournalCoverEmbossInput } from "./JournalCoverEmbossInput";

type Props = {
  value: string;
  onChange: (value: string) => void;
  titleTone: CoverTitleTone;
  leatherColor?: JournalLeatherColor;
  nav?: ReactNode;
};

/** Parchment naming ceremony — embossed title on the gold plaque. */
export function JournalGazeboDesignNameCeremony({
  value,
  onChange,
  titleTone,
  leatherColor,
  nav,
}: Props) {
  const trimmed = value.trim();

  return (
    <div
      className="jg-design-name-ceremony"
      data-title-tone={titleTone}
      data-leather={leatherColor}
    >
      <div className="jg-design-name-ceremony__folio jg-design-name-plaque">
        <span
          className="jg-design-name-plaque__nail jg-design-name-plaque__nail--tl"
          aria-hidden="true"
        />
        <span
          className="jg-design-name-plaque__nail jg-design-name-plaque__nail--tr"
          aria-hidden="true"
        />
        <span
          className="jg-design-name-plaque__nail jg-design-name-plaque__nail--bl"
          aria-hidden="true"
        />
        <span
          className="jg-design-name-plaque__nail jg-design-name-plaque__nail--br"
          aria-hidden="true"
        />
        <p className="jg-design-name-plaque__kicker">Name your journal</p>
        <div className="jg-design-name-ceremony__emboss-stage">
          <JournalCoverEmbossInput
            id="jg-design-journal-name"
            value={value}
            onChange={onChange}
            label="Journal name"
            autoFocus
            variant="studio"
            tone="on-dark"
          />
        </div>
      </div>

      {nav ? <div className="jg-design-name-ceremony__nav">{nav}</div> : null}

      <div
        className="jg-design-name-ceremony__suggestions"
        role="group"
        aria-label="Journal name suggestions"
      >
        {JOURNAL_NAME_SUGGESTIONS.map((suggestion) => {
          const active = trimmed === suggestion;
          return (
            <button
              key={suggestion}
              type="button"
              className={[
                "jg-design-name-ceremony__suggestion",
                "jg-design-name-plaque",
                "jg-design-name-plaque--suggestion",
                active ? "jg-design-name-plaque--suggestion-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onChange(suggestion)}
              aria-pressed={active}
            >
              {suggestion}
            </button>
          );
        })}
      </div>
    </div>
  );
}
