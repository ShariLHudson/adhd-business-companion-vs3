/**
 * Local persistence for cognitive load history and gentle-offer dismissals.
 */

import type { CognitiveLoadSnapshot, LoadContributor } from "./types";

const STORE_KEY = "companion-cognitive-load-v1";

export type CognitiveLoadStore = {
  history: CognitiveLoadSnapshot[];
  offerDismissedOn: string | null;
  founderSamples: { at: string; value: number; level: string }[];
};

const DEFAULT_STORE: CognitiveLoadStore = {
  history: [],
  offerDismissedOn: null,
  founderSamples: [],
};

/** Migrate legacy slim snapshots to full CognitiveLoadSnapshot shape. */
export function normalizeCognitiveLoadSnapshot(
  raw: Record<string, unknown>,
): CognitiveLoadSnapshot | null {
  const createdAt =
    typeof raw.createdAt === "string"
      ? raw.createdAt
      : typeof raw.at === "string"
        ? raw.at
        : null;
  if (!createdAt) return null;

  const score =
    typeof raw.score === "number"
      ? raw.score
      : typeof raw.value === "number"
        ? raw.value
        : 0;
  const level =
    raw.level === "light" ||
    raw.level === "moderate" ||
    raw.level === "heavy" ||
    raw.level === "overloaded"
      ? raw.level
      : "light";

  const contributors = Array.isArray(raw.contributors)
    ? (raw.contributors as LoadContributor[])
    : [];

  const topIds = Array.isArray(raw.topContributorIds)
    ? (raw.topContributorIds as string[])
    : [];

  const mergedContributors =
    contributors.length > 0
      ? contributors
      : topIds.map((id) => ({
          id,
          domain: "business" as const,
          label: id.replaceAll("_", " "),
          points: 0,
          detail: "Recorded from earlier snapshot",
        }));

  return {
    score,
    level,
    contributors: mergedContributors,
    summary: typeof raw.summary === "string" ? raw.summary : "",
    recommendations: Array.isArray(raw.recommendations)
      ? (raw.recommendations as string[])
      : [],
    createdAt,
  };
}

export function getCognitiveLoadStore(): CognitiveLoadStore {
  if (typeof window === "undefined") return { ...DEFAULT_STORE };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { ...DEFAULT_STORE };
    const parsed = JSON.parse(raw) as Partial<CognitiveLoadStore> & {
      history?: Record<string, unknown>[];
    };
    const history = Array.isArray(parsed.history)
      ? parsed.history
          .map((h) => normalizeCognitiveLoadSnapshot(h))
          .filter((h): h is CognitiveLoadSnapshot => h !== null)
      : [];
    return {
      ...DEFAULT_STORE,
      ...parsed,
      history,
      founderSamples: Array.isArray(parsed.founderSamples)
        ? parsed.founderSamples
        : [],
    };
  } catch {
    return { ...DEFAULT_STORE };
  }
}

export function saveCognitiveLoadStore(
  update: Partial<CognitiveLoadStore>,
): CognitiveLoadStore {
  const next = { ...getCognitiveLoadStore(), ...update };
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

export function recordCognitiveLoadSnapshot(
  snapshot: CognitiveLoadSnapshot,
): void {
  const store = getCognitiveLoadStore();
  const today = snapshot.createdAt.slice(0, 10);
  const withoutToday = store.history.filter(
    (h) => !h.createdAt.startsWith(today),
  );
  saveCognitiveLoadStore({
    history: [...withoutToday, snapshot].slice(-90),
    founderSamples: [
      ...store.founderSamples,
      {
        at: snapshot.createdAt,
        value: snapshot.score,
        level: snapshot.level,
      },
    ].slice(-500),
  });
}

export function priorCognitiveLoadScore(now = new Date()): number | null {
  const store = getCognitiveLoadStore();
  const today = dayKey(now);
  const prior = store.history.filter((h) => !h.createdAt.startsWith(today));
  if (!prior.length) return null;
  return prior[prior.length - 1]?.score ?? null;
}

export function isLoadOfferDismissedToday(now = new Date()): boolean {
  return getCognitiveLoadStore().offerDismissedOn === dayKey(now);
}

export function dismissLoadOffer(now = new Date()): void {
  saveCognitiveLoadStore({ offerDismissedOn: dayKey(now) });
}

export const COGNITIVE_LOAD_UPDATED_EVENT = "companion-cognitive-load-updated";

export function notifyCognitiveLoadUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(COGNITIVE_LOAD_UPDATED_EVENT));
  }
}
