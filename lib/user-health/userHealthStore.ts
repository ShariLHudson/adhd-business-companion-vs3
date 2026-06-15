/**
 * Local persistence for user health snapshots — founder insight only.
 */

import type { SupportNeed, UserHealthSnapshot, UserHealthStatus } from "./types";

const STORE_KEY = "companion-user-health-v1";

export type UserHealthStore = {
  history: UserHealthSnapshot[];
  founderSamples: {
    at: string;
    status: UserHealthStatus;
    confidence: string;
    supportNeeds: SupportNeed[];
  }[];
};

const DEFAULT_STORE: UserHealthStore = {
  history: [],
  founderSamples: [],
};

export function getUserHealthStore(): UserHealthStore {
  if (typeof window === "undefined") return { ...DEFAULT_STORE };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { ...DEFAULT_STORE };
    const parsed = JSON.parse(raw) as Partial<UserHealthStore>;
    return {
      ...DEFAULT_STORE,
      ...parsed,
      history: Array.isArray(parsed.history) ? parsed.history : [],
      founderSamples: Array.isArray(parsed.founderSamples)
        ? parsed.founderSamples
        : [],
    };
  } catch {
    return { ...DEFAULT_STORE };
  }
}

export function saveUserHealthStore(
  update: Partial<UserHealthStore>,
): UserHealthStore {
  const next = { ...getUserHealthStore(), ...update };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  }
  return next;
}

export function recordUserHealthSnapshot(snapshot: UserHealthSnapshot): void {
  const store = getUserHealthStore();
  saveUserHealthStore({
    history: [...store.history, snapshot].slice(-200),
    founderSamples: [
      ...store.founderSamples,
      {
        at: snapshot.createdAt,
        status: snapshot.status,
        confidence: snapshot.confidence,
        supportNeeds: snapshot.supportNeeds,
      },
    ].slice(-500),
  });
}

export const USER_HEALTH_UPDATED_EVENT = "companion-user-health-updated";

export function notifyUserHealthUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(USER_HEALTH_UPDATED_EVENT));
  }
}
