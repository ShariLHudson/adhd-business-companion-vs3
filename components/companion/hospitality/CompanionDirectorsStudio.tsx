"use client";

import { useMemo, useState } from "react";
import { COMPANION_PLACE_LIBRARY } from "@/lib/companionUniverse/libraries/placeLibrary";
import type { HospitalityPrincipleEvaluation, HospitalityLayers } from "@/lib/companionUniverse";
import type { HospitalityMemorySummary, HospitalityProfileSource } from "@/lib/companionHospitalityProfile";
import {
  DIRECTOR_DEMO_PROFILES,
  HOSPITALITY_EXPERIENCES,
  SEASON_EXPERIENCES,
  type AtmosphereTone,
  type DirectorBrief,
  type DirectorLifeEvent,
  type DirectorTime,
  type DirectorWeather,
} from "@/lib/companionHospitalityPrototype/directorExperience";
import type { ResolvedCompanionPresence } from "@/lib/companionUniverse/companionPresenceEngine";
import type { ResolvedHospitalityScene } from "@/lib/companionHospitalityPrototype/types";
import type { SceneValidationScore } from "@/lib/companionHospitalityPrototype/sceneValidation";
import type { WelcomeSeason } from "@/lib/welcomeLivingRoom";
import type { CompanionPlaceId } from "@/lib/companionUniverse/types";

type Props = {
  brief: DirectorBrief;
  onBriefChange: (next: DirectorBrief) => void;
  appliedResolved: ResolvedHospitalityScene;
  previewResolved: ResolvedHospitalityScene;
  validation: SceneValidationScore;
  layers: HospitalityLayers;
  hospitalityPrinciple: HospitalityPrincipleEvaluation;
  profileSource: HospitalityProfileSource;
  onProfileSourceChange: (source: HospitalityProfileSource) => void;
  memorySummary: HospitalityMemorySummary;
  demoKey: string;
  onDemoKeyChange: (key: string) => void;
  onPrepareHome: () => void;
  onSurprise: () => void;
  onSaveScene: () => void;
  onFavorite: () => void;
  onExport: () => void;
  presentationMode: boolean;
  onPresentationModeChange: (enabled: boolean) => void;
  profileLabel: string;
};

const STUDIO_PLACES: CompanionPlaceId[] = [
  "living-room",
  "window-seat",
  "kitchen-table",
  "planning-table",
  "focus-studio",
  "reading-nook",
  "creative-studio",
  "business-office",
  "workshop",
  "garden",
  "garden-path",
  "greenhouse",
  "back-deck",
  "library",
  "front-porch",
  "barn",
];

const SEASONS: WelcomeSeason[] = ["spring", "summer", "autumn", "winter"];
const WEATHER: DirectorWeather[] = [
  "sunny",
  "cloudy",
  "rain",
  "thunderstorm",
  "snow",
  "windy",
];
const TIMES: DirectorTime[] = [
  "sunrise",
  "morning",
  "afternoon",
  "golden-hour",
  "evening",
  "night",
];
const LIFE_EVENTS: { value: DirectorLifeEvent; label: string }[] = [
  { value: "none", label: "None" },
  { value: "birthday", label: "Birthday" },
  { value: "vacation-countdown", label: "Vacation Countdown" },
  { value: "project-complete", label: "Project Complete" },
  { value: "recovery", label: "Recovery Day" },
  { value: "first-day", label: "First Day" },
  { value: "holiday", label: "Holiday" },
  { value: "anniversary", label: "Anniversary" },
  { value: "welcome-back", label: "Welcome Back" },
  { value: "launch-week", label: "Launch Week" },
];
const ATMOSPHERES: AtmosphereTone[] = [
  "calm",
  "cozy",
  "reflective",
  "creative",
  "celebratory",
  "encouraging",
  "focused",
  "quiet",
];

