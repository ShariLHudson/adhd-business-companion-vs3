import { imageContextById } from "./imageContextRegistry";
import { COMPANION_PRESENCE_WELCOME_IMAGE_ID } from "@/lib/companionPresenceLibrary/sceneCatalog";
import type { CompanionEnvironmentInput } from "./types";

function photographReason(
  id: string,
  input: CompanionEnvironmentInput,
): string {
  if (input.isFirstMeeting) return "first welcome — the room was already waiting";
  if (input.birthdayToday) return "birthday — someone expected you";
  if (input.recoveryGentle) return "gentle day — softer light, softer pace";
  if (input.lowEnergy) return "low energy — honest and unhurried";
  if (input.businessFocus) return "business focus — desk energy when you need it";
  if (input.timeOfDay === "evening" || input.timeOfDay === "night") {
    return "evening — lamp already on";
  }
  if (input.timeOfDay === "morning") return "morning — coffee and calm";
  const context = imageContextById(id);
  return context
    ? `${input.season} ${input.weather ?? "clear"} — ${context.compositionNotes.toLowerCase()}`
    : "today felt like this room";
}

/**
 * Master Living Room — one approved photograph until time/season layers ship.
 * First page is always `shari-i-am-here-2`.
 */
export function selectWelcomePhotograph(input: CompanionEnvironmentInput): {
  id: string;
  reason: string;
} {
  const id = COMPANION_PRESENCE_WELCOME_IMAGE_ID;
  return {
    id,
    reason: photographReason(id, input),
  };
}
