/**
 * ADHD Entrepreneur Behavioral Framework™ — Sales Conversations layer.
 * Translates expert sales knowledge into ADHD-executable actions.
 */

import type { ChatTurn } from "./companionIntelligence";
import type { ActualNeed, IntuitiveSignal } from "./companionIntuitiveAwareness";

export type SalesJourneyStage =
  | "discovery_preparation"
  | "discovery_execution"
  | "objection_handling"
  | "call_to_action"
  | "follow_up"
  | "confidence_recovery";

export type SalesAdhdPattern =
  | "fear_of_rejection"
  | "people_pleasing"
  | "pricing_discomfort"
  | "overexplaining"
  | "sales_avoidance"
  | "follow_up_resistance"
  | "visibility_fear"
  | "confidence_crash"
  | "pre_call_perfectionism"
  | "post_call_analysis_paralysis";

export type SalesIntelligenceAnalysis = {
  inSalesContext: boolean;
  stage: SalesJourneyStage | null;
  patterns: SalesAdhdPattern[];
  primaryPattern: SalesAdhdPattern | null;
  actualNeed: ActualNeed | null;
  signals: IntuitiveSignal[];
  companionMove: string;
  adhdTranslation: string;
};

export const SALES_SCORECARD_THRESHOLDS = {
  understanding: 80,
  trust: 80,
  confidence: 80,
  momentum: 75,
  action: 85,
  routing: 75,
  overanalysis: 85,
  adhdAlignment: 85,
} as const;

const SALES_CONTEXT_RE =
  /\b(?:sales calls?|discovery calls?|cold calls?|follow[- ]?up|prospect|objection|quoted|pricing|too expensive|think about it|spouse|husband|wife|partner|mess(?:ed)? up the calls?|the call went)\b/i;

