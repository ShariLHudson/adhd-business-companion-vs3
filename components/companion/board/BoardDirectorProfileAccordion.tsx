"use client";

import {
  getDirectorAccordionSections,
  type BoardDirectorAccordionSectionId,
} from "@/lib/board/directorAccordion";
import type { BoardDirectorDefinition } from "@/lib/board/types";
import "@/app/companion/board-director-meet.css";

type Props = {
  director: BoardDirectorDefinition;
  openSectionId: BoardDirectorAccordionSectionId | null;
  onToggleSection: (id: BoardDirectorAccordionSectionId) => void;
  disabled?: boolean;
};

/**
 * Shared Director profile accordion — same implementation for every Director.
 * Only one panel open at a time; last open id remembered by parent session store.
 */
export function BoardDirectorProfileAccordion({
  director,
  openSectionId,
  onToggleSection,
  disabled = false,
}: Props) {
  const sections = getDirectorAccordionSections(director);

  return (
    <div
      className="board-director-accordion"
      data-testid={`board-director-accordion-${director.id}`}
    >
      {sections.map((section) => {
        const open = openSectionId === section.id;
        const panelId = `board-director-accordion-panel-${director.id}-${section.id}`;
        const headerId = `board-director-accordion-header-${director.id}-${section.id}`;
        return (
          <div
            key={section.id}
            className={`board-director-accordion__item${
              open ? " board-director-accordion__item--open" : ""
            }`}
          >
            <button
              type="button"
              id={headerId}
              className="board-director-accordion__toggle"
              aria-expanded={open}
              aria-controls={panelId}
              data-testid={`board-director-accordion-toggle-${section.id}`}
              disabled={disabled}
              onClick={() => onToggleSection(section.id)}
            >
              <span className="board-director-accordion__toggle-copy">
                <span className="board-director-accordion__title">
                  {section.title}
                </span>
                {!open ? (
                  <span className="board-director-accordion__preview">
                    {section.preview}
                  </span>
                ) : null}
              </span>
              <span
                className="board-director-accordion__chevron"
                aria-hidden
                data-expanded={open ? "true" : "false"}
              >
                {open ? "▾" : "▸"}
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              hidden={!open}
              className="board-director-accordion__panel"
            >
              {section.bodyLines.length === 1 ? (
                <p className="board-director-accordion__text">
                  {section.bodyLines[0]}
                </p>
              ) : (
                <ul className="board-director-accordion__list">
                  {section.bodyLines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
