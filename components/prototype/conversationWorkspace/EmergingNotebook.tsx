"use client";

import type { NotebookSection } from "./mockData";
import { NOTEBOOK_TITLE } from "./mockData";

type EmergingNotebookProps = {
  visible: boolean;
  emerging: boolean;
  sections: NotebookSection[];
  complete: boolean;
};

export function EmergingNotebook({
  visible,
  emerging,
  sections,
  complete,
}: EmergingNotebookProps) {
  if (!visible && !emerging) return null;

  return (
    <aside
      className={`cw4-notebook${emerging ? " cw4-notebook--emerging" : ""}${visible ? " cw4-notebook--visible" : ""}`}
      aria-label="Organized notes"
    >
      <div className="cw4-notebook__glass">
        <header className="cw4-notebook__header">
          <h2>{NOTEBOOK_TITLE}</h2>
          {complete && <span className="cw4-notebook__badge">Solid draft</span>}
        </header>
        <div className="cw4-notebook__sections">
          {sections.length === 0 && (
            <p className="cw4-notebook__waiting">Gathering from our conversation…</p>
          )}
          {sections.map((section) => (
            <section key={section.id} className="cw4-notebook__section">
              <h3>
                {section.complete ? "✓ " : ""}
                {section.label}
              </h3>
              <p>{section.text}</p>
            </section>
          ))}
        </div>
      </div>
    </aside>
  );
}
