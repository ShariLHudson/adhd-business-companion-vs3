import { getEcosystemUserId } from "@/lib/ecosystem/ecosystemUserId";

import type { IntelligenceProfile, IntelligenceProfileStore, TraitMap } from "./types";

const STORE_KEY = "companion-intelligence-profile-v1";

function emptyTraitMap(): TraitMap {
  return {};
}

export function createEmptyIntelligenceProfile(
  userId?: string,
): IntelligenceProfile {
  const now = new Date().toISOString();
  const id = userId ?? getEcosystemUserId();
  return {
    version: 1,
    userId: id,
    createdAt: now,
    updatedAt: now,
    signalCount: 0,
    human: {
      executiveFunction: emptyTraitMap(),
      emotional: emptyTraitMap(),
      energy: emptyTraitMap(),
      learning: emptyTraitMap(),
    },
    relationship: {
      communicationStyle: emptyTraitMap(),
      trust: emptyTraitMap(),
      supportStyle: emptyTraitMap(),
    },
    business: {
      identity: emptyTraitMap(),
      stage: emptyTraitMap(),
      visibility: emptyTraitMap(),
      revenueActivity: emptyTraitMap(),
    },
    adhd: {
      resistance: emptyTraitMap(),
      momentum: emptyTraitMap(),
      recovery: emptyTraitMap(),
    },
  };
}

export function getIntelligenceProfileStore(): IntelligenceProfileStore {
  if (typeof window === "undefined") {
    return {
      profile: createEmptyIntelligenceProfile("ssr"),
      lastEvolvedAt: null,
    };
  }
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      return {
        profile: createEmptyIntelligenceProfile(),
        lastEvolvedAt: null,
      };
    }
    const parsed = JSON.parse(raw) as Partial<IntelligenceProfileStore>;
    const profile = parsed.profile;
    if (!profile || profile.version !== 1) {
      return {
        profile: createEmptyIntelligenceProfile(),
        lastEvolvedAt: null,
      };
    }
    return {
      profile,
      lastEvolvedAt: parsed.lastEvolvedAt ?? null,
    };
  } catch {
    return {
      profile: createEmptyIntelligenceProfile(),
      lastEvolvedAt: null,
    };
  }
}

export function saveIntelligenceProfile(
  profile: IntelligenceProfile,
  lastEvolvedAt?: string,
): IntelligenceProfile {
  const store: IntelligenceProfileStore = {
    profile: { ...profile, updatedAt: new Date().toISOString() },
    lastEvolvedAt: lastEvolvedAt ?? new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
      window.dispatchEvent(new Event("companion-intelligence-profile-updated"));
    } catch {
      /* quota */
    }
  }
  return store.profile;
}

export function getIntelligenceProfile(): IntelligenceProfile {
  return getIntelligenceProfileStore().profile;
}
