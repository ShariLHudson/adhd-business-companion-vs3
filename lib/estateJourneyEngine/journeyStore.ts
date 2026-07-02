/**
 * Estate Journey Engine™ — read/write helpers on Estate Memory.
 */

import type { EstateMemory } from "@/lib/estateMemory/types";
import {
  getEstateMemory,
  patchEstateMemory,
} from "@/lib/estateMemory/estateMemoryStore";
import {
  cloneJourneyEngineState,
  createEmptyJourneyEngineState,
  normalizeJourneyEngineState,
} from "./state";
import type { EstateJourneyEngineState } from "./types";

export function getJourneyEngineState(
  mem: EstateMemory | null = getEstateMemory(),
): EstateJourneyEngineState {
  if (!mem?.journeyEngine) return createEmptyJourneyEngineState();
  return normalizeJourneyEngineState(mem.journeyEngine);
}

export function patchJourneyEngine(
  patch: (current: EstateJourneyEngineState) => EstateJourneyEngineState,
): EstateJourneyEngineState {
  let next: EstateJourneyEngineState = createEmptyJourneyEngineState();
  patchEstateMemory((mem) => {
    const current = getJourneyEngineState(mem);
    next = patch(cloneJourneyEngineState(current));
    return { ...mem, journeyEngine: next };
  });
  return next;
}

export function ensureEstateMemoryHasJourneyEngine(
  mem: EstateMemory,
): EstateMemory {
  if (mem.journeyEngine) {
    return { ...mem, journeyEngine: normalizeJourneyEngineState(mem.journeyEngine) };
  }
  return { ...mem, journeyEngine: createEmptyJourneyEngineState() };
}
