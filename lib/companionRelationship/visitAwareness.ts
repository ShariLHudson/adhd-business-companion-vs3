import {
  mapArrivalModeToVisitIntent,
  resolveGuestArrivalMode,
} from "@/lib/honorTheirIntent";
import type { VisitIntent } from "./types";

/**
 * Dynamic Visit Awareness™ — delegates to Honor Their Intent™.
 */
export function resolveVisitIntent(input: {
  userText?: string | null;
  overwhelmed?: boolean;
}): VisitIntent {
  const mode = resolveGuestArrivalMode({
    userText: input.userText,
    overwhelmed: input.overwhelmed,
  });
  return mapArrivalModeToVisitIntent(mode);
}

export function applyVisitIntentToRhythm(
  rhythm: import("./types").CompanionRelationshipRhythm,
  visitIntent: VisitIntent,
): import("./types").CompanionRelationshipRhythm {
  if (visitIntent === "work_now") {
    return {
      ...rhythm,
      greetingLength: "brief",
      askReconnectionQuestion: false,
      speedToWork: "immediate",
      prioritizeWorkRouting: true,
      preferLivingRoomLinger: false,
      environmentalStorytelling: "minimal",
      memoryTriggerVisitModulo: Math.max(rhythm.memoryTriggerVisitModulo, 6),
    };
  }

  if (visitIntent === "linger") {
    return {
      ...rhythm,
      greetingLength: rhythm.greetingLength === "brief" ? "warm" : rhythm.greetingLength,
      askReconnectionQuestion: true,
      speedToWork: "gentle",
      prioritizeWorkRouting: false,
      preferLivingRoomLinger: true,
      conversationLinger: "long",
      environmentalStorytelling:
        rhythm.environmentalStorytelling === "minimal"
          ? "occasional"
          : rhythm.environmentalStorytelling,
    };
  }

  return rhythm;
}
