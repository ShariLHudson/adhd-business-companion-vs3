/**
 * Local persistence for loop observations and snapshots.
 */

import type { LoopSignalObservation, LoopSnapshot, LoopType } from "./types";

const STORE_KEY = "companion-loop-intelligence-v1";

export type LoopStore = {
  observations: LoopSignalObservation[];
  snapshots: LoopSnapshot[];
  offerDismissedOn: string | null;
  /** Per-loop-type dismiss until next day. */
  dismissedLoopTypes: Partial<Record<LoopType, string>>;
};

const DEFAULT_STORE: LoopStore = {
  observations: [],
  snapshots: [],
  offerDismissedOn: null,
  dismissedLoopTypes: {},
};

export function getLoopStore(): LoopStore {
  if (typeof window === "undefined") return { ...DEFAULT_STORE };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { ...DEFAULT_STORE };
    const parsed = JSON.parse(raw) as Partial<LoopStore>;
    return {
      ...DEFAULT_STORE,
      ...parsed,
      observations: Array.isArray(parsed.observations)
        ? parsed.observations
        : [],
      snapshots: Array.isArray(parsed.snapshots) ? parsed.snapshots : [],
      dismissedLoopTypes: parsed.dismissedLoopTypes ?? {},
    };
  } catch {
    return { ...DEFAULT_STORE };
  }
}

export function saveLoopStore(update: Partial<LoopStore>): LoopStore {
  const next = { ...getLoopStore(), ...update };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  }
  return next;
}

export function dayKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function recordLoopObservations(
  observations: LoopSignalObservation[],
): void {
  if (!observations.length) return;
  const store = getLoopStore();
  saveLoopStore({
    observations: [...store.observations, ...observations].slice(-400),
  });
}

export function recordLoopSnapshot(snapshot: LoopSnapshot): void {
  const store = getLoopStore();
  const today = snapshot.createdAt.slice(0, 10);
  const withoutToday = store.snapshots.filter(
    (s) =>
      !s.createdAt.startsWith(today) || s.loopType !== snapshot.loopType,
  );
  saveLoopStore({
    snapshots: [...withoutToday, snapshot].slice(-90),
  });
}

export function getLoopObservations(): LoopSignalObservation[] {
  return getLoopStore().observations;
}

export function isLoopOfferDismissedToday(now = new Date()): boolean {
  return getLoopStore().offerDismissedOn === dayKey(now);
}

export function isLoopTypeDismissedToday(
  loopType: LoopType,
  now = new Date(),
): boolean {
  const store = getLoopStore();
  if (store.offerDismissedOn === dayKey(now)) return true;
  return store.dismissedLoopTypes[loopType] === dayKey(now);
}

export function dismissLoopOffer(
  loopType?: LoopType,
  now = new Date(),
): void {
  const dk = dayKey(now);
  if (loopType) {
    saveLoopStore({
      dismissedLoopTypes: {
        ...getLoopStore().dismissedLoopTypes,
        [loopType]: dk,
      },
    });
    return;
  }
  saveLoopStore({ offerDismissedOn: dk });
}

export const LOOP_UPDATED_EVENT = "companion-loop-intelligence-updated";

export function notifyLoopUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(LOOP_UPDATED_EVENT));
  }
}
