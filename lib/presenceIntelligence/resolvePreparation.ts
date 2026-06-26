import {
  resolveVisitEnergy,
  type VisitEnergy,
} from "@/lib/companionHospitalityProfile";
import type { PresenceIntelligenceInput, PresencePreparation } from "./types";

function resolveEnergy(input: PresenceIntelligenceInput): VisitEnergy {
  return (
    input.visitEnergy ??
    resolveVisitEnergy({
      recoveryGentle: input.recoveryGentle,
      lowEnergy: input.lowEnergy,
      timeOfDay: input.timeOfDay,
    })
  );
}

/**
 * Quiet preparation before arrival — no spoken announcements.
 */
export function resolvePresencePreparation(
  input: PresenceIntelligenceInput,
): PresencePreparation {
  const visitEnergy = resolveEnergy(input);
  const chronotype = input.chronotype;
  const favoriteDrink = input.favoriteDrink;
  const nightVisit =
    input.timeOfDay === "night" || input.timeOfDay === "evening";
  const morningVisit = input.timeOfDay === "morning";
  const morningPerson = chronotype === "morning";
  const nightPerson = chronotype === "night";

  const roomQuieter =
    visitEnergy === "recovery" ||
    visitEnergy === "gentle" ||
    Boolean(input.prefersQuiet) ||
    Boolean(input.lowEnergy) ||
    Boolean(input.recoveryGentle);

  const hopefulLight = Boolean(input.projectRecentlyCompleted);
  const brightMorning =
    visitEnergy === "high" ||
    (morningVisit && morningPerson && !roomQuieter);

  let drink: PresencePreparation["drink"] = null;
  let mugOnTable = false;
  let teaSetReady = false;

  if (visitEnergy === "recovery" || visitEnergy === "gentle") {
    drink = "tea";
    teaSetReady = true;
  } else if (nightPerson && nightVisit) {
    drink = favoriteDrink === "coffee" ? "coffee" : "tea";
    mugOnTable = drink === "coffee";
    teaSetReady = drink === "tea";
  } else if (morningPerson || brightMorning) {
    drink = favoriteDrink === "tea" ? "tea" : "coffee";
    mugOnTable = drink === "coffee";
    teaSetReady = drink === "tea";
  } else if (favoriteDrink === "tea") {
    drink = "tea";
    teaSetReady = true;
  } else if (favoriteDrink === "coffee") {
    drink = "coffee";
    mugOnTable = true;
  } else if (morningVisit) {
    drink = "coffee";
    mugOnTable = true;
  }

  return {
    drink,
    mugOnTable,
    teaSetReady,
    blanketFoldedNearby: roomQuieter,
    notebookOpen: visitEnergy === "steady" && !roomQuieter,
    chairAngledToWindow: roomQuieter,
    freshFlowers: hopefulLight || input.sessionVisitIndex % 17 === 0,
    roomQuieter,
    hopefulLight,
    brightMorning,
    visitEnergy,
  };
}
