import type { CompanionContinueResolution } from "@/lib/companionLedContinue";
import { evaluateCompanionNeedsIntelligence } from "@/lib/companionNeedsIntelligence";
import { placeById } from "@/lib/companionUniverse/libraries/placeLibrary";
import type { DayState } from "@/lib/companionStore";
import type { ArrivalRecommendation, RealityEmotionalTone } from "./types";
import { sectionForPlace } from "./sectionForPlace";

const WALKING_LINES: Partial<Record<string, string>> = {
  "planning-table": "I'll walk with you.",
  "window-seat": "This way — by the window.",
  "creative-studio": "Let's head to the studio.",
  "reading-nook": "This way — by the reading nook.",
  "focus-studio": "Let's protect your focus.",
  "living-room": "Stay here with me.",
};

function recommendationLine(
  placeName: string,
  tone: RealityEmotionalTone,
): string {
  if (tone === "flooded" || tone === "grief") {
    return "Let's spend a few minutes at the Window Seat.";
  }
  if (tone === "spark" || tone === "celebration") {
    return `The Creative Studio is open if you want to land that idea.`;
  }
  if (tone === "low" || tone === "heavy") {
    return `Want to sit at the ${placeName} — gently?`;
  }
  return `Want to shape today at the ${placeName}?`;
}

function buttonLabel(tone: RealityEmotionalTone): string {
  if (tone === "flooded" || tone === "grief" || tone === "heavy") {
    return "Yes, gently";
  }
  return "Yes";
}

function continueToPlace(kind: string): ArrivalRecommendation | null {
  switch (kind) {
    case "plan-my-day":
      return buildRecommendation("planning-table", "okay", true);
    case "conversation":
      return null;
    default:
      return null;
  }
}

function buildRecommendation(
  placeId: import("@/lib/companionUniverse/types").CompanionPlaceId,
  tone: RealityEmotionalTone,
  fromContinue = false,
): ArrivalRecommendation {
  const placeName = placeById(placeId).name.replace(/™/g, "");
  const section = sectionForPlace(placeId);
  const stayInLivingRoom = placeId === "living-room";
  return {
    placeId,
    section,
    line: fromContinue
      ? `Want to pick up where we left off at the ${placeName}?`
      : recommendationLine(placeName, tone),
    buttonLabel: buttonLabel(tone),
    walkingLine: WALKING_LINES[placeId] ?? "I'll walk with you.",
    stayInLivingRoom,
  };
}

export function resolveArrivalRecommendation(input: {
  message?: string;
  tone: RealityEmotionalTone;
  dayState?: DayState | null;
  continueResolution?: CompanionContinueResolution;
}): ArrivalRecommendation | null {
  const { tone, message = "", continueResolution } = input;

  if (tone === "grief" || tone === "flooded") {
    return buildRecommendation("window-seat", tone);
  }

  if (
    continueResolution &&
    continueResolution.mode === "single" &&
    continueResolution.option.kind === "plan-my-day"
  ) {
    return continueToPlace(continueResolution.option.kind);
  }

  const needs = evaluateCompanionNeedsIntelligence({
    text: message,
    lowEnergy: tone === "low" || tone === "heavy",
    recoveryGentle: tone === "heavy",
    cognitiveLoadLevel: tone === "low" ? "heavy" : "moderate",
  });

  if (tone === "spark" || tone === "celebration") {
    return buildRecommendation("creative-studio", tone);
  }

  return buildRecommendation(needs.recommendedPlaceId, tone);
}
