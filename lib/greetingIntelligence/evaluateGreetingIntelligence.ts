import type { WelcomeMood } from "@/lib/welcomePresenceIntelligence/types";
import {
  composeBibleChatPlaceholder,
  composeBibleClarify,
  composeBibleEcho,
  composeBibleSoftPresence,
  composeLivingRoomOpening,
} from "@/lib/shariVoiceBible";
import { isLongAbsence } from "@/lib/arrivalIntelligence/returnState";
import type { GreetingIntelligence, GreetingIntelligenceInput } from "./types";

function resolveMood(input: GreetingIntelligenceInput): WelcomeMood {
  if (input.birthdayToday || input.celebrationActive || input.projectRecentlyCompleted) {
    return "celebratory";
  }
  if (input.recoveryGentle || input.timeOfDay === "night" || input.timeOfDay === "evening") {
    return "gentle";
  }
  if (input.lowEnergy) {
    return "honest";
  }
  if (input.sessionVisitIndex >= 90) {
    return "warm";
  }
  return "warm";
}

function resolveCategory(input: GreetingIntelligenceInput): string {
  if (input.isFirstMeeting || input.homeState === "FIRST_VISIT") return "first_visit";
  if (input.birthdayToday) return "birthday";
  if (input.celebrationActive || input.projectRecentlyCompleted) return "celebration";
  if (input.recoveryGentle) return "recovery";
  if (input.lowEnergy) return "low_energy";
  // MA-05 Phase 2 — shared canonical long-absence policy (was inline `>= 42`).
  if (isLongAbsence(input.returnIntervalDays)) {
    return "long_absence";
  }
  return input.timeOfDay;
}

/**
 * Greeting Intelligence — selects from Shari Voice Bible.
 */
export function evaluateGreetingIntelligence(
  input: GreetingIntelligenceInput,
): GreetingIntelligence {
  const opening = composeLivingRoomOpening(input);

  return {
    greeting: opening.greeting,
    reconnectionQuestion: opening.question,
    invite: opening.question,
    chatPlaceholder: opening.chatPlaceholder,
    mood: resolveMood(input),
    greetingCategory: resolveCategory(input),
  };
}

export {
  composeBibleEcho as composeRelationshipEcho,
  composeBibleClarify as composeClarifyQuestion,
  composeBibleSoftPresence as composeSoftPresenceEcho,
  composeLivingRoomOpening,
} from "@/lib/shariVoiceBible";
