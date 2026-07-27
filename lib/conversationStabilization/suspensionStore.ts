/**
 * Session-scoped persistence for the shared SuspensionState (S3).
 *
 * The cross-turn record for parked Create work. Wraps the immutable S2
 * operations (conversationSuspension) over sessionStorage, bounded by
 * MAX_SUSPENSION_DEPTH, isolated from long-term memory, and cleared by
 * resetActiveConversation on New Chat / New Day. This is the ONLY suspension
 * store — Create parking records its SuspendedContext here rather than in a
 * second parallel store.
 */

import {
  emptySuspensionState,
  resume as resumeOp,
  suspend as suspendOp,
  type SuspendedContext,
  type SuspensionState,
} from "@/lib/conversationSuspension";

export const SUSPENSION_STORAGE_KEY = "spark-suspension-v1" as const;

let memoryFallback: SuspensionState = emptySuspensionState();

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

export function loadSuspensionState(): SuspensionState {
  if (!canUseSessionStorage()) return memoryFallback;
  try {
    const raw = sessionStorage.getItem(SUSPENSION_STORAGE_KEY);
    if (!raw) return emptySuspensionState();
    const parsed = JSON.parse(raw) as SuspensionState;
    if (!parsed || !Array.isArray(parsed.stack)) return emptySuspensionState();
    return parsed;
  } catch {
    return emptySuspensionState();
  }
}

function saveSuspensionState(state: SuspensionState): void {
  memoryFallback = state;
  if (!canUseSessionStorage()) return;
  try {
    sessionStorage.setItem(SUSPENSION_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

/** Persist a suspended context (push), honoring bounded depth + dedup (S2 op). */
export function pushSuspendedContext(
  context: Omit<SuspendedContext, "id"> & { id?: string },
): SuspensionState {
  const next = suspendOp(loadSuspensionState(), context);
  saveSuspensionState(next);
  return next;
}

/** Resume (pop) a suspended context by id, or the most recent when omitted. */
export function popSuspendedContext(id?: string): SuspendedContext | null {
  const { state, resumed } = resumeOp(loadSuspensionState(), id);
  if (resumed) saveSuspensionState(state);
  return resumed;
}

/** Reset — the single teardown, called by resetActiveConversation. */
export function clearSuspensionStore(): void {
  memoryFallback = emptySuspensionState();
  if (!canUseSessionStorage()) return;
  try {
    sessionStorage.removeItem(SUSPENSION_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function resetSuspensionStoreForTests(): void {
  clearSuspensionStore();
}
