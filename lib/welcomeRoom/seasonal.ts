import type { WelcomeRoomSeason } from "./types";

export type WelcomeRoomSeasonProfile = {
  season: WelcomeRoomSeason;
  label: string;
  atmosphereClass: string;
  accents: string[];
};

/** Iowa seasonal intelligence — subtle, never cluttered. */
export function resolveWelcomeRoomSeason(now = new Date()): WelcomeRoomSeasonProfile {
  const month = now.getMonth() + 1;
  if (month >= 3 && month <= 5) {
    return {
      season: "spring",
      label: "Spring",
      atmosphereClass: "welcome-room--spring",
      accents: ["Fresh flowers on the table", "Soft greens through the windows"],
    };
  }
  if (month >= 6 && month <= 8) {
    return {
      season: "summer",
      label: "Summer",
      atmosphereClass: "welcome-room--summer",
      accents: ["Open windows", "Lush greenery outside"],
    };
  }
  if (month >= 9 && month <= 11) {
    return {
      season: "autumn",
      label: "Fall",
      atmosphereClass: "welcome-room--autumn",
      accents: ["Warm autumn light", "Cozy blanket on the chair"],
    };
  }
  return {
    season: "winter",
    label: "Winter",
    atmosphereClass: "welcome-room--winter",
    accents: ["Snow beyond the glass", "Warm lamp glow inside"],
  };
}
