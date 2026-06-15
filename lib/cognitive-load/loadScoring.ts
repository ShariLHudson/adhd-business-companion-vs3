import type {
  CognitiveLoadLevel,
  CognitiveLoadScore,
  LoadContributor,
  LoadDomain,
} from "./types";

const LEVEL_BANDS: {
  level: CognitiveLoadLevel;
  min: number;
  max: number;
  label: string;
}[] = [
  { level: "light", min: 0, max: 25, label: "Light" },
  { level: "moderate", min: 26, max: 50, label: "Moderate" },
  { level: "heavy", min: 51, max: 75, label: "Heavy" },
  { level: "overloaded", min: 76, max: 100, label: "Overloaded" },
];

export function levelForScore(value: number): CognitiveLoadLevel {
  const clamped = clampScore(value);
  for (const band of LEVEL_BANDS) {
    if (clamped >= band.min && clamped <= band.max) return band.level;
  }
  return clamped >= 76 ? "overloaded" : "light";
}

export function labelForLevel(level: CognitiveLoadLevel): string {
  return LEVEL_BANDS.find((b) => b.level === level)?.label ?? level;
}

export function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function domainTotals(
  contributors: LoadContributor[],
): Record<LoadDomain, number> {
  const totals: Record<LoadDomain, number> = {
    business: 0,
    mental: 0,
    emotional: 0,
    companion: 0,
    environmental: 0,
  };
  for (const c of contributors) {
    totals[c.domain] += c.points;
  }
  return totals;
}

/** Sum explainable contributors into a transparent 0–100 score. */
export function buildCognitiveLoadScore(
  contributors: LoadContributor[],
  now = new Date(),
): CognitiveLoadScore {
  const raw = contributors.reduce((sum, c) => sum + c.points, 0);
  const value = clampScore(raw);
  return {
    value,
    level: levelForScore(value),
    contributors: [...contributors].sort((a, b) => b.points - a.points),
    domainTotals: domainTotals(contributors),
    computedAt: now.toISOString(),
  };
}
