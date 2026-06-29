/**
 * Executive function state detection — overwhelm, avoidance, paralysis, etc.
 */

import type { ExecutiveFunctionSignal, ExecutiveFunctionState } from "./types";

type SignalMatch = { signal: ExecutiveFunctionSignal; weight: number };

const PATTERNS: Array<{ signal: ExecutiveFunctionSignal; regex: RegExp; weight: number }> = [
  {
    signal: "overwhelm",
    regex: /\b(overwhelm(?:ed|ing)?|too much|can't cope|drowning|everything at once)\b/i,
    weight: 5,
  },
  {
    signal: "avoidance",
    regex: /\b(avoid(?:ing)?|putting off|procrastinat|haven't started|keep delaying)\b/i,
    weight: 4,
  },
  {
    signal: "uncertainty",
    regex: /\b(not sure|don't know (?:where|how)|unclear|confused about)\b/i,
    weight: 3,
  },
  {
    signal: "task_paralysis",
    regex: /\b(stuck|can't start|frozen|paralyz|don't know where to start)\b/i,
    weight: 5,
  },
  {
    signal: "decision_fatigue",
    regex: /\b(too many (?:choices|options)|decision fatigue|can't decide|which one should)\b/i,
    weight: 4,
  },
  {
    signal: "low_energy",
    regex: /\b(tired|exhausted|low energy|depleted|no bandwidth|burned out)\b/i,
    weight: 4,
  },
  {
    signal: "interruption_recovery",
    regex: /\b(where was i|lost my place|got interrupted|pick back up)\b/i,
    weight: 3,
  },
  {
    signal: "ready_to_start",
    regex: /\b(ready to (?:start|begin)|let's go|help me start)\b/i,
    weight: 2,
  },
];

const LARGE_PROJECT_RE =
  /\b(launch|rebrand|whole business|entire|full plan|big project|from scratch)\b/i;

export function detectExecutiveFunctionState(
  message: string,
  options?: {
    emotionalState?: string;
    daysSinceLastActivity?: number | null;
  },
): ExecutiveFunctionState {
  const matches: SignalMatch[] = [];
  const lower = message.toLowerCase();

  for (const { signal, regex, weight } of PATTERNS) {
    if (regex.test(message)) matches.push({ signal, weight });
  }

  if (options?.emotionalState === "overwhelmed") {
    matches.push({ signal: "overwhelm", weight: 5 });
  }
  if (
    options?.daysSinceLastActivity != null &&
    options.daysSinceLastActivity >= 2
  ) {
    matches.push({ signal: "returning_after_absence", weight: 4 });
  }
  if (LARGE_PROJECT_RE.test(lower) && !matches.some((m) => m.signal === "overwhelm")) {
    matches.push({ signal: "uncertainty", weight: 2 });
  }

  if (matches.length === 0) {
    return {
      primary: "calm",
      secondary: [],
      capacity: "available",
      needsSimplification: false,
      needsEmpathyFirst: false,
      singleRecommendationOnly: false,
    };
  }

  matches.sort((a, b) => b.weight - a.weight);
  const primary = matches[0].signal;
  const secondary = [...new Set(matches.slice(1).map((m) => m.signal))];

  const heavySignals: ExecutiveFunctionSignal[] = [
    "overwhelm",
    "task_paralysis",
    "decision_fatigue",
    "low_energy",
    "avoidance",
  ];
  const needsSimplification = heavySignals.includes(primary) || secondary.some((s) => heavySignals.includes(s));
  const needsEmpathyFirst =
    primary === "overwhelm" ||
    primary === "low_energy" ||
    primary === "returning_after_absence";
  const singleRecommendationOnly =
    needsSimplification || primary === "decision_fatigue";

  let capacity: ExecutiveFunctionState["capacity"] = "available";
  if (primary === "overwhelm" || primary === "low_energy") capacity = "depleted";
  else if (needsSimplification) capacity = "limited";

  return {
    primary,
    secondary,
    capacity,
    needsSimplification,
    needsEmpathyFirst,
    singleRecommendationOnly,
  };
}

export function isLargeProjectRequest(message: string): boolean {
  return LARGE_PROJECT_RE.test(message.toLowerCase());
}

export function isStuckRequest(message: string): boolean {
  return /\b(stuck|can't start|don't know where|help me (?:begin|start))\b/i.test(message);
}

export function isOverwhelmMessage(message: string): boolean {
  return /\b(overwhelm(?:ed|ing)?|too much)\b/i.test(message.toLowerCase());
}
