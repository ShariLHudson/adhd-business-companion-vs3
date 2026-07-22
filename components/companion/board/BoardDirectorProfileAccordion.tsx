"use client";

import { useState } from "react";
import {
  getDirectorMoreAccordionSections,
  getDirectorPrimaryAccordionSections,
  type BoardDirectorAccordionSection,
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

function AccordionSectionList({
  director,
  sections,
  openSectionId,
  onToggleSection,
  disabled,
}: {
  director: BoardDirectorDefinition;
  sections: BoardDirectorAccordionSection[];
  openSectionId: BoardDirectorAccordionSectionId | null;
  onToggleSection: (id: BoardDirectorAccordionSectionId) => void;
  disabled?: boolean;
}) {
  return (
    <>
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
              <span
                className={`board-director-accordion__icon board-director-accordion__icon--${section.id}`}
                aria-hidden
              />
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
    </>
  );
}

/**
 * Shared Director profile accordion — three overview sections first,
 * deeper material under More About This Director.
 */
export function BoardDirectorProfileAccordion({
  director,
  openSectionId,
  onToggleSection,
  disabled = false,
}: Props) {
  const [moreOpen, setMoreOpen] = useState(false);
  const primary = getDirectorPrimaryAccordionSections(director);
  const more = getDirectorMoreAccordionSections(director);

  return (
    <div
      className="board-director-accordion"
      data-testid={`board-director-accordion-${director.id}`}
    >
      <AccordionSectionList
        director={director}
        sections={primary}
        openSectionId={openSectionId}
        onToggleSection={onToggleSection}
        disabled={disabled}
      />

      <div className="board-director-accordion__more">
        <button
          type="button"
          className="board-director-accordion__more-toggle"
          data-testid="board-director-accordion-more"
          aria-expanded={moreOpen}
          disabled={disabled}
          onClick={() => setMoreOpen((v) => !v)}
        >
          {moreOpen ? "Hide more about this Director" : "More About This Director"}
        </button>
        {moreOpen ? (
          <div
            className="board-director-accordion__more-panel"
            data-testid="board-director-accordion-more-panel"
          >
            <AccordionSectionList
              director={director}
              sections={more}
              openSectionId={openSectionId}
              onToggleSection={onToggleSection}
              disabled={disabled}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
