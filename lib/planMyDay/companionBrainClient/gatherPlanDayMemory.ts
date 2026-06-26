/**
 * Gather ecosystem memory for Plan My Day™ — adapter only, no reasoning.
 */

import { getBrainDumps, getDayState, todayStr } from "@/lib/companionStore";
import type { CompanionCandidate, CompanionMemorySnapshot } from "@/lib/companionBrain";
import { readTodayPlanItems } from "@/lib/planMyDay/planDayItems";
import { mapEcosystemToCompanionMemory } from "./mapMemoryFromEcosystem";

function brainDumpCandidates(dumps: ReturnType<typeof getBrainDumps>): CompanionCandidate[] {
  return dumps
    .filter((d) => d.text?.trim())
    .slice(-12)
    .map((d, i) => ({
      id: `cmm-${d.id ?? i}`,
      label: d.text.trim().slice(0, 120),
      source: "capture",
      themes: ["capture"],
      estimatedMinutes: 20,
      unlockScore: 0.55,
      fitScore: 0.5,
    }));
}

export function gatherPlanDayMemory(dayKey = todayStr()): CompanionMemorySnapshot {
  const dayState = getDayState();
  const planItems = readTodayPlanItems();
  const dumps = getBrainDumps();
  const recentCaptures = dumps
    .map((d) => d.text?.trim())
    .filter(Boolean)
    .slice(-5) as string[];

  const memory = mapEcosystemToCompanionMemory({
    dayKey,
    dayState,
    planItems,
    thoughtCount: dumps.length,
    recentCaptures,
  });

  const seen = new Set(memory.candidates.map((c) => c.label.toLowerCase()));
  const extra = brainDumpCandidates(dumps).filter(
    (c) => !seen.has(c.label.toLowerCase()),
  );

  return {
    ...memory,
    candidates: [...memory.candidates, ...extra],
  };
}
