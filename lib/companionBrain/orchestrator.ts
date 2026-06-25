/**
 * Companion Brain™ orchestrator — reasoning cycle entry point.
 * Pages call this. The brain never calls pages.
 */

import { assembleContext } from "./assembleContext";
import { generateCompanionJudgment } from "./generateCompanionJudgment";
import { performReflection } from "./performReflection";
import { writeCompanionBrainState } from "./store";
import type {
  CompanionMemorySnapshot,
  ReasoningCycleResult,
  ReflectionInput,
  ReflectionResult,
} from "./types";

export function runReasoningCycle(
  memory: CompanionMemorySnapshot,
): ReasoningCycleResult {
  const assembled = assembleContext(memory);
  const judgment = generateCompanionJudgment(assembled);
  return { assembled, judgment };
}

export function runReflectionCycle(input: ReflectionInput): ReflectionResult {
  const result = performReflection(input);
  writeCompanionBrainState(result.brainState);
  return result;
}

/** Companion Brain™ — permanent reasoning center. */
export const CompanionBrain = {
  runReasoningCycle,
  runReflectionCycle,
  assembleContext,
  generateCompanionJudgment,
  performReflection,
} as const;
