/**
 * Activation signal detection from user text and app context.
 * Patterns only — never stores raw message text in snapshots.
 */

import type { UserSignalCount } from "@/lib/ecosystem/userIntelligenceEngine";
import type { ActivationBlockerType, ActivationInput } from "./types";

const MS_DAY = 86_400_000;

function countSignal(
  counts: UserSignalCount[] | undefined,
  kind: "struggle" | "question" | "emotion",
  category: string,
  sinceMs: number,
): number {
  if (!counts?.length) return 0;
  return counts
    .filter((c) => c.kind === kind && c.category === category)
    .reduce((sum, c) => {
      const seen = new Date(c.lastSeen).getTime();
      return seen >= sinceMs ? sum + c.count : sum;
    }, 0);
}

export type ActivationSignalHit = {
  blocker: ActivationBlockerType;
  signal: string;
  weight: number;
};

const BLOCKER_PATTERNS: {
  blocker: ActivationBlockerType;
  signal: string;
  re: RegExp;
  weight: number;
}[] = [
  {
    blocker: "overwhelm",
    signal: "too much language",
    re: /\b(too much|so much|so many|everything at once|can'?t keep up|drowning|mental clutter)\b/i,
    weight: 3,
  },
  {
    blocker: "overwhelm",
    signal: "overwhelmed",
    re: /\b(overwhelm|overwhelmed|feeling overwhelmed)\b/i,
    weight: 4,
  },
  {
    blocker: "overwhelm",
    signal: "don’t know where to start",
    re: /\b(don'?t know where to start|no idea where to start|where do i (even )?start)\b/i,
    weight: 4,
  },
  {
    blocker: "clarity",
    signal: "don’t know what to do",
    re: /\b(don'?t know what to do|not sure what to do|no idea what to do)\b/i,
    weight: 4,
  },
  {
    blocker: "clarity",
    signal: "what should I work on",
    re: /\b(what should i work on|what to work on|what do i work on)\b/i,
    weight: 3,
  },
  {
    blocker: "clarity",
    signal: "confused",
    re: /\b(confus|unclear|lost|foggy|don'?t understand)\b/i,
    weight: 3,
  },
  {
    blocker: "fear_rsd",
    signal: "what if negative",
    re: /\b(what if (they|he|she|it) don'?t|what if i mess|what if it'?s wrong)\b/i,
    weight: 4,
  },
  {
    blocker: "fear_rsd",
    signal: "afraid / criticism",
    re: /\b(i'?m afraid|scared|they'?re mad|they are mad|criticiz|judg(e|ing) me|rejection|rejected)\b/i,
    weight: 4,
  },
  {
    blocker: "fear_rsd",
    signal: "mess up fear",
    re: /\b(i'?ll mess (it )?up|mess this up|screw (it )?up|fail|failure|not good enough)\b/i,
    weight: 3,
  },
  {
    blocker: "perfectionism",
    signal: "not ready",
    re: /\b(not ready|not ready yet|needs to be better|has to be perfect)\b/i,
    weight: 4,
  },
  {
    blocker: "perfectionism",
    signal: "redoing",
    re: /\b(keep redoing|redoing it|revise again|one more pass|never good enough)\b/i,
    weight: 4,
  },
  {
    blocker: "perfectionism",
    signal: "editing loop",
    re: /\b(still editing|keep editing|tweak(ing)? forever|polish(ing)? forever)\b/i,
    weight: 3,
  },
  {
    blocker: "energy",
    signal: "tired / exhausted",
    re: /\b(tired|exhausted|no energy|low energy|drained|wiped out)\b/i,
    weight: 4,
  },
  {
    blocker: "energy",
    signal: "burnout",
    re: /\b(burned out|burnt out|burnout|running on empty)\b/i,
    weight: 4,
  },
  {
    blocker: "decision",
    signal: "too many options",
    re: /\b(too many options|so many options|can'?t choose|can'?t decide|decide between)\b/i,
    weight: 4,
  },
  {
    blocker: "decision",
    signal: "comparing / researching",
    re: /\b(keep comparing|still researching|analysis paralysis|going in circles)\b/i,
    weight: 3,
  },
  {
    blocker: "task_friction",
    signal: "stuck on task",
    re: /\b(stuck on|avoiding|keep putting off|procrastinat|can'?t start)\b/i,
    weight: 3,
  },
  {
    blocker: "task_friction",
    signal: "boring / repetitive",
    re: /\b(boring|repetitive|tedious|mind-?numbing|hate this task)\b/i,
    weight: 3,
  },
  {
    blocker: "task_friction",
    signal: "explicit stuck",
    re: /\b(i'?m stuck|feeling stuck|get unstuck|help me unstuck)\b/i,
    weight: 5,
  },
];

export const STUCK_TRIGGER_RE =
  /\b(stuck|frozen|paralyz|can'?t start|don'?t know what to do|don'?t know where to start|help me (get )?unstuck|smallest next step)\b/i;

export function detectActivationSignals(
  input: ActivationInput = {},
): ActivationSignalHit[] {
  const text = input.text?.trim() ?? "";
  const hits: ActivationSignalHit[] = [];

  for (const p of BLOCKER_PATTERNS) {
    if (text && p.re.test(text)) {
      hits.push({
        blocker: p.blocker,
        signal: p.signal,
        weight: p.weight,
      });
    }
  }

  if (
    input.emotionalState === "overwhelmed" ||
    input.cognitiveLoadLevel === "heavy" ||
    input.cognitiveLoadLevel === "overloaded"
  ) {
    hits.push({
      blocker: "overwhelm",
      signal: "high cognitive load",
      weight: input.cognitiveLoadLevel === "overloaded" ? 5 : 3,
    });
  }

  if (input.emotionalState === "stuck") {
    hits.push({
      blocker: "task_friction",
      signal: "stuck emotional state",
      weight: 3,
    });
  }

  if (input.emotionalState === "emotional") {
    hits.push({
      blocker: "fear_rsd",
      signal: "emotional distress tone",
      weight: 2,
    });
  }

  if (input.dayEnergyLow) {
    hits.push({
      blocker: "energy",
      signal: "low energy check-in",
      weight: 3,
    });
  }

  if ((input.projectsMissingNextAction ?? 0) > 0) {
    hits.push({
      blocker: "clarity",
      signal: "missing next action on project",
      weight: 2,
    });
  }

  if ((input.openBrainDumpCount ?? 0) >= 4) {
    hits.push({
      blocker: "overwhelm",
      signal: "many open captures",
      weight: 2,
    });
  }

  const since7d = (input.now ?? new Date()).getTime() - 7 * MS_DAY;
  const avoidanceSignals =
    countSignal(input.signalCounts, "struggle", "follow_through", since7d) +
    countSignal(input.signalCounts, "struggle", "focus", since7d);
  if (avoidanceSignals >= 2) {
    hits.push({
      blocker: "task_friction",
      signal: "repeated task avoidance",
      weight: 3,
    });
  }

  return hits;
}

export function shouldEvaluateActivation(text: string): boolean {
  return STUCK_TRIGGER_RE.test(text);
}
