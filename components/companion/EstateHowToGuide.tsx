"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { EstateHowToGuideContent } from "@/lib/estateRoomGuides/types";
import "@/app/companion/estate-how-to-guide.css";

type Props = {
  content: EstateHowToGuideContent;
  open: boolean;
  onClose: () => void;
  onPrimaryAction?: () => void;
};

/**
 * Shared Estate How to Use overlay — collapsible sections, optional comparison,
 * primary action, keyboard + screen-reader friendly. Does not navigate away.
 */
export function EstateHowToGuide({
  content,
  open,
  onClose,
  onPrimaryAction,
}: Props) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [openSectionId, setOpenSectionId] = useState<string | null>(
    content.sections[0]?.id ?? null,
  );

  useEffect(() => {
    if (!open) return;
    setOpenSectionId(content.sections[0]?.id ?? null);
    const t = window.setTimeout(() => closeRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open, content.sections]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function toggleSection(id: string) {
    setOpenSectionId((prev) => (prev === id ? null : id));
  }

  return (
    <div
      className="estate-how-to-guide"
      data-testid={`estate-how-to-guide-${content.id}`}
      data-guide-id={content.id}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="estate-how-to-guide__surface">
        <header className="estate-how-to-guide__header">
          <div className="estate-how-to-guide__header-copy">
            <h2 id={titleId} className="estate-how-to-guide__title">
              {content.title}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="estate-how-to-guide__close"
            onClick={onClose}
            data-testid={`estate-how-to-guide-close-${content.id}`}
            aria-label="Close How to Use guide"
          >
            Close
          </button>
        </header>

        <div className="estate-how-to-guide__scroll">
          <div className="estate-how-to-guide__welcome">
            {content.welcome.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div
            className="estate-how-to-guide__sections"
            data-testid="estate-how-to-sections"
          >
            {content.sections.map((section) => {
              const expanded = openSectionId === section.id;
              const panelId = `estate-how-to-panel-${content.id}-${section.id}`;
              const headerId = `estate-how-to-header-${content.id}-${section.id}`;
              return (
                <div
                  key={section.id}
                  className={`estate-how-to-guide__section${
                    expanded ? " estate-how-to-guide__section--open" : ""
                  }`}
                  data-testid={`estate-how-to-section-${section.id}`}
                  data-open={expanded ? "true" : "false"}
                >
                  <button
                    type="button"
                    id={headerId}
                    className="estate-how-to-guide__section-toggle"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    data-testid={`estate-how-to-toggle-${section.id}`}
                    onClick={() => toggleSection(section.id)}
                  >
                    <span className="estate-how-to-guide__section-title">
                      {section.title}
                    </span>
                    <span
                      className="estate-how-to-guide__chevron"
                      aria-hidden="true"
                    >
                      {expanded ? "▾" : "▸"}
                    </span>
                  </button>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={headerId}
                    hidden={!expanded}
                    className="estate-how-to-guide__section-body"
                  >
                    {section.paragraphs?.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                    {section.numbered ? (
                      <ol className="estate-how-to-guide__numbered">
                        {section.numbered.map((item) => (
                          <li key={item.title}>
                            <strong>{item.title}</strong>
                            <span>{item.description}</span>
                          </li>
                        ))}
                      </ol>
                    ) : null}
                    {section.subsections?.map((sub) => (
                      <div
                        key={sub.title}
                        className="estate-how-to-guide__subsection"
                      >
                        <h3>{sub.title}</h3>
                        <ul>
                          {sub.bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    {section.bullets ? (
                      <ul className="estate-how-to-guide__bullets">
                        {section.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}
                    {section.comparisonRows ? (
                      <>
                        <div
                          className="estate-how-to-guide__comparison estate-how-to-guide__comparison--table"
                          data-testid="estate-how-to-comparison-table"
                          role="table"
                          aria-label="How Chamber, Board, Research, and Shari differ"
                        >
                          <div className="estate-how-to-guide__comparison-row estate-how-to-guide__comparison-row--head" role="row">
                            <div role="columnheader">Guide</div>
                            <div role="columnheader">Helps with</div>
                          </div>
                          {section.comparisonRows.map((row) => (
                            <div
                              key={row.name}
                              className="estate-how-to-guide__comparison-row"
                              role="row"
                            >
                              <div role="cell">
                                <strong>{row.name}</strong>
                              </div>
                              <div role="cell">
                                <ul>
                                  {row.points.map((point) => (
                                    <li key={point}>{point}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div
                          className="estate-how-to-guide__comparison estate-how-to-guide__comparison--cards"
                          data-testid="estate-how-to-comparison-cards"
                        >
                          {section.comparisonRows.map((row) => (
                            <article
                              key={row.name}
                              className="estate-how-to-guide__comparison-card"
                            >
                              <h3>{row.name}</h3>
                              <ul>
                                {row.points.map((point) => (
                                  <li key={point}>{point}</li>
                                ))}
                              </ul>
                            </article>
                          ))}
                        </div>
                      </>
                    ) : null}
                    {section.closingLine ? (
                      <p className="estate-how-to-guide__closing">
                        {section.closingLine}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <footer className="estate-how-to-guide__footer">
          {content.primaryActionLabel && onPrimaryAction ? (
            <button
              type="button"
              className="estate-how-to-guide__primary"
              data-testid={content.primaryActionTestId}
              onClick={onPrimaryAction}
            >
              {content.primaryActionLabel}
            </button>
          ) : null}
          <button
            type="button"
            className="estate-how-to-guide__footer-close"
            onClick={onClose}
            data-testid={`estate-how-to-guide-footer-close-${content.id}`}
          >
            Return
          </button>
        </footer>
      </div>
    </div>
  );
}
