/**
 * Local persistence for ecosystem snapshots.
 */

import type { EcosystemHealth, EcosystemPriority, EcosystemSnapshot } from "./types";

const STORE_KEY = "companion-ecosystem-intelligence-v1";

export type EcosystemStore = {
  history: EcosystemSnapshot[];
  founderSamples: {
    at: string;
    userHealth: EcosystemHealth;
    founderHealth: EcosystemHealth;
    topSignal: EcosystemPriority;
    suppressionCount: number;
    activeLayerCount: number;
  }[];
};

const DEFAULT_STORE: EcosystemStore = {
  history: [],
  founderSamples: [],
};

export function getEcosystemStore(): EcosystemStore {
  if (typeof window === "undefined") return { ...DEFAULT_STORE };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { ...DEFAULT_STORE };
    const parsed = JSON.parse(raw) as Partial<EcosystemStore>;
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

export function saveEcosystemStore(
  update: Partial<EcosystemStore>,
): EcosystemStore {
  const next = { ...getEcosystemStore(), ...update };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  }
  return next;
}

export function recordEcosystemSnapshot(snapshot: EcosystemSnapshot): void {
  const store = getEcosystemStore();
  saveEcosystemStore({
    history: [...store.history, snapshot].slice(-200),
    founderSamples: [
      ...store.founderSamples,
      {
        at: snapshot.createdAt,
        userHealth: snapshot.userState.health,
        founderHealth: snapshot.founderState.health,
        topSignal: snapshot.topSignal,
        suppressionCount: snapshot.suppressions.length,
        activeLayerCount: snapshot.activeIntelligenceLayers.length,
      },
    ].slice(-500),
  });
}

export const ECOSYSTEM_UPDATED_EVENT = "companion-ecosystem-updated";

export function notifyEcosystemUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ECOSYSTEM_UPDATED_EVENT));
  }
}
