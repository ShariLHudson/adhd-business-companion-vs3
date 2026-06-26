import { relationshipStageFromVisits } from "@/lib/shariVoiceBible";
import type { PresenceIntelligenceInput, PresencePosture } from "./types";

function mapDepth(
  stage: ReturnType<typeof relationshipStageFromVisits>,
): PresencePosture["relationshipDepth"] {
  if (stage === "kin" || stage === "deep") return "kin";
  if (stage === "trusted" || stage === "month") return "trusted";
  return "early";
}

/**
 * Conversation posture — silence and earned questions, not data prompts.
 */
export function resolvePresencePosture(
  input: PresenceIntelligenceInput,
): PresencePosture {
  const stage = relationshipStageFromVisits(input.sessionVisitIndex);
  const depth = mapDepth(stage);
  const hasPriorThread = Boolean(input.previousTopic?.trim());
  const longAbsence =
    (input.returnIntervalDays ?? 0) >= 14 ||
    (input.returnIntervalHours ?? 0) >= 24 * 14;

  const preferSilence =
    depth === "kin" && input.sessionVisitIndex % 4 === 0 && !input.isFirstMeeting;

  const useWonderQuestion =
    hasPriorThread &&
    !input.isFirstMeeting &&
    (longAbsence || input.sessionVisitIndex % 3 !== 2);

  return {
    preferSilence,
    useWonderQuestion,
    relationshipDepth: depth,
  };
}
