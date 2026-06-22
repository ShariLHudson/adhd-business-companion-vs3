import { getIntelligenceSignalStore } from "./signalStore";
import {
  createEmptyIntelligenceProfile,
  getIntelligenceProfile,
  saveIntelligenceProfile,
} from "./profileStore";
import { resolveSignalTraitMapping } from "./signalMapping";
import type {
  IntelligenceProfile,
  IntelligenceSignal,
  IntelligenceSignalValence,
  TraitMap,
  TraitScore,
} from "./types";

const LEARNING_RATE = 0.15;
const CONFIDENCE_STEP = 0.04;
const MAX_CONFIDENCE = 0.95;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function parseTraitPath(path: string): {
  section: keyof IntelligenceProfile;
  subsection: string;
  trait: string;
} | null {
  const parts = path.split(".");
  if (parts.length !== 3) return null;
  const [section, subsection, trait] = parts;
  if (
    section !== "human" &&
    section !== "relationship" &&
    section !== "business" &&
    section !== "adhd"
  ) {
    return null;
  }
  return {
    section: section as keyof IntelligenceProfile,
    subsection,
    trait,
  };
}

function getSubsectionMap(
  profile: IntelligenceProfile,
  section: "human" | "relationship" | "business" | "adhd",
  subsection: string,
): TraitMap | null {
  const block = profile[section] as Record<string, TraitMap>;
  return block[subsection] ?? null;
}

function applyValenceToTarget(
  valence: IntelligenceSignalValence | undefined,
  weight: number,
  trait: string,
): number {
  const burdenTrait =
    trait.startsWith("often_") ||
    trait.endsWith("_risk") ||
    trait.includes("avoider") ||
    trait.includes("weak_") ||
    trait.includes("disengages") ||
    trait.includes("perfectionist") ||
    trait.includes("slow_decision");

  if (valence === "positive") {
    return burdenTrait ? 50 - weight * 0.4 : 50 + weight;
  }
  if (valence === "negative") {
    return burdenTrait ? 50 + weight : 50 - weight * 0.4;
  }
  return 50 + weight * 0.35;
}

function updateTrait(
  existing: TraitScore | undefined,
  targetScore: number,
  at: string,
  trait: string,
): TraitScore {
  const prev = existing ?? {
    trait,
    score: 50,
    confidence: 0,
    observations: 0,
    lastUpdated: at,
  };
  const newScore = clamp(
    prev.score * (1 - LEARNING_RATE) + targetScore * LEARNING_RATE,
    0,
    100,
  );
  const observations = prev.observations + 1;
  const confidence = clamp(
    prev.confidence + CONFIDENCE_STEP * (1 - prev.confidence),
    0,
    MAX_CONFIDENCE,
  );
  return {
    trait,
    score: Math.round(newScore * 10) / 10,
    confidence: Math.round(confidence * 1000) / 1000,
    observations,
    lastUpdated: at,
  };
}

function applySignalToProfile(
  profile: IntelligenceProfile,
  signal: IntelligenceSignal,
): IntelligenceProfile {
  const mapping = resolveSignalTraitMapping(signal.category);
  if (!mapping) return profile;

  const weight = mapping.weight ?? 6;
  const next = structuredClone(profile);

  for (const path of mapping.paths) {
    const parsed = parseTraitPath(path);
    if (!parsed) continue;
    const map = getSubsectionMap(
      next,
      parsed.section as "human" | "relationship" | "business" | "adhd",
      parsed.subsection,
    );
    if (!map) continue;
    map[parsed.trait] = updateTrait(
      map[parsed.trait],
      applyValenceToTarget(signal.valence, weight, parsed.trait),
      signal.at,
      parsed.trait,
    );
  }

  return next;
}

/** Evolve profile from all stored signals (idempotent full replay). */
export function evolveIntelligenceProfileFromSignals(): IntelligenceProfile {
  const signals = getIntelligenceSignalStore().signals;
  let profile = createEmptyIntelligenceProfile(
    getIntelligenceProfile().userId,
  );
  const createdAt = getIntelligenceProfile().createdAt;
  profile.createdAt = createdAt;

  for (const signal of signals) {
    profile = applySignalToProfile(profile, signal);
  }

  profile.signalCount = signals.length;
  profile.updatedAt = new Date().toISOString();
  return saveIntelligenceProfile(profile);
}

/** Apply a single new signal incrementally (faster path after record). */
export function applySignalIncrementally(
  signal: IntelligenceSignal,
): IntelligenceProfile {
  const current = getIntelligenceProfile();
  const next = applySignalToProfile(current, signal);
  next.signalCount = getIntelligenceSignalStore().signals.length;
  return saveIntelligenceProfile(next);
}

export function topTraitsFromMap(
  map: TraitMap,
  limit = 3,
  minConfidence = 0.08,
): TraitScore[] {
  return Object.values(map)
    .filter((t) => t.confidence >= minConfidence)
    .sort((a, b) => b.score * b.confidence - a.score * a.confidence)
    .slice(0, limit);
}

export function flattenTraitMaps(
  ...maps: TraitMap[]
): TraitScore[] {
  return maps.flatMap((m) => Object.values(m));
}
