"use client";

import { useCallback, useState } from "react";
import { CANVAS_SECTIONS } from "./mockData";
import type { WorkspaceMode } from "./types";
import { WorkspaceCanvas } from "./WorkspaceCanvas";
import { WorkspaceCompanion } from "./WorkspaceCompanion";
import { WorkspaceResources } from "./WorkspaceResources";

/**
 * Functional Equivalence Rule
 *
 * Every Business Experience must provide the same core workspace capability
 * regardless of environment.
 *
 * Changing environment may alter: background, soundscape, lighting, visual mood.
 * Changing environment must never alter: available tools, Companion capability,
 * Business Brain access, saving, editing, resources, export/publish actions.
 */

/**
 * Cognitive Consistency Rule
 *
 * Members should never have to relearn how to work because they chose a
 * different environment.
 *
 * The layout, keyboard behavior, Companion access, Resources access, saving,
 * and core interaction model must remain consistent.
 */

export function SparkWorkspacePrototypePage() {
  const [mode, setMode] = useState<WorkspaceMode>("thinking");
  const [focusMode, setFocusMode] = useState(false);
  const [envNote, setEnvNote] = useState<string | null>(null);
  const [fields, setFields] = useState({ ...CANVAS_SECTIONS });

  const updateField = useCallback(
    (key: keyof typeof CANVAS_SECTIONS, value: string) => {
      setFields((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleChangeEnvironment = useCallback(() => {
    setEnvNote("Tea House is the only environment in this prototype for now.");
    window.setTimeout(() => setEnvNote(null), 3200);
  }, []);

  const effectiveMode = focusMode ? "writing" : mode;

  const canvasSections = [
    {
      id: "audience",
      label: "Audience",
      value: fields.audience,
      onChange: (v: string) => updateField("audience", v),
      rows: 2,
    },
    {
      id: "transformation",
      label: "Transformation Promise",
      value: fields.transformation,
      onChange: (v: string) => updateField("transformation", v),
      rows: 3,
    },
    {
      id: "coreMessage",
      label: "Core Message",
      value: fields.coreMessage,
      onChange: (v: string) => updateField("coreMessage", v),
      rows: 3,
    },
    {
      id: "positioning",
      label: "Offer Positioning",
      value: fields.positioning,
      onChange: (v: string) => updateField("positioning", v),
      rows: 3,
    },
    {
      id: "launchChannels",
      label: "Launch Channels",
      value: fields.launchChannels,
      onChange: (v: string) => updateField("launchChannels", v),
    },
    {
      id: "nextStep",
      label: "Next Step",
      value: fields.nextStep,
      onChange: (v: string) => updateField("nextStep", v),
    },
  ];

  return (
    <div className={`sw-root sw-root--${effectiveMode}${focusMode ? " sw-root--focus" : ""}`}>
      <p className="sw-dev-link">
        Spark Workspace prototype ·{" "}
        <a href="/companion">Back to companion</a>
        {" · "}
        <a href="/prototype/spark-studio">Spark Studio prototype</a>
        {" · "}
        <a href="/prototype/conservatory-workspace">Conservatory V3</a>
      </p>

      {envNote && (
        <p className="sw-toast" role="status">
          {envNote}
        </p>
      )}

      <header className="sw-topbar">
        <div className="sw-topbar__trail">
          <span>Marketing Plan</span>
          <span className="sw-topbar__sep" aria-hidden>
            /
          </span>
          <span className="sw-topbar__current">Workshop Launch Project</span>
        </div>
        <span className="sw-topbar__saved">Saved just now</span>
        <div className="sw-topbar__controls">
          <button
            type="button"
            className="sw-topbar__control"
            onClick={handleChangeEnvironment}
          >
            Change Environment
          </button>
          <button
            type="button"
            className={`sw-topbar__control${focusMode ? " sw-topbar__control--active" : ""}`}
            onClick={() => setFocusMode((value) => !value)}
          >
            Focus Mode
          </button>
        </div>
      </header>

      <div className="sw-mode-bar" role="toolbar" aria-label="Workspace mode">
        {(
          [
            ["thinking", "Thinking Mode"],
            ["writing", "Writing Mode"],
            ["review", "Review Mode"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={`sw-mode-btn${mode === value && !focusMode ? " sw-mode-btn--active" : ""}`}
            onClick={() => {
              setFocusMode(false);
              setMode(value);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={`sw-workspace sw-workspace--${effectiveMode}`}>
        <WorkspaceCompanion mode={effectiveMode} />
        <WorkspaceCanvas mode={effectiveMode} sections={canvasSections} />
        <WorkspaceResources mode={effectiveMode} />
      </div>

      <footer className="sw-bottombar">
        <button type="button" className="sw-bottombar__icon" aria-label="Voice">
          <span className="sw-bottombar__mic" aria-hidden />
        </button>
        <button type="button" className="sw-bottombar__search">
          Search
        </button>
        <span className="sw-bottombar__env">Tea House Environment</span>
      </footer>
    </div>
  );
}
