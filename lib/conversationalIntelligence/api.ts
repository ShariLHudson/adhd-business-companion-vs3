/**
 * Shared Conversational Intelligence API — delivery after reasoning.
 */

import { detectConversationalGoal, curiosityObjectiveForKind } from "./goalDetection";
import {
  expressConversationalDraft,
  fallbackExpression,
} from "./expressionEngine";
import { certifyConversationalQuality } from "./qualityCert";
import { selectExpressionToneBand } from "./toneSelection";
import type { CiDeliveryInput, CiDeliveryResult } from "./types";
import type { RciResponseKind } from "@/lib/reflectiveConversationIntelligence";

function asRciKind(
  kind: CiDeliveryInput["responseKind"],
): RciResponseKind | "help_offer" | "other" {
  return kind;
}

/**
 * Express one natural response from a reasoned draft.
 * Does not change the reflective move — only wording, pacing, and tone.
 */
export function deliverConversationalResponse(
  input: CiDeliveryInput,
): CiDeliveryResult {
  const goal = detectConversationalGoal({
    userText: input.userText,
    responseKind: asRciKind(input.responseKind),
  });
  const toneBand = selectExpressionToneBand({
    archetype: input.archetype,
    goal,
    userText: input.userText,
  });
  const curiosityObjective = curiosityObjectiveForKind(
    asRciKind(input.responseKind),
  );

  let text = expressConversationalDraft({
    draftText: input.draftText,
    userText: input.userText,
    toneBand,
    aiTone: input.aiTone,
    recentAssistantTexts: input.recentAssistantTexts,
    preferBrevity: input.preferBrevity,
    responseKind: input.responseKind,
  });

  let quality = certifyConversationalQuality({
    text,
    userText: input.userText,
    recentAssistantTexts: input.recentAssistantTexts,
  });
  let regenerated = false;

  if (!quality.passed) {
    regenerated = true;
    // Second pass: strip harder, then fallback if still failing
    text = expressConversationalDraft({
      draftText: text,
      userText: input.userText,
      toneBand,
      aiTone: input.aiTone ?? "direct",
      recentAssistantTexts: input.recentAssistantTexts,
      preferBrevity: true,
      responseKind: input.responseKind,
    });
    quality = certifyConversationalQuality({
      text,
      userText: input.userText,
      recentAssistantTexts: input.recentAssistantTexts,
    });
    if (!quality.passed) {
      text = fallbackExpression(
        input.userText,
        input.draftText.length + input.userText.length,
      );
      quality = certifyConversationalQuality({
        text,
        userText: input.userText,
        recentAssistantTexts: input.recentAssistantTexts,
      });
    }
  }

  return {
    text,
    goal,
    toneBand,
    curiosityObjective,
    quality,
    regenerated,
  };
}
