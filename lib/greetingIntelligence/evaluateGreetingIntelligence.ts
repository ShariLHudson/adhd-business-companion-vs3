import type { WelcomeMood } from "@/lib/welcomePresenceIntelligence/types";
import {
  composeBibleChatPlaceholder,
  composeBibleClarify,
  composeBibleEcho,
  composeBibleSoftPresence,
  composeLivingRoomOpening,
} from "@/lib/shariVoiceBible";
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
  if (input.returnIntervalDays != null && input.returnIntervalDays >= 42) {
    return "long_absence";
  }
  return input.timeOfDay;
}

/**
 * Greeting Intelligence™ — selects from Shari Voice Bible™.
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
