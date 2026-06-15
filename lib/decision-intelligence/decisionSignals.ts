/**
 * Detect decision fatigue signals from conversation and integrations.
 */

import type { DecisionBlocker, DecisionInput, DecisionType } from "./types";

export type DecisionSignalHit = {
  id: string;
  label: string;
  weight: number;
};

const SIGNAL_PATTERNS: { id: string; label: string; re: RegExp; weight: number }[] =
  [
    {
      id: "cant_decide",
      label: "Can't decide language",
      re: /\b(can't decide|cannot decide|can't choose|hard to decide)\b/i,
      weight: 4,
    },
    {
      id: "which_one",
      label: "Unsure which option",
      re: /\b(don't know which|which one|which should i|not sure which)\b/i,
      weight: 3,
    },
    {
      id: "should_i",
      label: "Should I… question",
      re: /\bshould i\b/i,
      weight: 2,
    },
    {
      id: "what_should",
      label: "What should I do",
      re: /\bwhat should i (do|choose|pick|focus on)\b/i,
      weight: 3,
    },
    {
      id: "researching",
      label: "Research loop language",
      re: /\b(keep researching|more research|still researching|one more article)\b/i,
      weight: 4,
    },
    {
      id: "too_many",
      label: "Too many options",
      re: /\b(too many options|so many choices|too many paths|paralyz)\b/i,
      weight: 4,
    },
    {
      id: "back_forth",
      label: "Going back and forth",
      re: /\b(back and forth|going back and forth|flip.?flop|keep changing my mind)\b/i,
      weight: 4,
    },
    {
      id: "wrong_choice",
      label: "Fear of wrong choice",
      re: /\b(choose wrong|pick the wrong|wrong thing|wrong choice|don't want to choose wrong)\b/i,
      weight: 4,
    },
    {
      id: "what_if_wrong",
      label: "What if wrong pick",
      re: /\bwhat if i (pick|choose) the wrong\b/i,
      weight: 4,
    },
    {
      id: "overthinking",
      label: "Overthinking",
      re: /\b(overthink|spinning|analysis paralysis|can't stop thinking)\b/i,
      weight: 3,
    },
    {
      id: "avoiding",
      label: "Avoiding the decision",
      re: /\b(avoiding|putting off|keep delaying|not ready to decide)\b/i,
      weight: 3,
    },
    {
      id: "decided",
      label: "Decision made",
      re: /\b(i've decided|i decided|going with|chose to|picked the)\b/i,
      weight: 5,
    },
  ];

const TYPE_PATTERNS: { type: DecisionType; re: RegExp }[] = [
  { type: "money_decision", re: /\b(price|cost|invest|buy|spend|budget|afford)\b/i },
  { type: "time_decision", re: /\b(schedule|calendar|when should|time block|today or tomorrow)\b/i },
  {
    type: "relationship_decision",
    re: /\b(client|customer|partner|hire|collaborat|referral|reach out to)\b/i,
  },
  { type: "content_decision", re: /\b(post|blog|video|content|newsletter|caption)\b/i },
  { type: "project_decision", re: /\b(project|launch|build|ship|feature)\b/i },
  { type: "business_decision", re: /\b(business|strategy|offer|niche|pivot|pricing)\b/i },
  { type: "priority_decision", re: /\b(priority|prioritize|focus on first|what matters most)\b/i },
  { type: "personal_decision", re: /\b(life|family|health|personal|boundary)\b/i },
];

export function detectDecisionSignals(text: string): DecisionSignalHit[] {
  const hits: DecisionSignalHit[] = [];
  for (const p of SIGNAL_PATTERNS) {
    if (p.re.test(text)) {
      hits.push({ id: p.id, label: p.label, weight: p.weight });
    }
  }
  return hits;
}

export function detectDecisionType(text: string): DecisionType {
  for (const { type, re } of TYPE_PATTERNS) {
    if (re.test(text)) return type;
  }
  return "custom";
}

export function extractDecisionOptions(text: string): string[] {
  const options: string[] = [];
  const orMatch = text.match(
    /\b(?:between|either)\s+(.+?)\s+or\s+(.+?)(?:[?.!,]|$)/i,
  );
  if (orMatch) {
    options.push(cleanOption(orMatch[1]!), cleanOption(orMatch[2]!));
  }
  const versus = text.match(/\b(.+?)\s+vs\.?\s+(.+?)(?:[?.!,]|$)/i);
  if (versus) {
    options.push(cleanOption(versus[1]!), cleanOption(versus[2]!));
  }
  return [...new Set(options.filter((o) => o.length > 2 && o.length < 80))].slice(
    0,
    3,
  );
}

function cleanOption(raw: string): string {
  return raw.replace(/^(the|a|an)\s+/i, "").trim();
}

export function inferBlockers(
  input: DecisionInput,
  hits: DecisionSignalHit[],
): DecisionBlocker[] {
  const blockers = new Set<DecisionBlocker>();
  const text = input.text ?? "";
  const ids = new Set(hits.map((h) => h.id));

  if (ids.has("too_many") || ids.has("which_one") || ids.has("cant_decide") || ids.has("back_forth")) {
    blockers.add("too_many_options");
  }
  if (ids.has("wrong_choice") || ids.has("what_if_wrong")) {
    blockers.add("fear_of_wrong_choice");
  }
  if (ids.has("researching") || input.loopType === "research_loop") {
    blockers.add("too_much_information");
  }
  if (/\b(need more info|don't know enough|not sure yet)\b/i.test(text)) {
    blockers.add("lack_of_information");
  }
  if (
    input.loopType === "perfectionism_loop" ||
    /\b(perfect|good enough|not ready)\b/i.test(text)
  ) {
    blockers.add("perfectionism");
  }
  if (input.dayEnergyLow || input.activationState === "frozen") {
    blockers.add("low_energy");
  }
  if (
    input.cognitiveLoadLevel === "heavy" ||
    input.cognitiveLoadLevel === "overloaded"
  ) {
    blockers.add("high_cognitive_load");
  }
  if (
    input.loopType === "rsd_loop" ||
    /\b(reject|judged|criticized|what will they think)\b/i.test(text)
  ) {
    blockers.add("rsd_or_rejection_fear");
  }
  if (/\b(urgent|asap|deadline|running out of time)\b/i.test(text)) {
    blockers.add("urgency_pressure");
  }
  if (/\b(not sure what i want|unclear goal|don't know the goal)\b/i.test(text)) {
    blockers.add("unclear_goal");
  }

  return [...blockers];
}

export function shouldEvaluateDecision(text: string): boolean {
  return detectDecisionSignals(text).some((h) => h.id !== "decided");
}

export function signalStrength(hits: DecisionSignalHit[]): number {
  return hits.filter((h) => h.id !== "decided").reduce((n, h) => n + h.weight, 0);
}
