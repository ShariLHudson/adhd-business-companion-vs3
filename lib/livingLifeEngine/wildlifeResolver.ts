import type { LivingChangeItem, LivingChangeEngineInput, WildlifeSpecies } from "./types";
import { isOnCooldown } from "./livingChangeHistory";

type WildlifeRule = {
  species: WildlifeSpecies;
  seasons: LivingChangeEngineInput["season"][];
  weathers: LivingChangeEngineInput["weather"][];
  times: LivingChangeEngineInput["timeOfDay"][];
  hint?: string;
};

const WILDLIFE_RULES: WildlifeRule[] = [
  {
    species: "cardinal",
    seasons: ["winter", "autumn", "holiday"],
    weathers: ["clear", "snow", "cloudy"],
    times: ["morning", "afternoon"],
    hint: "A cardinal's been at the feeder.",
  },
  {
    species: "goldfinch",
    seasons: ["summer", "spring"],
    weathers: ["clear", "cloudy"],
    times: ["morning", "afternoon"],
    hint: "Goldfinches are busy outside.",
  },
  {
    species: "hummingbird",
    seasons: ["summer", "spring"],
    weathers: ["clear"],
    times: ["morning", "afternoon"],
    hint: "I've been watching the hummingbirds all morning.",
  },
  {
    species: "robin",
    seasons: ["spring", "summer"],
    weathers: ["clear", "rain", "cloudy"],
    times: ["morning", "afternoon"],
    hint: "Robins are hopping along the porch.",
  },
  {
    species: "blue-jay",
    seasons: ["autumn", "winter", "holiday"],
    weathers: ["clear", "cloudy"],
    times: ["morning", "afternoon"],
  },
  {
    species: "squirrel",
    seasons: ["autumn", "winter", "holiday", "spring"],
    weathers: ["clear", "cloudy", "snow"],
    times: ["morning", "afternoon", "evening"],
  },
  {
    species: "butterfly",
    seasons: ["summer", "spring"],
    weathers: ["clear"],
    times: ["afternoon", "evening"],
    hint: "Butterflies are drifting past the window.",
  },
];

function seasonMatches(
  season: LivingChangeEngineInput["season"],
  allowed: WildlifeRule["seasons"],
): boolean {
  return allowed.includes(season);
}

export function resolveWildlifeChanges(
  input: LivingChangeEngineInput,
): LivingChangeItem[] {
  if (input.weather === "rain" || input.recoveryGentle) {
    return [];
  }

  const eligible = WILDLIFE_RULES.filter(
    (rule) =>
      seasonMatches(input.season, rule.seasons) &&
      rule.weathers.includes(input.weather) &&
      rule.times.includes(input.timeOfDay) &&
      !isOnCooldown("wildlife", rule.species, input.now),
  );

  if (eligible.length === 0) return [];

  const pick = eligible[input.sessionVisitIndex % eligible.length];

  return [
    {
      id: `wildlife-${pick.species}`,
      bucket: "environmental",
      priority: "season",
      sourceModule: "wildlifeResolver",
      cause: `${pick.species}-${input.season}-${input.weather}`,
      wildlife: pick.species,
      conversationHint: pick.hint,
      motion:
        pick.species === "butterfly"
          ? { enable: ["butterflies"] }
          : undefined,
    },
  ];
}