const PATTERN_RULES: { pattern: SalesAdhdPattern; re: RegExp }[] = [
  {
    pattern: "sales_avoidance",
    re: /\b(?:keep putting (?:it )?off|putting off (?:the )?call|avoiding (?:sales|the call)|never followed up|didn'?t follow up)\b/i,
  },
  {
    pattern: "fear_of_rejection",
    re: /\b(?:scared to (?:call|reach)|afraid (?:they|to)|fear of rejection|nervous about (?:the )?call)\b/i,
  },
  {
    pattern: "people_pleasing",
    re: /\b(?:don'?t want to (?:seem )?pushy|bothering them|being pushy|annoying if i)\b/i,
  },
  {
    pattern: "pricing_discomfort",
    re: /\b(?:froze|frozen|asked my price|quoted less|undercharg)\b/i,
  },
  {
    pattern: "overexplaining",
    re: /\b(?:talk(?:ing)? the whole time|end up talking|information dump|teach(?:ing)? instead of listen)\b/i,
  },
  {
    pattern: "follow_up_resistance",
    re: /\b(?:never followed up|didn'?t follow up|seemed interested but)\b/i,
  },
  {
    pattern: "visibility_fear",
    re: /\b(?:scared to reach out|afraid they(?:'ll| will) think|hate selling)\b/i,
  },
  {
    pattern: "confidence_crash",
    re: /\b(?:messed up the call|botched the call|feel bad|i messed up)\b/i,
  },
  {
    pattern: "pre_call_perfectionism",
    re: /\b(?:giant script|perfect script|overprepare|another script|more prep before the call)\b/i,
  },
  {
    pattern: "post_call_analysis_paralysis",
    re: /\b(?:replay(?:ing)? the call|overanalyze what i said|what i should have said)\b/i,
  },
];

function userLines(messages: ChatTurn[]): string[] {
  return messages.filter((m) => m.role === "user").map((m) => m.content);
}

function inferSalesStage(text: string, messages: ChatTurn[]): SalesJourneyStage | null {
  const haystack = [...userLines(messages), text].join(" ");
  if (/\b(?:discovery calls? tomorrow|call tomorrow|prepare for (?:the )?call)\b/i.test(haystack)) {
    return "discovery_preparation";
  }
  if (/\b(?:talk(?:ing)? the whole time|end up talking)\b/i.test(haystack)) {
    return "discovery_execution";
  }
  if (/\b(?:too expensive|think about it|talk to (?:my |their )?spouse|husband|wife)\b/i.test(haystack)) {
    return "objection_handling";
  }
  if (/\b(?:call went great|went well|no next step)\b/i.test(haystack)) {
    return "call_to_action";
  }
  if (/\b(?:never followed up|didn'?t follow up|follow[- ]?up)\b/i.test(haystack)) {
    return "follow_up";
  }
  if (/\b(?:messed up the call|quoted less|froze)\b/i.test(haystack)) {
    return "confidence_recovery";
  }
  if (/\b(?:make the call|putting off (?:the )?call)\b/i.test(haystack)) {
    return "discovery_preparation";
  }
  return null;
}

function inferSalesActualNeed(
  text: string,
  patterns: SalesAdhdPattern[],
  stage: SalesJourneyStage | null,
): ActualNeed | null {
  if (/\b(?:talk to (?:my |their )?spouse|husband|wife|partner)\b/i.test(text)) {
    return "clarify_direction";
  }
  if (patterns.includes("pricing_discomfort") || /\b(?:froze|quoted less)\b/i.test(text)) {
    return "build_confidence";
  }
  if (patterns.includes("confidence_crash")) return "build_confidence";
  if (patterns.includes("overexplaining") || stage === "discovery_execution") {
    return "clarify_direction";
  }
  if (
    patterns.includes("sales_avoidance") ||
    patterns.includes("follow_up_resistance") ||
    patterns.includes("fear_of_rejection") ||
    patterns.includes("visibility_fear") ||
    patterns.includes("people_pleasing")
  ) {
    return "start_execution";
  }
  if (stage === "discovery_preparation" || /\b(?:discovery call tomorrow)\b/i.test(text)) {
    return "clarify_direction";
  }
  if (stage === "objection_handling" || /\b(?:too expensive|think about it)\b/i.test(text)) {
    return "make_decision";
  }
  if (stage === "call_to_action" || /\b(?:call went great|went well)\b/i.test(text)) {
    return "make_decision";
  }
  return null;
}

function salesSignals(patterns: SalesAdhdPattern[]): IntuitiveSignal[] {
  const signals = new Set<IntuitiveSignal>();
  if (
    patterns.some((p) =>
      ["sales_avoidance", "follow_up_resistance", "pre_call_perfectionism"].includes(p),
    )
  ) {
    signals.add("avoidance");
  }
  if (
    patterns.some((p) =>
      ["fear_of_rejection", "visibility_fear", "people_pleasing"].includes(p),
    )
  ) {
    signals.add("resistance");
  }
  if (patterns.includes("confidence_crash")) signals.add("discouragement");
  if (patterns.includes("post_call_analysis_paralysis")) signals.add("hesitation");
  return [...signals];
}

function companionMoveForSales(
  stage: SalesJourneyStage | null,
  actualNeed: ActualNeed | null,
  primaryPattern: SalesAdhdPattern | null,
): string {
  if (primaryPattern === "sales_avoidance" || primaryPattern === "follow_up_resistance") {
    return "One simple follow-up or call action — not a full sales system.";
  }
  if (primaryPattern === "pricing_discomfort") {
    return "Normalize discomfort. Rehearse one value-based price response — no complex pricing models.";
  }
  if (primaryPattern === "overexplaining") {
    return "Shift from teaching to listening. One curiosity question beats a long explanation.";
  }
  if (primaryPattern === "confidence_crash") {
    return "Review what went well first. One improvement for next time — no shame spiral.";
  }
  if (stage === "objection_handling") {
    return "One practical next response. Budget issue, value gap, or wrong fit — pick one path.";
  }
  if (stage === "call_to_action") {
    return "Help name one commitment: next meeting, proposal, or decision timeline.";
  }
  if (stage === "discovery_preparation") {
    return "Light prep only: desired outcome, 2–3 discovery questions, listening goal, next-step goal.";
  }
  if (actualNeed === "build_confidence") {
    return "Evidence-based confidence — what went well, one next improvement. No cheerleading.";
  }
  return "One ADHD-sized sales action that moves the conversation forward.";
}

export function analyzeSalesIntelligence(input: {
  userText: string;
  messages: ChatTurn[];
}): SalesIntelligenceAnalysis | null {
  const text = input.userText.trim();
  const haystack = [...userLines(input.messages), text].join(" ");
  if (!SALES_CONTEXT_RE.test(haystack) && !/\b(?:make the call|putting off)\b/i.test(text)) {
    return null;
  }

  const patterns = PATTERN_RULES.filter(({ re }) => re.test(haystack)).map((r) => r.pattern);
  const stage = inferSalesStage(text, input.messages);
  const actualNeed = inferSalesActualNeed(text, patterns, stage);
  const primaryPattern = patterns[0] ?? null;
  const signals = salesSignals(patterns);

  return {
    inSalesContext: true,
    stage,
    patterns,
    primaryPattern,
    actualNeed,
    signals,
    companionMove: companionMoveForSales(stage, actualNeed, primaryPattern),
    adhdTranslation:
      "Expert sales advice must be ADHD-filtered: one simple next response beats a seven-step framework.",
  };
}

export function mergeSalesIntoIntuitive(input: {
  sales: SalesIntelligenceAnalysis;
  existingSignals: IntuitiveSignal[];
  existingActualNeed: ActualNeed | null;
}): {
  signals: IntuitiveSignal[];
  actualNeed: ActualNeed | null;
  companionMove: string;
} {
  const signals = new Set([...input.existingSignals, ...input.sales.signals]);
  return {
    signals: [...signals],
    actualNeed: input.sales.actualNeed ?? input.existingActualNeed,
    companionMove: input.sales.companionMove,
  };
}

export const SALES_INTERVENTION_CATALOG: Record<SalesAdhdPattern, string> = {
  fear_of_rejection: "Reduce activation energy — one low-pressure outreach or call attempt.",
  people_pleasing: "Draft one helpful (not pushy) message they would actually send.",
  pricing_discomfort: "Rehearse one value-based price line — good enough to say out loud.",
  overexplaining: "Pick one listening question to ask before explaining anything.",
  sales_avoidance: "Name the scary part. Schedule or make the smallest call action now.",
  follow_up_resistance: "Send one simple follow-up — interested, not annoying.",
  visibility_fear: "One visibility action with low exposure (DM, email, not a stage).",
  confidence_crash: "What went well + one fix — no replay loop.",
  pre_call_perfectionism: "Three prep bullets max — outcome, questions, next-step goal.",
  post_call_analysis_paralysis: "Stop replaying. One lesson, one next action.",
};
