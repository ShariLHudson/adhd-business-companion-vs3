import {
  detectEmergentNeed,
  resolveGuestArrivalMode,
} from "./classifyIntent";
import type {
  HonorTheirIntentInput,
  HonorTheirIntentVerdict,
  HonorResponseStyle,
} from "./types";
import { HONOR_THEIR_INTENT_PRINCIPLE } from "./types";

function openingForMode(
  mode: HonorTheirIntentVerdict["arrivalMode"],
  emergentNeed: boolean,
): string | null {
  if (emergentNeed) return null;
  if (mode === "come_to_work") return "Absolutely. Let's build it.";
  if (mode === "come_to_be_helped") return null;
  return null;
}

function resolveResponseStyle(
  mode: HonorTheirIntentVerdict["arrivalMode"],
  emergentNeed: boolean,
  sessionWasWork: boolean,
): HonorResponseStyle {
  if (mode === "come_to_work" && !emergentNeed) return "collaborator";
  if (mode === "come_to_be_helped" || emergentNeed) return "companion";
  if (sessionWasWork && emergentNeed) return "companion";
  if (mode === "unclear") return "listen_first";
  return "collaborator";
}

/**
 * Honor Their Intent — constitutional evaluation per turn.
 */
export function evaluateHonorTheirIntent(
  input: HonorTheirIntentInput = {},
): HonorTheirIntentVerdict {
  const sessionWasWork = input.sessionWasWork ?? false;
  const arrivalMode = resolveGuestArrivalMode({
    userText: input.userText,
    overwhelmed: input.overwhelmed,
  });
  const emergentNeedDetected = detectEmergentNeed(input.userText);
  const flowShift =
    sessionWasWork &&
    (arrivalMode === "come_to_be_helped" || emergentNeedDetected);

  const gentleAwarenessOnly =
    sessionWasWork &&
    !emergentNeedDetected &&
    arrivalMode !== "come_to_be_helped";

  const honorMomentum =
    (arrivalMode === "come_to_work" && !emergentNeedDetected && !flowShift) ||
    gentleAwarenessOnly;

  const suppressEmotionalDetour = honorMomentum;
  const beginImmediately = arrivalMode === "come_to_work" && !emergentNeedDetected;
  const stayInLivingRoom =
    arrivalMode === "come_to_be_helped" ||
    emergentNeedDetected ||
    (arrivalMode === "unclear" && !beginImmediately);

  return {
    arrivalMode,
    responseStyle: resolveResponseStyle(
      arrivalMode,
      emergentNeedDetected,
      sessionWasWork,
    ),
    honorMomentum,
    suppressEmotionalDetour,
    beginImmediately,
    stayInLivingRoom,
    gentleAwarenessOnly,
    emergentNeedDetected,
    flowShift,
    suggestedOpening: openingForMode(arrivalMode, emergentNeedDetected),
    constitutionalPrinciple: HONOR_THEIR_INTENT_PRINCIPLE,
  };
}

/**
 * Whether relationship reflection should yield to direct help this turn.
 */
export function shouldSuppressRelationshipForHonorIntent(
  verdict: HonorTheirIntentVerdict,
): boolean {
  if (verdict.emergentNeedDetected || verdict.arrivalMode === "come_to_be_helped") {
    return false;
  }
  if (verdict.arrivalMode === "come_to_work") return true;
  return verdict.honorMomentum;
}

/**
 * Whether to lead with reflection or emotional check-in.
 */
export function shouldSuppressReflectionForHonorIntent(
  verdict: HonorTheirIntentVerdict,
): boolean {
  if (verdict.emergentNeedDetected || verdict.arrivalMode === "come_to_be_helped") {
    return false;
  }
  return verdict.suppressEmotionalDetour;
}

export function honorTheirIntentHintForChat(
  verdict: HonorTheirIntentVerdict,
): string | null {
  const lines: string[] = [
    "HONOR THEIR INTENT (constitutional — meet them where they are):",
    `Arrival: ${verdict.arrivalMode}. Style: ${verdict.responseStyle}.`,
    verdict.constitutionalPrinciple,
  ];

  if (verdict.arrivalMode === "come_to_work" && !verdict.emergentNeedDetected) {
    lines.push(
      "They came to WORK. Acknowledge warmly and begin immediately.",
      "FORBIDDEN: 'Before we begin…', 'How are you feeling today?', unnecessary questions, emotional detours, redirection.",
      `GOOD: "${verdict.suggestedOpening ?? "Let's do it."}" — stay beside them as collaborator.`,
      "Shari remains warm — relationship shows in how she works beside them, not by interrupting momentum.",
    );
  }

  if (verdict.arrivalMode === "come_to_be_helped") {
    lines.push(
      "They came to BE HELPED. Slow down. Listen first.",
      "Stay in the Living Room when appropriate. One gentle next step when the time is right.",
      "Do NOT assume productivity. Do NOT rush to a workspace.",
    );
  }

  if (verdict.gentleAwarenessOnly) {
    lines.push(
      "GENTLE AWARENESS: User is in productive momentum — do not interrupt.",
      "Only pause for caring questions if they express emergent doubt or distress.",
    );
  }

  if (verdict.emergentNeedDetected || verdict.flowShift) {
    lines.push(
      "Need emerged naturally — now a caring pause is appropriate.",
      "Ask a thoughtful question. Offer one gentle next step.",
    );
  }

  if (verdict.arrivalMode === "unclear") {
    lines.push(
      "Intent unclear — listen first. One brief clarifying question is fine.",
      "Do not assume emotional support or productivity.",
    );
  }

  lines.push(
    "INTENT BEFORE ROUTING: Understand purpose before matching keywords (Meaning Before Matching).",
    "The guest chooses the door — walk through it with them.",
  );

  return lines.join("\n");
}
