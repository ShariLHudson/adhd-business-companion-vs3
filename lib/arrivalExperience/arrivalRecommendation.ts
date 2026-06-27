import type { DayState } from "@/lib/companionStore";
import type { CompanionContinueResolution } from "@/lib/companionLedContinue";
import { evaluateCompanionNeedsIntelligence } from "@/lib/companionNeedsIntelligence";
import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import { composeRoomInvitation } from "@/lib/shariVoiceBible/composeRoomInvitation";
import type { GreetingIntelligenceInput } from "@/lib/greetingIntelligence/types";
import {
  applyRestraintToArrivalRecommendation,
  userExpressedRoomNeed,
} from "@/lib/wisdomOfRestraint";
import { applyCharacterToArrivalRecommendation } from "@/lib/characterOfShari";
import type { ArrivalRecommendation, RealityEmotionalTone } from "./types";
import { sectionForPlace } from "./sectionForPlace";

const DEFAULT_VOICE_CONTEXT: GreetingIntelligenceInput = {
  homeState: "QUIET_PRESENCE",
  timeOfDay: "afternoon",
  sessionVisitIndex: 12,
  returnIntervalHours: 16,
  returnIntervalDays: 0.5,
  isFirstMeeting: false,
};

function buildRecommendation(
  placeId: CompanionPlaceId,
  tone: RealityEmotionalTone,
  voiceContext: GreetingIntelligenceInput,
  fromContinue = false,
): ArrivalRecommendation {
  const section = sectionForPlace(placeId);
  const stayInLivingRoom = placeId === "living-room";
  const copy = composeRoomInvitation({
    placeId,
    tone,
    voiceContext,
    fromContinue,
  });
  return {
    placeId,
    section,
    line: copy.line,
    buttonLabel: copy.buttonLabel,
    walkingLine: copy.walkingLine,
    stayInLivingRoom,
  };
}

/** Relationship before recommendation — wait until reconnection turns are complete. */
const MIN_RECONNECTION_TURNS = 2;

/**
 * Room invitations pass through Wisdom of Restraint.
 * No tone-based redirects — only when the guest expressed a need.
 */
export function resolveArrivalRecommendation(input: {
  message?: string;
  tone: RealityEmotionalTone;
  dayState?: DayState | null;
  continueResolution?: CompanionContinueResolution;
  reconnectionTurns?: number;
  readyForRecommendation?: boolean;
  voiceContext?: GreetingIntelligenceInput;
}): ArrivalRecommendation | null {
  const {
    tone,
    message = "",
    continueResolution,
    reconnectionTurns = 0,
    readyForRecommendation = true,
    voiceContext = DEFAULT_VOICE_CONTEXT,
  } = input;

  const restraintContext = {
    tone,
    userMessage: message,
    reconnectionTurns,
  };

  if (!readyForRecommendation) return null;
  if (reconnectionTurns < MIN_RECONNECTION_TURNS) return null;

  if (
    continueResolution &&
    continueResolution.mode === "single" &&
    continueResolution.option.kind === "plan-my-day"
  ) {
    return applyCharacterToArrivalRecommendation(
      applyRestraintToArrivalRecommendation(
        buildRecommendation("planning-table", tone, voiceContext, true),
        {
          ...restraintContext,
          userExpressedNeed: true,
          fromContinueResolution: true,
        },
      ),
      {},
    );
  }

  const expressedNeed = userExpressedRoomNeed(message);
  if (!expressedNeed) return null;

  const needs = evaluateCompanionNeedsIntelligence({
    text: message,
    lowEnergy: tone === "low" || tone === "heavy",
    recoveryGentle: tone === "heavy",
    cognitiveLoadLevel: tone === "low" ? "heavy" : "moderate",
  });

  if (needs.recommendedPlaceId === "living-room" || needs.confidence === "low") {
    return null;
  }

  return applyCharacterToArrivalRecommendation(
    applyRestraintToArrivalRecommendation(
      buildRecommendation(needs.recommendedPlaceId, tone, voiceContext),
      { ...restraintContext, userExpressedNeed: true },
    ),
    {},
  );
}
