"use client";

import type { CSSProperties } from "react";
import type { JournalNameSuggestion } from "@/lib/journalGazebo/catalog";

type Props = {
  suggestions: readonly JournalNameSuggestion[];
  activeTitle: string | null;
  onSelect: (title: string) => void;
  onHover: (title: string | null) => void;
  disabled?: boolean;
};

/**
 * Leather book spines beside the closed journal — not buttons in a grid.
 */
export function JournalGazeboTitleSpines({
  suggestions,
  activeTitle,
  onSelect,
  onHover,
  disabled = false,
}: Props) {
  return (
    <ul className="jg-title-spines" aria-label="Journal title suggestions">
      {suggestions.map((title, index) => (
        <li key={title} className="jg-title-spines__item">
          <button
            type="button"
            className={[
              "jg-title-spine",
              activeTitle === title ? "jg-title-spine--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ "--spine-index": index } as CSSProperties}
            disabled={disabled}
            onMouseEnter={() => onHover(title)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(title)}
            onBlur={() => onHover(null)}
            onClick={() => onSelect(title)}
          >
            <span className="jg-title-spine__edge" aria-hidden="true" />
            <span className="jg-title-spine__face">
              <span className="jg-title-spine__label">{title}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
