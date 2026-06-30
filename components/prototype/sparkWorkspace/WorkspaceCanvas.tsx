"use client";

import type { WorkspaceMode } from "./types";

type CanvasSection = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
};

type WorkspaceCanvasProps = {
  mode: WorkspaceMode;
  sections: CanvasSection[];
};

export function WorkspaceCanvas({ mode, sections }: WorkspaceCanvasProps) {
  return (
    <main
      className={`sw-canvas sw-canvas--${mode}`}
      aria-label="Work canvas"
    >
      <header className="sw-canvas__header">
        <h1 className="sw-canvas__title">Workshop Launch Marketing Plan</h1>
        <p className="sw-canvas__focus">Current focus: Offer Promise</p>
      </header>

      <div className="sw-canvas__sections">
        {sections.map((section) => (
          <label key={section.id} className="sw-canvas__section">
            <span className="sw-canvas__label">{section.label}</span>
            {section.id === "launchChannels" || section.id === "nextStep" ? (
              <input
                type="text"
                className="sw-canvas__field"
                value={section.value}
                onChange={(event) => section.onChange(event.target.value)}
              />
            ) : (
              <textarea
                className="sw-canvas__textarea"
                value={section.value}
                onChange={(event) => section.onChange(event.target.value)}
                rows={section.rows ?? 3}
              />
            )}
          </label>
        ))}
      </div>
    </main>
  );
}
