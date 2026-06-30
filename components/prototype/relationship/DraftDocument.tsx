"use client";

import { DRAFT_DOCUMENT } from "./mockData";

type DraftDocumentProps = {
  visible: boolean;
  promiseText: string;
  onPromiseChange: (value: string) => void;
  onEdited: () => void;
};

export function DraftDocument({
  visible,
  promiseText,
  onPromiseChange,
  onEdited,
}: DraftDocumentProps) {
  if (!visible) return null;

  return (
    <div className="rel-draft" role="region" aria-label="First draft">
      <div className="rel-draft__glass">
        <header className="rel-draft__header">
          <h2>{DRAFT_DOCUMENT.title}</h2>
          <p>Quietly gathered while we talked</p>
        </header>
        <div className="rel-draft__body">
          {DRAFT_DOCUMENT.sections.map((section) => (
            <section key={section.id} className="rel-draft__section">
              <h3>{section.label}</h3>
              {"editable" in section && section.editable ? (
                <textarea
                  className="rel-draft__editable"
                  value={promiseText}
                  onChange={(event) => {
                    onPromiseChange(event.target.value);
                    onEdited();
                  }}
                  rows={3}
                  aria-label="Edit promise"
                />
              ) : (
                <p>{section.text}</p>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
