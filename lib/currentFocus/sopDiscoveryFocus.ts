/**
 * SOP Reasoning-First Migration, Phase 2 (2026-08-06) — the discovery gate
 * that runs before SOP's existing section flow.
 *
 * This module intentionally does not author new discovery logic. It reuses
 * discoveryRegistry.ts's already-authored SOP questions verbatim (pure data,
 * type-only dependency graph — no chat routing, no shouldEnterDiscoveryMode,
 * no resolveImmediateCreateAction) and adds only the sequencing/mapping a
 * Build-Type-owned Focus gate needs: which question is next, and which
 * Working Memory field it writes to. Sequential completion (ask each
 * question once, in order) — not discoveryMode's confidence-threshold model,
 * which would add signal-pattern scoring for no benefit here.
 *
 * SOP-only, as approved. A future generalization to other Build Types would
 * extend the eligibility check and the field map, not this mechanism.
 *
 * @see docs/create-experience/CREATE_REASONING_FIRST_MIGRATION_IMPLEMENTATION_PLAN.md
 */

import { DISCOVERY_INTROS, DISCOVERY_QUESTIONS } from "@/lib/estateBrain/discoveryRegistry";
import type { DiscoveryQuestion } from "@/lib/estateBrain/discoveryTypes";
import type { WorkingMemoryFields } from "./workingMemory";

/** The only Working Memory fields a discovery question may write to. */
type SopDiscoveryFieldTarget = Extract<
  keyof WorkingMemoryFields,
  | "ownershipContext"
  | "existingAssetsFound"
  | "intendedAudience"
  | "desiredResult"
  | "whyItMatters"
>;

/**
 * Chat-First Reasoning Phase 1 (2026-08-06) — this map is the single
 * discovery-answer → Working Memory table, so the universal entrance
 * question ids (create-*) live here alongside SOP's. Same write path
 * (applyDiscoveryAnswerToRuntimeCreationRecord) for both.
 */
const SOP_DISCOVERY_FIELD_MAP: Record<string, SopDiscoveryFieldTarget> = {
  "sop-audience-type": "ownershipContext",
  "sop-starting-point": "existingAssetsFound",
  "sop-audience-size": "intendedAudience",
  "create-outcome": "desiredResult",
  "create-why": "whyItMatters",
  "create-audience": "intendedAudience",
};

export type SopDiscoveryState = {
  discoveryAnswers?: Record<string, string> | null;
  skippedDiscoveryIds?: readonly string[] | null;
};

export function isSopDiscoveryEligible(typeLabel: string | null | undefined): boolean {
  return (typeLabel?.trim().toLowerCase() ?? "") === "sop";
}

export function sopDiscoveryQuestions(): readonly DiscoveryQuestion[] {
  return DISCOVERY_QUESTIONS.create_sop;
}

export function sopDiscoveryIntro(): string | null {
  return DISCOVERY_INTROS.create_sop ?? null;
}

export function sopDiscoveryFieldForQuestion(
  questionId: string,
): SopDiscoveryFieldTarget | null {
  return SOP_DISCOVERY_FIELD_MAP[questionId] ?? null;
}

function isResolved(questionId: string, state: SopDiscoveryState): boolean {
  const answered = Boolean(state.discoveryAnswers?.[questionId]?.trim());
  const skipped = Boolean(state.skippedDiscoveryIds?.includes(questionId));
  return answered || skipped;
}

/** Next unanswered, unskipped question in authored order — null when done. */
export function nextSopDiscoveryQuestion(
  state: SopDiscoveryState,
): DiscoveryQuestion | null {
  return (
    sopDiscoveryQuestions().find((q) => !isResolved(q.id, state)) ?? null
  );
}

export function isSopDiscoveryComplete(state: SopDiscoveryState): boolean {
  return sopDiscoveryQuestions().every((q) => isResolved(q.id, state));
}
