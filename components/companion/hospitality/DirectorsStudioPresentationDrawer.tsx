"use client";

import type { DirectorBrief } from "@/lib/companionHospitalityPrototype/directorExperience";
import {
  HOSPITALITY_EXPERIENCES,
  SEASON_EXPERIENCES,
} from "@/lib/companionHospitalityPrototype/directorExperience";
import type { WelcomeSeason } from "@/lib/welcomeLivingRoom";
import type {
  DirectorLifeEvent,
  DirectorTime,
  DirectorWeather,
} from "@/lib/companionHospitalityPrototype/directorExperience";

type Props = {
  brief: DirectorBrief;
  onBriefChange: (next: DirectorBrief) => void;
  onPrepareHome: () => void;
  onSurprise: () => void;
  drawerOpen: boolean;
  onDrawerOpenChange: (open: boolean) => void;
};

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
  { value: "vacation-countdown", label: "Vacation" },
  { value: "project-complete", label: "Project Complete" },
  { value: "recovery", label: "Recovery" },
  { value: "first-day", label: "First Day" },
  { value: "holiday", label: "Holiday" },
  { value: "anniversary", label: "Anniversary" },
  { value: "welcome-back", label: "Welcome Back" },
  { value: "launch-week", label: "Launch Week" },
];

function ChipRow<T extends string>({
  options,
  value,
  onPick,
}: {
  options: readonly { value: T; label: string }[] | readonly T[];
  value: T;
  onPick: (next: T) => void;
}) {
  const normalized = options.map((option) =>
    typeof option === "string"
      ? { value: option, label: option }
      : option,
  );
  return (
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
  );
}

/** Presentation Mode — audience sees only the room; director uses a quiet drawer. */
export function DirectorsStudioPresentationDrawer({
  brief,
  onBriefChange,
  onPrepareHome,
  onSurprise,
  drawerOpen,
  onDrawerOpenChange,
}: Props) {
  function patch(partial: Partial<DirectorBrief>) {
    onBriefChange({ ...brief, ...partial });
  }

  return (
    <>
      <button
        type="button"
        className="directors-studio-v2__present-tab"
        onClick={() => onDrawerOpenChange(!drawerOpen)}
        aria-expanded={drawerOpen}
      >
        {drawerOpen ? "Close" : "Direct"}
      </button>

      {drawerOpen ? (
        <aside
          className="directors-studio-v2 directors-studio-v2--presentation"
          aria-label="Presentation director drawer"
        >
          <header className="directors-studio-v2__header">
            <strong>Prepare the home</strong>
            <span>Audience sees only the room</span>
          </header>

          <section className="directors-studio-v2__block">
            <h3>Season</h3>
            <ChipRow
              options={SEASONS}
              value={brief.season}
              onPick={(season) => patch({ season })}
            />
          </section>

          <section className="directors-studio-v2__block">
            <h3>Weather</h3>
            <ChipRow
              options={WEATHER}
              value={brief.weather}
              onPick={(weather) => patch({ weather })}
            />
          </section>

          <section className="directors-studio-v2__block">
            <h3>Today&apos;s story</h3>
            <ChipRow
              options={LIFE_EVENTS}
              value={brief.lifeEvent}
              onPick={(lifeEvent) => patch({ lifeEvent })}
            />
          </section>

          <div className="directors-studio-v2__command-row">
            <button
              type="button"
              className="directors-studio-v2__command directors-studio-v2__command--primary"
              onClick={onPrepareHome}
            >
              🎬 Prepare the Home
            </button>
            <button
              type="button"
              className="directors-studio-v2__command"
              onClick={onSurprise}
            >
              🎲 Surprise Me
            </button>
          </div>

          <section className="directors-studio-v2__block">
            <h3>Quick scenes</h3>
            <div className="directors-studio-v2__chip-row directors-studio-v2__chip-row--wrap">
              {[...SEASON_EXPERIENCES, ...HOSPITALITY_EXPERIENCES].map((scenario) => (
                <button
                  key={scenario.id}
                  type="button"
                  className="directors-studio-v2__chip"
                  onClick={() =>
                    onBriefChange({
                      ...brief,
                      ...scenario.brief,
                      placeId: brief.placeId,
                      iowaReality: brief.iowaReality,
                      fantasyMode: brief.fantasyMode,
                    })
                  }
                >
                  {scenario.emoji ? `${scenario.emoji} ` : ""}
                  {scenario.label}
                </button>
              ))}
            </div>
          </section>
        </aside>
      ) : null}
    </>
  );
}
