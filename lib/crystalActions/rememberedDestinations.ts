/**
 * Remember Crystal Action destination choices so Spark asks only when needed.
 */

import type {
  CrystalActionDestinationId,
  CrystalActionId,
  CrystalActionItemKind,
} from "./types";

const STORAGE_KEY = "companion-crystal-action-destinations-v1";

export type CrystalActionDestinationMemory = Partial<
  Record<
    CrystalActionItemKind,
    Partial<Record<CrystalActionId, CrystalActionDestinationId>>
  >
>;

function hasStorage(): boolean {
  return (
    typeof globalThis.window !== "undefined" &&
    typeof globalThis.localStorage !== "undefined"
  );
}

export function readCrystalActionDestinations(): CrystalActionDestinationMemory {
  if (!hasStorage()) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as CrystalActionDestinationMemory;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function rememberCrystalActionDestination(input: {
  itemKind: CrystalActionItemKind;
  actionId: CrystalActionId;
  destinationId: CrystalActionDestinationId;
}): CrystalActionDestinationMemory {
  const current = readCrystalActionDestinations();
  const next: CrystalActionDestinationMemory = {
    ...current,
    [input.itemKind]: {
      ...(current[input.itemKind] ?? {}),
      [input.actionId]: input.destinationId,
    },
  };
  if (hasStorage()) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(
        new CustomEvent("companion-crystal-action-destinations-updated"),
      );
    } catch {
      /* quota */
    }
  }
  return next;
}

export function getRememberedDestination(
  itemKind: CrystalActionItemKind,
  actionId: CrystalActionId,
  memory: CrystalActionDestinationMemory = readCrystalActionDestinations(),
): CrystalActionDestinationId | null {
  return memory[itemKind]?.[actionId] ?? null;
}

export function resetCrystalActionDestinationsForTests(): void {
  if (hasStorage()) {
    localStorage.removeItem(STORAGE_KEY);
  }
}
