/**
 * 051 — Next-best-step selection from Creation Context (not a rigid questionnaire).
 */

import { nextFoundationQuestion } from "@/lib/eventsIntelligence";
import type { EventRecord } from "@/lib/eventsIntelligence";
import type { NextBestStep, UniversalCreationContext } from "./types";

const FORBIDDEN_PROMPTS = [
  "what are you trying to get clear on",
  "what pieces can you already see",
  "what's actually on your mind right now",
  "what is actually on your mind right now",
];

export function selectNextBestStep(input: {
  context: UniversalCreationContext | null;
  record: EventRecord | null;
  intent: string;
}): NextBestStep {
  if (input.intent === "know") {
    return {
      kind: "answer_knowledge",
      prompt: "Answer directly from knowledge — do not open Create.",
      doNotReask: input.context?.doNotReaskFields ?? [],
    };
  }

  const ctx = input.context;
  const record = input.record;
  const doNotReask = ctx?.doNotReaskFields ?? [];

  if (ctx?.knownFacts.length) {
    const ack = ctx.knownFacts
      .slice(0, 3)
      .map((f) => f.value)
      .join("; ");

    // Prefer focused asset when foundation is partly known
    const topAsset = ctx.focusedRecommendations[0];
    if (
      doNotReask.includes("purpose") &&
      doNotReask.includes("audience") &&
      topAsset
    ) {
      return {
        kind: "recommend_asset",
        prompt: `We already have ${ack}. Next helpful step: ${topAsset.userFacingName}.`,
        sectionId: ctx.currentSectionId ?? null,
        assetTypeId: topAsset.assetTypeId,
        doNotReask,
      };
    }
  }

  const nextQ = record ? nextFoundationQuestion(record) : null;
  if (nextQ) {
    const field = nextQ.sectionId;
    if (doNotReask.includes(field)) {
      // Skip known — find another
      return {
        kind: "acknowledge",
        prompt: `Keeping ${field} as established. What would help most next?`,
        sectionId: field,
        doNotReask,
      };
    }
    return {
      kind: "ask",
      prompt: nextQ.prompt,
      sectionId: nextQ.sectionId,
      doNotReask,
    };
  }

  return {
    kind: "stay",
    prompt: ctx?.latestUserGoal
      ? `Continue from: ${ctx.latestUserGoal}`
      : "Continue in the Creation Workspace.",
    sectionId: ctx?.currentSectionId ?? null,
    doNotReask,
  };
}

export function isForbiddenCreationPrompt(text: string): boolean {
  const n = text.trim().toLowerCase();
  return FORBIDDEN_PROMPTS.some((p) => n.includes(p));
}

export function assertConversationSafe(reply: string): boolean {
  return !isForbiddenCreationPrompt(reply);
}
