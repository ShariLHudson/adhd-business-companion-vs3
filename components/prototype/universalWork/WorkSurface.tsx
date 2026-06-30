"use client";

import {
  SPARK_PROMPT,
  WORK_SECTIONS,
  WORK_TITLE,
} from "./mockData";
import type { UniversalWorkStage } from "./types";

type WorkSurfaceProps = {
  stage: UniversalWorkStage;
  reflection: string;
  addedLine: string | null;
  onReflectionChange: (value: string) => void;
  onCommitReflection: () => void;
  onSetDown: () => void;
};

export function WorkSurface({
  stage,
  reflection,
  addedLine,
  onReflectionChange,
  onCommitReflection,
  onSetDown,
}: WorkSurfaceProps) {
  const visible = stage === "present" || stage === "fading";
  const fading = stage === "fading";

  if (!visible && stage !== "arriving") return null;

  return (
    <section
      className={`uw-surface${stage === "arriving" ? " uw-surface--emerging" : ""}${fading ? " uw-surface--fading" : ""}`}
      aria-label="Today's work"
    >
      <header className="uw-surface__header">
        <h1 className="uw-surface__title">{WORK_TITLE}</h1>
        <p className="uw-surface__today">Prepared for today</p>
      </header>

      <div className="uw-surface__document">
        {WORK_SECTIONS.map((section) => (
          <div key={section.id} className="uw-surface__block">
            <span className="uw-surface__label">{section.label}</span>
            <p className="uw-surface__prose">{section.text}</p>
          </div>
        ))}

        {addedLine ? (
          <div className="uw-surface__block uw-surface__block--new">
            <span className="uw-surface__label">Opening line</span>
            <p className="uw-surface__prose">{addedLine}</p>
          </div>
        ) : (
          <div className="uw-surface__invite">
            <p className="uw-surface__spark">{SPARK_PROMPT}</p>
            <div className="uw-surface__write">
              <input
                type="text"
                className="uw-surface__input"
                value={reflection}
                onChange={(event) => onReflectionChange(event.target.value)}
                placeholder="Write one sentence…"
                aria-label="Your opening line"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onCommitReflection();
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>

      {stage === "present" && (
        <button type="button" className="uw-surface__setdown" onClick={onSetDown}>
          Set down for now
        </button>
      )}
    </section>
  );
}
