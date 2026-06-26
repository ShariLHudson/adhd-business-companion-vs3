import type { GuestPreparation } from "@/lib/companionHospitalityProfile";
import type { PresencePreparation } from "./types";

/**
 * Bridge silent preparation into existing hospitality layer.
 * Spoken line is always null — care is discovered in the room.
 */
export function mapPresenceToGuestPreparation(
  prep: PresencePreparation,
): GuestPreparation {
  const objectKind =
    prep.teaSetReady && prep.drink === "tea"
      ? "tea-set"
      : prep.mugOnTable && prep.drink === "coffee"
        ? "coffee"
        : prep.drink === "tea"
          ? "tea-set"
          : "coffee";

  return {
    drink: prep.drink ?? "tea",
    objectKind,
    vesselLabel: objectKind === "coffee" ? "Spark mug" : "tea cup",
    line: null,
    blanket: prep.blanketFoldedNearby,
    brightMorning: prep.brightMorning,
    visitEnergy: prep.visitEnergy,
  };
}
