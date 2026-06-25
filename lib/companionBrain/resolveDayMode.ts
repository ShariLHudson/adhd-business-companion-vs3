/**
 * DayMode resolver — emotional and cognitive frame for reasoning.
 * @see constitution.ts — resolveDayMode
 */

import type { CompanionMemorySnapshot, DayMode } from "./types";
import { isCooldownActive } from "./store";

const FAMILY_RE = /\b(kid sick|child sick|staying home|family)\b/i;
const CELEBRATION_RE = /\b(we did it|launch went live|accomplish|celebrat)\b/i;

export function resolveDayMode(memory: CompanionMemorySnapshot): DayMode {
  const { capacity, sessionFlags, captureLoad, yesterdaySummary } = memory;
  const recent = captureLoad?.recentCaptures ?? [];
  const cooldowns = memory.activeCooldowns ?? [];

  if (sessionFlags?.hyperfocusActive) return "hyperfocus";

  if (sessionFlags?.userDeclaredSurvival) return "survival";

  if (capacity.healthNote?.trim()) return "health";

  if (recent.some((c) => FAMILY_RE.test(c))) return "family";

  if (
    recent.some((c) => CELEBRATION_RE.test(c)) ||
    yesterdaySummary?.toLowerCase().includes("launch went live")
  ) {
    return "celebration";
  }

  if (
    isCooldownActive(memory.brainState, "celebration", memory.dayKey) ||
    cooldowns.includes("celebration")
  ) {
    if (capacity.energy === "low" && capacity.motivation === "low") {
      return "recovery";
    }
  }

  if (
    yesterdaySummary &&
    /\b(abandon|1\/4|failed|didn't go)\b/i.test(yesterdaySummary) &&
    capacity.motivation === "low"
  ) {
    return "recovery";
  }

  if (isCooldownActive(memory.brainState, "survival", memory.dayKey)) {
    return "recovery";
  }

  if (
    capacity.energy === "low" &&
    capacity.motivation === "low" &&
    capacity.vibe === "foggy"
  ) {
    return "survival";
  }

  if (capacity.vibe === "creative" && capacity.motivation === "scattered") {
    return "creative";
  }

  return "normal";
}