function labelize(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function ChipRow<T extends string>({
  label,
  options,
  value,
  onPick,
}: {
  label?: string;
  options: readonly { value: T; label: string }[] | readonly T[];
  value: T;
  onPick: (next: T) => void;
}) {
  const normalized = options.map((option) =>
    typeof option === "string" ? { value: option, label: labelize(option) } : option,
  );
  return (
    <div className="directors-studio-v2__field">
      {label ? <span className="directors-studio-v2__label">{label}</span> : null}
      <div className="directors-studio-v2__chip-row">
        {normalized.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`directors-studio-v2__chip${
              value === option.value ? " is-active" : ""
            }`}
            onClick={() => onPick(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function InspectorRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="directors-studio-v2__inspector-row">
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}

export function CompanionDirectorsStudio({
  brief,
  onBriefChange,
  appliedResolved,
  previewResolved,
  validation,
  layers,
  hospitalityPrinciple,
  profileSource,
  onProfileSourceChange,
  memorySummary,
  demoKey,
  onDemoKeyChange,
  onPrepareHome,
  onSurprise,
  onSaveScene,
  onFavorite,
  onExport,
  presentationMode,
  onPresentationModeChange,
  profileLabel,
}: Props) {
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const place = useMemo(
    () => COMPANION_PLACE_LIBRARY.find((entry) => entry.id === brief.placeId),
    [brief.placeId],
  );

  function patch(partial: Partial<DirectorBrief>) {
    onBriefChange({ ...brief, ...partial });
  }

  function applyScenario(partial: Partial<DirectorBrief>) {
    onBriefChange({
      ...brief,
      ...partial,
    });
  }

  const hasPreviewDelta =
    appliedResolved.atmosphere !== previewResolved.atmosphere ||
    appliedResolved.season !== previewResolved.season ||
    appliedResolved.weather !== previewResolved.weather ||
    appliedResolved.greeting !== previewResolved.greeting;

  return (
    <aside className="directors-studio-v2" aria-label="Companion Director's Studio v2">
      <header className="directors-studio-v2__header">
        <div>
          <strong>Director&apos;s Studio</strong>
          <span>Prepare experiences — not variables</span>
        </div>
        <label className="directors-studio-v2__toggle">
          <input
            type="checkbox"
            checked={presentationMode}
            onChange={(event) => onPresentationModeChange(event.target.checked)}
          />
          Presentation
        </label>
      </header>

      <section className="directors-studio-v2__section">
        <h2>1 — Where Are We?</h2>
        <p className="directors-studio-v2__promise">
          {place?.emotionalPromise ?? "I've been expecting you."}
        </p>
        <div className="directors-studio-v2__chip-row directors-studio-v2__chip-row--wrap">
          {STUDIO_PLACES.map((placeId) => {
            const entry = COMPANION_PLACE_LIBRARY.find((p) => p.id === placeId);
            return (
              <button
                key={placeId}
                type="button"
                className={`directors-studio-v2__chip${
                  brief.placeId === placeId ? " is-active" : ""
                }${entry?.available === false ? " is-planned" : ""}`}
                onClick={() => patch({ placeId })}
                title={entry?.purpose}
              >
                {entry?.name.replace("", "") ?? labelize(placeId)}
              </button>
            );
          })}
        </div>
      </section>

      <section className="directors-studio-v2__section">
        <h2>2 — Today&apos;s World</h2>
        <ChipRow label="Season" options={SEASONS} value={brief.season} onPick={(season) => patch({ season })} />
        <ChipRow label="Weather" options={WEATHER} value={brief.weather} onPick={(weather) => patch({ weather })} />
        <ChipRow label="Time" options={TIMES} value={brief.time} onPick={(time) => patch({ time })} />
        <div className="directors-studio-v2__iowa">
          <label className="directors-studio-v2__toggle">
            <input
              type="checkbox"
              checked={brief.iowaReality}
              onChange={(event) => patch({ iowaReality: event.target.checked })}
            />
            Iowa Reality
          </label>
          <label className="directors-studio-v2__toggle">
            <input
              type="checkbox"
              checked={brief.fantasyMode}
              onChange={(event) => patch({ fantasyMode: event.target.checked })}
            />
            Fantasy Mode
          </label>
        </div>
        <div className="directors-studio-v2__quick-row">
          {SEASON_EXPERIENCES.map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              className="directors-studio-v2__quick"
              onClick={() => applyScenario(scenario.brief)}
            >
              {scenario.emoji} {scenario.label}
            </button>
          ))}
        </div>
      </section>

      <section className="directors-studio-v2__section">
        <h2>3 — Today&apos;s Story</h2>
        <ChipRow
          label="Life Event"
          options={LIFE_EVENTS}
          value={brief.lifeEvent}
          onPick={(lifeEvent) => patch({ lifeEvent })}
        />
        <ChipRow
          label="Atmosphere"
          options={ATMOSPHERES}
          value={brief.atmosphereTone}
          onPick={(atmosphereTone) => patch({ atmosphereTone })}
        />
        <div className="directors-studio-v2__quick-row directors-studio-v2__quick-row--wrap">
          {HOSPITALITY_EXPERIENCES.map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              className="directors-studio-v2__quick"
              onClick={() => applyScenario(scenario.brief)}
            >
              {scenario.emoji} {scenario.label}
            </button>
          ))}
        </div>
      </section>

      <section className="directors-studio-v2__section">
        <h2>4 — Today&apos;s Guest</h2>
        <ChipRow
          label="Profile source"
          options={[
            { value: "memory" as const, label: "Memory" },
            { value: "demo" as const, label: "Demo" },
            { value: "manual" as const, label: "Manual" },
          ]}
          value={profileSource}
          onPick={onProfileSourceChange}
        />
        {profileSource === "demo" ? (
          <ChipRow
            label="Demo guest"
            options={DIRECTOR_DEMO_PROFILES.map((profile) => ({
              value: profile.key,
              label: profile.label,
            }))}
            value={demoKey}
            onPick={onDemoKeyChange}
          />
        ) : null}
        {profileSource === "memory" && memorySummary.hasMemory ? (
          <ul className="directors-studio-v2__memory">
            {memorySummary.recognized.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : (
          <p className="directors-studio-v2__note">
            The house never changes. Only the preparation changes.
          </p>
        )}
        <p className="directors-studio-v2__woven">
          Guest preparation: {profileLabel}
        </p>
      </section>

      <section className="directors-studio-v2__section directors-studio-v2__section--commands">
        <h2>5 — Director Commands</h2>
        <div className="directors-studio-v2__command-grid">
          <button
            type="button"
            className="directors-studio-v2__command directors-studio-v2__command--primary"
            onClick={onPrepareHome}
          >
            🎬 Prepare the Home
          </button>
          <button type="button" className="directors-studio-v2__command" onClick={onSurprise}>
            🎲 Surprise Me
          </button>
          <button type="button" className="directors-studio-v2__command" onClick={onSaveScene}>
            📸 Save Scene
          </button>
          <button type="button" className="directors-studio-v2__command" onClick={onFavorite}>
            ⭐ Favorite
          </button>
          <button type="button" className="directors-studio-v2__command" onClick={onExport}>
            📋 Export
          </button>
        </div>
      </section>

      {hasPreviewDelta ? (
        <section className="directors-studio-v2__compare">
          <h3>Scene preview</h3>
          <div className="directors-studio-v2__compare-col">
            <span>Current</span>
            <p>{appliedResolved.atmosphere}</p>
            <p className="directors-studio-v2__compare-meta">
              {appliedResolved.season} · {appliedResolved.weather} · {appliedResolved.timeOfDay}
            </p>
          </div>
          <div className="directors-studio-v2__compare-arrow" aria-hidden="true">
            ↓
          </div>
          <div className="directors-studio-v2__compare-col directors-studio-v2__compare-col--next">
            <span>Generated</span>
            <p>{previewResolved.atmosphere}</p>
            <p className="directors-studio-v2__compare-meta">
              {previewResolved.season} · {previewResolved.weather} · {previewResolved.timeOfDay}
            </p>
          </div>
        </section>
      ) : null}

      <section className="directors-studio-v2__validation">
        <div className="directors-studio-v2__score">
          <span>Overall Scene Score</span>
          <strong>{validation.overallPercent}%</strong>
        </div>
        <ul className="directors-studio-v2__checks">
          {validation.checks.map((check) => (
            <li
              key={check.id}
              className={check.passed ? "is-pass" : "is-fail"}
              title={check.reason}
            >
              {check.passed ? "✔" : "✕"} {check.label}
            </li>
          ))}
        </ul>
        <p className="directors-studio-v2__belief">{validation.believabilityQuestion}</p>
      </section>

      <section className="directors-studio-v2__section">
        <button
          type="button"
          className="directors-studio-v2__inspector-toggle"
          onClick={() => setInspectorOpen((open) => !open)}
        >
          {inspectorOpen ? "Hide" : "Show"} Scene Inspector
        </button>
        {inspectorOpen ? (
          <div className="directors-studio-v2__inspector">
            <InspectorRow label="Place" value={place?.name ?? brief.placeId} />
            <InspectorRow label="Season" value={previewResolved.season} />
            <InspectorRow label="Weather" value={previewResolved.weather} />
            <InspectorRow label="Time" value={previewResolved.timeOfDay} />
            <InspectorRow label="Atmosphere" value={previewResolved.atmosphere} />
            <InspectorRow label="Life Event" value={previewResolved.lifeEvent} />
            <InspectorRow label="Hospitality Profile" value={profileLabel} />
            <InspectorRow label="Greeting" value={previewResolved.greeting} />
            <InspectorRow
              label="Objects"
              value={previewResolved.hospitality.join(", ") || "none"}
            />
            <InspectorRow
              label="Motion"
              value={previewResolved.motion.join(", ") || "none"}
            />
            <InspectorRow
              label="Audio"
              value={previewResolved.audio.join(", ") || "none"}
            />
            <InspectorRow
              label="Books"
              value={previewResolved.books.join(" · ") || "—"}
            />
            <InspectorRow
              label="Traditions"
              value={layers.layer4.active.map((t) => t.label).join(", ") || "—"}
            />
            <InspectorRow
              label="Corrections"
              value={
                previewResolved.corrections.length > 0
                  ? `${previewResolved.corrections.length} applied`
                  : "none"
              }
            />
            <InspectorRow
              label="Constitution"
              value={validation.checks.find((c) => c.id === "constitution")?.passed ? "Passed" : "Review"}
            />
            <InspectorRow
              label="Hospitality Principle"
              value={hospitalityPrinciple.passed ? "Passed" : "Review"}
            />
            <InspectorRow
              label="Scene Integrity"
              value={
                validation.checks.find((c) => c.id === "integrity")?.passed
                  ? "Passed"
                  : "Corrections applied"
              }
            />
          </div>
        ) : null}
      </section>
    </aside>
  );
}
