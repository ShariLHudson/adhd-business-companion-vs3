/**
 * Detect recovery signals from conversation and intelligence integrations.
 */

import { getProjects, getDayState } from "@/lib/companionStore";
import { getActivationStore } from "@/lib/activation/activationStore";
import { getCognitiveLoadStore } from "@/lib/cognitive-load/loadStore";
import { getUserHealthStore } from "@/lib/user-health/userHealthStore";
import type { RecoveryInput, RecoverySignal } from "./types";

const MS_DAY = 86_400_000;

const TEXT_SIGNALS: {
  id: string;
  label: string;
  category: RecoverySignal["category"];
  re: RegExp;
  weight: number;
}[] = [
  {
    id: "fatigue",
    label: "Fatigue language",
    category: "physical",
    re: /\b(tired|fatigue|fatigued|wiped out|no energy)\b/i,
    weight: 3,
  },
  {
    id: "exhaustion",
    label: "Exhaustion language",
    category: "physical",
    re: /\b(exhausted|burned out|burnt out|running on empty|depleted)\b/i,
    weight: 4,
  },
  {
    id: "poor_sleep",
    label: "Poor sleep mention",
    category: "physical",
    re: /\b(didn't sleep|can't sleep|insomnia|slept badly|no sleep)\b/i,
    weight: 4,
  },
  {
    id: "pain",
    label: "Pain-related discussion",
    category: "physical",
    re: /\b(headache|migraine|body hurts|in pain|achy)\b/i,
    weight: 2,
  },
  {
    id: "mental_exhaustion",
    label: "Mental exhaustion",
    category: "mental",
    re: /\b(brain fog|mentally exhausted|can't think|fried)\b/i,
    weight: 4,
  },
  {
    id: "decision_fatigue",
    label: "Decision fatigue",
    category: "mental",
    re: /\b(decision fatigue|can't decide|too many decisions)\b/i,
    weight: 3,
  },
  {
    id: "overwhelm",
    label: "Repeated overwhelm",
    category: "mental",
    re: /\b(overwhelm|too much|can't cope|drowning)\b/i,
    weight: 3,
  },
  {
    id: "uncertainty",
    label: "Increasing uncertainty",
    category: "mental",
    re: /\b(don't know anymore|everything feels uncertain|lost)\b/i,
    weight: 2,
  },
  {
    id: "frustration",
    label: "Frustration",
    category: "emotional",
    re: /\b(frustrated|annoyed|fed up)\b/i,
    weight: 2,
  },
  {
    id: "discouragement",
    label: "Discouragement",
    category: "emotional",
    re: /\b(discouraged|defeated|what's the point)\b/i,
    weight: 3,
  },
  {
    id: "hopelessness",
    label: "Hopelessness language",
    category: "emotional",
    re: /\b(hopeless|giving up|can't go on)\b/i,
    weight: 5,
  },
  {
    id: "emotional_overload",
    label: "Emotional overload",
    category: "emotional",
    re: /\b(emotional overload|too emotional|breaking down)\b/i,
    weight: 4,
  },
  {
    id: "freezing",
    label: "Repeated freezing",
    category: "behavioral",
    re: /\b(frozen|can't start|stuck again|paralyzed)\b/i,
    weight: 3,
  },
  {
    id: "avoidance",
    label: "Avoidance pattern",
    category: "behavioral",
    re: /\b(avoiding|putting off|can't face)\b/i,
    weight: 3,
  },
  {
    id: "shrinking_capacity",
    label: "Shrinking capacity",
    category: "behavioral",
    re: /\b(can't handle|less capacity|doing less than before)\b/i,
    weight: 3,
  },
];

export function detectRecoverySignalsFromText(text: string): RecoverySignal[] {
  const hits: RecoverySignal[] = [];
  for (const p of TEXT_SIGNALS) {
    if (p.re.test(text)) {
      hits.push({
        id: p.id,
        label: p.label,
        category: p.category,
        weight: p.weight,
      });
    }
  }
  return hits;
}

export function gatherRecoveryInput(
  partial: RecoveryInput = {},
): RecoveryInput {
  const now = partial.now ?? new Date();
  const day = getDayState();
  const since7d = now.getTime() - 7 * MS_DAY;
  const cogStore = getCognitiveLoadStore();
  const recentCog = cogStore.founderSamples.filter(
    (s) => new Date(s.at).getTime() >= since7d,
  );
  const priorLevel =
    recentCog.length >= 2
      ? (recentCog[recentCog.length - 2]?.level as RecoveryInput["cognitiveLoadLevel"])
      : null;

  const stalled =
    partial.stalledProjectCount ??
    getProjects().filter(
      (p) => p.status === "paused" || p.status === "not-started",
    ).length;

  return {
    ...partial,
    now,
    priorCognitiveLoadLevel:
      partial.priorCognitiveLoadLevel ?? priorLevel,
    dayEnergyLow: partial.dayEnergyLow ?? day?.energy === "low",
    dayOverwhelmHigh: partial.dayOverwhelmHigh ?? day?.overwhelm === "high",
    stalledProjectCount: stalled,
  };
}

function integrationSignals(input: RecoveryInput): RecoverySignal[] {
  const now = input.now ?? new Date();
  const since7d = now.getTime() - 7 * MS_DAY;
  const extra: RecoverySignal[] = [];

  if (input.dayEnergyLow) {
    extra.push({
      id: "low_energy_day",
      label: "Low energy check-in",
      category: "physical",
      weight: 3,
    });
  }
  if (input.dayOverwhelmHigh) {
    extra.push({
      id: "high_overwhelm_day",
      label: "High overwhelm day",
      category: "mental",
      weight: 3,
    });
  }

  const activationFrozen = getActivationStore().founderSamples.filter(
    (s) =>
      new Date(s.at).getTime() >= since7d &&
      (s.state === "frozen" || s.state === "stuck"),
  ).length;
  if (activationFrozen >= 2) {
    extra.push({
      id: "repeated_freezing",
      label: "Repeated freezing",
      category: "behavioral",
      weight: 4,
    });
  }

  const healthStrained = getUserHealthStore().founderSamples.filter(
    (s) =>
      new Date(s.at).getTime() >= since7d &&
      ["overloaded", "needs_support", "disengaging"].includes(s.status),
  ).length;
  if (healthStrained >= 2) {
    extra.push({
      id: "health_strain",
      label: "Sustained health strain",
      category: "emotional",
      weight: 3,
    });
  }

  if ((input.stalledProjectCount ?? 0) >= 2) {
    extra.push({
      id: "stalled_projects",
      label: "Stalled projects increasing",
      category: "behavioral",
      weight: 2,
    });
  }

  return extra;
}

export function collectRecoverySignals(input: RecoveryInput): RecoverySignal[] {
  const gathered = gatherRecoveryInput(input);
  const fromText = gathered.text
    ? detectRecoverySignalsFromText(gathered.text)
    : [];
  const merged = [...fromText, ...integrationSignals(gathered)];
  const byId = new Map<string, RecoverySignal>();
  for (const s of merged) {
    const existing = byId.get(s.id);
    if (!existing || s.weight > existing.weight) byId.set(s.id, s);
  }
  return [...byId.values()];
}

export function signalWeightTotal(signals: RecoverySignal[]): number {
  return signals.reduce((n, s) => n + s.weight, 0);
}
