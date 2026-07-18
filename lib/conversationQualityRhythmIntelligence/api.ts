/**
 * CQRI orchestration — rhythm → length → quality gate → fallback.
 */

import { applyResponseShape } from "./applyRhythm";
import { detectConversationPhase } from "./conversationPhase";
import { runQualityGate } from "./qualityGate";
import { selectResponseShape } from "./rhythmSelector";
import { buildSafeFallback } from "./safeFallback";
import { applyLengthBudget } from "./lengthSelector";
import { recordCqriTelemetry } from "./telemetry";
import { preferObservationOverQuestion } from "./observationVsQuestion";
import type {
  CqriInput,
  CqriQualityFailure,
  CqriResult,
  CqriTelemetry,
} from "./types";

function questionVersusObservation(
  text: string,
): CqriTelemetry["questionVersusObservation"] {
  const qs = (text.match(/\?/g) ?? []).length;
  if (qs === 0) return "observation";
  if (qs === 1 && /[.!][\s\S]+\?/.test(text)) return "mixed";
  if (qs === 1) return "question";
  return "other";
}

/**
 * Final delivery pass for Estate conversations.
 * Call after CI. Does not invent new meaning.
 */
export function runConversationQualityAndRhythm(
  input: CqriInput,
): CqriResult {
  const seed = input.userText.length + input.draftText.length;
  const conversationPhase =
    input.conversationPhase ??
    detectConversationPhase({
      messages: input.messages,
      userText: input.userText,
      thinkingMap: input.thinkingMap,
      repairActive: input.repairActive,
    });
  const shape = selectResponseShape(input, conversationPhase);
  const shaped = applyResponseShape({
    draft: input.draftText,
    shape,
    cqriInput: input,
    seed,
    conversationPhase,
  });

  let text = shaped.text;
  let quality = runQualityGate(text, input);
  const regenerationReasons: CqriQualityFailure[] = [];
  let regenerationCount = 0;
  let usedFallback = false;

  if (!quality.passed) {
    regenerationCount = 1;
    regenerationReasons.push(...quality.failures);
    // One regenerate: tighten + suppress question if rhythm failed
    let retry = text;
    if (
      quality.failures.includes("rhythm-multi-question") ||
      quality.failures.includes("repetition-answered")
    ) {
      retry = preferObservationOverQuestion({
        text: retry,
        messages: input.messages,
        userText: input.userText,
        repairActive: true,
        responseKind: input.responseKind,
      }).text;
    }
    retry = applyLengthBudget(retry, "very-short");
    text = retry;
    quality = runQualityGate(text, input);
  }

  if (!quality.passed) {
    usedFallback = true;
    regenerationCount = 2;
    regenerationReasons.push(...quality.failures);
    text = buildSafeFallback(
      input.userText,
      seed + 3,
      input.thinkingMap?.topicAnchor?.primaryTopic ??
        input.thinkingMap?.literalTopic ??
        null,
    );
    quality = runQualityGate(text, input);
  }

  const telemetry: CqriTelemetry = {
    conversationPhase,
    responseShape: shape,
    questionVersusObservation: questionVersusObservation(text),
    lengthCategory: shaped.lengthCategory,
    repairTriggered: Boolean(input.repairActive),
    qualityGateFailures: quality.failures,
    regenerationCount,
    repeatedQuestionBlocked: shaped.repeatedQuestionBlocked,
    userConfusionSignal: Boolean(input.repairActive),
    completionCheckUsed: shaped.completionCheckUsed,
  };
  recordCqriTelemetry(telemetry);

  return {
    approvedText: text,
    responseShape: shape,
    lengthCategory: shaped.lengthCategory,
    conversationPhase,
    quality,
    regenerationReasons,
    usedFallback,
    telemetry,
  };
}
