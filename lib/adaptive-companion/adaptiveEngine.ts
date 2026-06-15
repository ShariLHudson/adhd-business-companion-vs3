/**
 * Adaptive Companion Intelligence — decide how Shari should respond.
 */

import { buildAdaptivePromptBlock } from "./adaptiveMessages";
import {
  detectResponseModeCandidates,
  pickResponseMode,
} from "./responseModeDetection";
import {
  notifyAdaptiveUpdated,
  recordAdaptiveDecision,
} from "./adaptiveStore";
import type { AdaptiveDecision, AdaptiveInput } from "./types";

export function evaluateAdaptiveCompanion(
  input: AdaptiveInput = {},
): AdaptiveDecision {
  const now = input.now ?? new Date();
  const candidates = detectResponseModeCandidates(input);
  const picked = pickResponseMode(candidates);
  return {
    mode: picked.mode,
    confidence: picked.confidence,
    reason: picked.reason,
    createdAt: now.toISOString(),
  };
}

export function evaluateAndRecordAdaptiveCompanion(
  input: AdaptiveInput = {},
): AdaptiveDecision {
  const decision = evaluateAdaptiveCompanion(input);
  recordAdaptiveDecision(decision);
  notifyAdaptiveUpdated();
  return decision;
}

export function adaptiveHintForChat(decision: AdaptiveDecision): string {
  return buildAdaptivePromptBlock(decision);
}
