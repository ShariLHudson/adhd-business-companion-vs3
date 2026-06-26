/** @deprecated Use @/lib/shariVoiceBible */
import { composeBibleEcho } from "@/lib/shariVoiceBible";
import type { GreetingIntelligenceInput } from "./types";

export {
  composeBibleEcho as composeRelationshipEcho,
  composeBibleClarify as composeClarifyQuestion,
  composeBibleSoftPresence as composeSoftPresenceEcho,
} from "@/lib/shariVoiceBible";

export function composeContinuityEcho(
  input: GreetingIntelligenceInput = {
    homeState: "QUIET_PRESENCE",
    timeOfDay: "morning",
    sessionVisitIndex: 1,
    returnIntervalHours: null,
    returnIntervalDays: null,
    isFirstMeeting: false,
  },
): string {
  return composeBibleEcho({
    voiceContext: input,
    tone: "okay",
    continuity: true,
  });
}
