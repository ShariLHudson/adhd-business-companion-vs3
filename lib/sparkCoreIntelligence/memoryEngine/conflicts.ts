/**
 * Conflict detection when new info contradicts stored memory.
 */

import { findByKey } from "./store";
import type { MemoryConflict, MemoryKey } from "./types";

function normalize(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function detectConflict(
  userId: string,
  key: MemoryKey | string,
  proposedValue: unknown,
): MemoryConflict | undefined {
  const existing = findByKey(userId, key);
  if (!existing) return undefined;

  const a = normalize(existing.value);
  const b = normalize(proposedValue);
  if (!a || !b || a === b) return undefined;

  const label = key.replace(/_/g, " ");
  return {
    existingId: existing.id,
    existingValue: existing.value,
    proposedValue,
    key,
    promptText: `I have your ${label} as "${existing.value}" — would you like me to update it to "${proposedValue}"?`,
  };
}

export function detectConflicts(
  userId: string,
  facts: Array<{ key: MemoryKey | string; value: unknown }>,
): MemoryConflict[] {
  const conflicts: MemoryConflict[] = [];
  for (const fact of facts) {
    const conflict = detectConflict(userId, fact.key, fact.value);
    if (conflict) conflicts.push(conflict);
  }
  return conflicts;
}
