/**
 * Single orchestrated per-turn companion hint — Decision Engine owns the turn.
 */

import {
  formatEmotionalContinuation,
  planEmotionalFirstResponse,
  shouldUseEmotionalFirstSequence,
} from "@/lib/conversation/emotionalFirstResponseSequence";
import {
  isDifficultClientCallRequest,
  SHARI_BANNED_PHRASE_LABELS,
  SHARI_CORE_LAW,
} from "@/lib/conversation/shariCompanionEngine";
import { SPARK_LANDSCAPES } from "./sparkLandscapes/landscapes";
import { evaluateSparkDecisionEngine } from "./sparkDecisionEngine/evaluateDecisionEngine";
import { mapDecisionToRuntimeAction } from "./mapDecisionToRuntimeAction";
import { canonicalRoleLabel } from "./canonicalRole";
import type { SparkCompanionHintInput } from "./types";

const CONFLICT_DREAD_RE =
  /\b(?:conflict|confrontation|pushback|boundary conversation|hard conversation)\b/i;

const TASK_HELP_AFTER_EMOTION_RE =
  /\b(?:call|email|script|conversation with|talk to)\b/i;

export function buildSparkCompanionHint(
  input: SparkCompanionHintInput,
): string | null {
  const text = input.userText.trim();
  if (!text) return null;

  const decision = evaluateSparkDecisionEngine({
    userText: text,
    overwhelmed: input.overwhelmed,
    momentumActive: input.momentumActive,
    placeId: input.placeId ?? input.currentRoom ?? null,
    trustEstablished: input.trustEstablished,
  });

  const runtime = mapDecisionToRuntimeAction({
    userText: text,
    overwhelmed: input.overwhelmed,
    momentumActive: input.momentumActive,
    placeId: input.placeId ?? input.currentRoom ?? null,
    isReturning: input.isReturning,
    trustEstablished: input.trustEstablished,
    currentRoom: input.currentRoom,
    activeWorkflow: input.activeWorkflow,
    activeDocument: input.activeDocument,
    pendingNavigationChoices: input.pendingNavigationChoices,
    pendingConciergeChoices: input.pendingConciergeChoices,
    decision,
  });

  const landscape = SPARK_LANDSCAPES[decision.landscape.primary];
  const lines: string[] = [
    "SPARK COMPANION (one hint — orchestrate silently):",
    `Intent ${decision.intent} · Friction ${decision.friction} · Role ${canonicalRoleLabel(runtime.canonicalRole)} · Mode ${runtime.runtimeMode} · Depth ${runtime.depth}`,
    runtime.operationalHint,
  ];

  if (landscape && decision.landscape.confidence !== "low") {
    lines.push(`Landscape ${landscape.name} — ${landscape.helpFocus}`);
  }

  if (input.currentRoom) {
    lines.push(`Room ${input.currentRoom} — atmosphere only; capability unchanged.`);
  }
  if (input.activeWorkflow) {
    lines.push(`Active workflow ${input.activeWorkflow} — resume, do not restart.`);
  }
  if (input.activeDocument) {
    lines.push(`Active document ${input.activeDocument} — coach beside it.`);
  }
  if (input.pendingNavigationChoices) {
    lines.push("Pending estate destination choices — numbered menu only; resolve before new routing.");
  }
  if (input.pendingConciergeChoices) {
    lines.push("Pending concierge choices — resolve selection before new offers.");
  }

  lines.push(...SHARI_CORE_LAW.map((l) => `- ${l}`));

  const emotionalPlan = planEmotionalFirstResponse({
    text,
    hasSolutionReady: input.hasSolutionReady,
  });

  if (
    shouldUseEmotionalFirstSequence(text) &&
    !runtime.suppressEmotionalCoaching
  ) {
    lines.push("Emotional-first this turn — reflect before instruction.");
  }

  if (input.memberDislikesConflict && CONFLICT_DREAD_RE.test(text)) {
    lines.push(
      'MEMORY (once): conflict is hard for them — calm, clear, kind.',
    );
  }

  if (isDifficultClientCallRequest(text)) {
    lines.push(
      "DIFFICULT CLIENT CALL — weight first, then script/practice offer.",
    );
  } else if (
    emotionalPlan.requiresEmotionalFirstSequence &&
    TASK_HELP_AFTER_EMOTION_RE.test(text) &&
    !runtime.suppressEmotionalCoaching
  ) {
    lines.push("TASK HELP after grounding only — script/practice/stay.");
  }

  if (input.hasSolutionReady || input.taskHelpReady) {
    lines.push(
      `Continue: "${formatEmotionalContinuation(emotionalPlan)}"`,
    );
  }

  lines.push(
    `FORBIDDEN: ${SHARI_BANNED_PHRASE_LABELS.slice(0, 5).join(" · ")}`,
  );

  return lines.join("\n");
}
