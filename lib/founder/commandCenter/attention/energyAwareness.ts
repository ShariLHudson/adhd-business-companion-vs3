import type { EnergyAwareness, EnergyProfile } from "../types";

const PROFILES: EnergyProfile[] = [
  "high_energy",
  "low_energy",
  "creative",
  "strategic",
  "administrative",
  "recovery",
];

export function suggestEnergyProfile(hour = new Date().getHours()): EnergyAwareness {
  const suggested: EnergyProfile =
    hour < 10 ? "strategic" : hour < 14 ? "creative" : hour < 17 ? "administrative" : "recovery";

  return {
    suggestedProfile: suggested,
    rationale: "Architecture placeholder — future FLAME and calendar signals refine this.",
    workTypes: PROFILES.map((profile) => ({
      profile,
      suggestions: workSuggestionsFor(profile),
    })),
  };
}

function workSuggestionsFor(profile: EnergyProfile): string[] {
  switch (profile) {
    case "high_energy":
      return ["Decisions with alternatives", "Launch preparation reviews"];
    case "low_energy":
      return ["Approve prepared drafts", "Review Executive Brief only"];
    case "creative":
      return ["Workshop outlines", "PostCraft drafts", "Estate creative direction"];
    case "strategic":
      return ["Mission priorities", "Opportunity review", "One decision"];
    case "administrative":
      return ["Approvals queue", "Delegate prep to Izna"];
    case "recovery":
      return ["WATCH items only", "Defer new decisions"];
    default:
      return [];
  }
}
