"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type {
  WelcomeRoomPrototypeDiscovery,
  WelcomeRoomPrototypeOverrides,
  WelcomeWeather,
} from "@/lib/companionEnvironmentIntelligence";
import {
  getHospitalityProfile,
  saveHospitalityProfile,
} from "@/lib/companionHospitalityProfile";
import { DIRECTOR_STUDIO_DEMO_PATH } from "@/lib/companionEnvironmentIntelligence";
import type { WelcomeSeason, WelcomeTimeOfDay } from "@/lib/welcomeLivingRoom";

type Props = {
  overrides: WelcomeRoomPrototypeOverrides;
  onChange: (next: WelcomeRoomPrototypeOverrides) => void;
  onReset: () => void;
};

const SEASONS: Array<WelcomeSeason | "auto"> = [
  "auto",
  "spring",
  "summer",
  "autumn",
  "winter",
  "holiday",
];

const WEATHER: Array<WelcomeWeather | "auto"> = [
  "auto",
  "clear",
  "rain",
  "snow",
  "cloudy",
];

const DISCOVERIES: WelcomeRoomPrototypeDiscovery[] = [
  "auto",
  "none",
  "cookies",
  "tea",
  "quote",
  "project-complete",
  "birthday",
  "vacation",
];

const TIMES: Array<WelcomeTimeOfDay | "auto"> = [
  "auto",
  "morning",
  "afternoon",
  "evening",
  "night",
];

const DRINKS: Array<"auto" | "coffee" | "tea"> = ["auto", "coffee", "tea"];

const VISIT_ENERGY: Array<
  NonNullable<WelcomeRoomPrototypeOverrides["visitEnergy"]>
> = ["auto", "steady", "high", "gentle", "recovery"];

function selectField<T extends string>(
  label: string,
  value: T,
  options: readonly T[],
  onPick: (next: T) => void,
) {
  return (
    <label className="welcome-room-prototype__field">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onPick(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function PanelContent({ overrides, onChange, onReset }: Props) {
  const [storedDrink, setStoredDrink] = useState<
    "coffee" | "tea" | undefined
  >();

  useEffect(() => {
    const drink = getHospitalityProfile().favoriteDrink;
    setStoredDrink(drink === "coffee" || drink === "tea" ? drink : undefined);
  }, []);

  function pickDrink(next: "auto" | "coffee" | "tea") {
    onChange({ ...overrides, favoriteDrink: next });
    if (next === "auto") {
      saveHospitalityProfile({ favoriteDrink: undefined });
      setStoredDrink(undefined);
      return;
    }
    saveHospitalityProfile({ favoriteDrink: next });
    setStoredDrink(next);
  }

  return (
    <>
      <div className="welcome-room-prototype__header">
        <strong>Living Welcome Room</strong>
        <span>prototype</span>
      </div>
      {selectField("Season", overrides.season ?? "auto", SEASONS, (season) =>
        onChange({ ...overrides, season }),
      )}
      {selectField("Weather", overrides.weather ?? "auto", WEATHER, (weather) =>
        onChange({ ...overrides, weather }),
      )}
      {selectField(
        "Discovery",
        overrides.discovery ?? "auto",
        DISCOVERIES,
        (discovery) => onChange({ ...overrides, discovery }),
      )}
      {selectField("Time", overrides.timeOfDay ?? "auto", TIMES, (timeOfDay) =>
        onChange({ ...overrides, timeOfDay }),
      )}
      {selectField(
        "Guest drink",
        overrides.favoriteDrink ?? storedDrink ?? "auto",
        DRINKS,
        pickDrink,
      )}
      {selectField(
        "Visit energy",
        overrides.visitEnergy ?? "auto",
        VISIT_ENERGY,
        (visitEnergy) => onChange({ ...overrides, visitEnergy }),
      )}
      <Link
        href={DIRECTOR_STUDIO_DEMO_PATH}
        className="welcome-room-prototype__link"
        prefetch
      >
        Open Director&apos;s Studio (demo) →
      </Link>
      <button type="button" className="welcome-room-prototype__reset" onClick={onReset}>
        Reset to intelligence
      </button>
    </>
  );
}

/** Dev-only — fixed portal so the hero layer cannot block clicks. */
export function WelcomeRoomPrototypeDevPanel(props: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <aside
      className="welcome-room-prototype"
      aria-label="Welcome room prototype controls"
      data-testid="welcome-room-prototype-panel"
    >
      <PanelContent {...props} />
    </aside>,
    document.body,
  );
}
