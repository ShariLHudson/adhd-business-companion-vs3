import type { MentalLoadSignal, SparkCarryAction } from "./types";

const SIGNAL_PATTERNS: Record<MentalLoadSignal, RegExp> = {
  overwhelm:
    /\b(?:overwhelm(?:ed)?|too much|everything (?:feels|is) (?:too much|heavy|hard)|can'?t handle|drowning|swamped)\b/i,
  shame:
    /\b(?:ashamed|embarrassed|should have|shouldn'?t have|failing|failure|not good enough|behind|so far behind|disappoint(?:ed|ing))\b/i,
  perfectionism:
    /\b(?:perfect(?:ionist)?|rewrite(?:ing)? everything|never good enough|not ready to share|can'?t ship)\b/i,
  decision_fatigue:
    /\b(?:decision fatigue|too many (?:choices|decisions)|can'?t decide|decision overload|analysis paralysis)\b/i,
  self_doubt:
    /\b(?:self[- ]doubt|don'?t think i can|not sure i can|impostor|imposter|who am i to|not qualified)\b/i,
  fear:
    /\b(?:afraid|scared|terrified|anxious|what if i fail|fear of fail)\b/i,
  scattered:
    /\b(?:scattered|all over the place|thoughts everywhere|can'?t keep track|too many tabs|jumbled)\b/i,
  exhaustion:
    /\b(?:exhausted|burned out|burnt out|no energy|running on empty|mentally drained|depleted)\b/i,
};

export function detectMentalLoadSignals(text: string): MentalLoadSignal[] {
  const t = text.trim();
  if (!t) return [];
  const found: MentalLoadSignal[] = [];
  for (const [signal, pattern] of Object.entries(SIGNAL_PATTERNS) as [
    MentalLoadSignal,
    RegExp,
  ][]) {
    if (pattern.test(t)) found.push(signal);
  }
  return found;
}

export function isHighMentalLoadTurn(text: string, overwhelmed?: boolean): boolean {
  if (overwhelmed) return true;
  return detectMentalLoadSignals(text).length > 0;
}

/** What Spark may quietly carry — never all at once. */
export const SPARK_CARRY_ACTIONS: readonly {
  id: SparkCarryAction;
  label: string;
}[] = [
  { id: "organize_thoughts", label: "organizing scattered thoughts" },
  { id: "remember_details", label: "remembering details" },
  { id: "reduce_decisions", label: "reducing decisions" },
  { id: "identify_next_step", label: "identifying the next step" },
  { id: "research", label: "researching information" },
  { id: "first_draft", label: "creating a first draft" },
  { id: "compare_options", label: "comparing options" },
  { id: "track_progress", label: "keeping track of progress" },
] as const;

export const SHAME_REINFORCEMENT_PATTERNS: readonly RegExp[] = [
  /\byou'?re (?:falling )?behind\b/i,
  /\byou should have\b/i,
  /\bwhy haven'?t you\b/i,
  /\bno excuses\b/i,
  /\bstop making excuses\b/i,
  /\byou need to get (?:it )?together\b/i,
  /\bthat'?s (?:a )?(?:poor|bad) (?:excuse|habit)\b/i,
  /\byou failed\b/i,
];

export function detectShameReinforcement(text: string): string[] {
  const hits: string[] = [];
  for (const pattern of SHAME_REINFORCEMENT_PATTERNS) {
    if (pattern.test(text)) hits.push(pattern.source);
  }
  return hits;
}
