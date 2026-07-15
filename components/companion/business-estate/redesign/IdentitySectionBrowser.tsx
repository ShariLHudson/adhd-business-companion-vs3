"use client";

import {
  IDENTITY_SECTION_DEFINITIONS,
  businessBasicsProgress,
  isBusinessBasicsComplete,
  type IdentitySectionId,
} from "@/lib/profile/businessEstateRedesign";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelectImplemented: (id: "business-basics") => void;
  expandedId: IdentitySectionId | null;
  onExpand: (id: IdentitySectionId | null) => void;
};

function sectionStatusLabel(id: IdentitySectionId): string {
  if (id === "business-basics") {
    if (isBusinessBasicsComplete()) return "Complete";
    if (businessBasicsProgress().answered > 0) return "In Progress";
    return "Recommended";
  }
  return "Later";
}

export function IdentitySectionBrowser({
  open,
  onClose,
  onSelectImplemented,
  expandedId,
  onExpand,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="be-section-browser"
      role="dialog"
      aria-modal="true"
      aria-label="Choose a Section"
      data-testid="be-section-browser"
    >
      <button
        type="button"
        className="be-section-browser__backdrop"
        aria-label="Close section browser"
        onClick={onClose}
      />
      <div className="be-section-browser__sheet">
        <div className="be-section-browser__head">
          <h2 className="be-section-browser__title">Choose a Section</h2>
          <button
            type="button"
            className="be-btn be-btn--ghost"
            onClick={onClose}
            data-testid="be-section-browser-close"
          >
            Close
          </button>
        </div>
        <ul className="be-section-browser__list">
          {IDENTITY_SECTION_DEFINITIONS.map((section) => {
            const expanded = expandedId === section.id;
            const status = sectionStatusLabel(section.id);
            return (
              <li key={section.id} className="be-section-browser__item">
                <button
                  type="button"
                  className="be-section-browser__row"
                  aria-expanded={expanded}
                  onClick={() =>
                    onExpand(expanded ? null : section.id)
                  }
                  data-testid={`be-section-row-${section.id}`}
                >
                  <span>
                    {section.title}
                    {section.recommended ? " — Recommended" : ""}
                  </span>
                  <span className="be-section-browser__status">{status}</span>
                </button>
                {expanded ? (
                  <div
                    className="be-section-browser__detail"
                    data-testid={`be-section-detail-${section.id}`}
                  >
                    <p>{section.benefit}</p>
                    {section.implemented ? (
                      <button
                        type="button"
                        className="be-btn be-btn--primary be-btn--compact"
                        onClick={() => onSelectImplemented("business-basics")}
                        data-testid="be-section-open-basics"
                      >
                        Open Business Basics
                      </button>
                    ) : (
                      <p className="be-section-browser__later">
                        This section is planned for a later development pass.
                      </p>
                    )}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
