import { detectMemberEmotionalSignals } from "@/lib/conversation/emotionalFirstResponseSequence";
import type {
  ConstitutionPrincipleId,
  SelfTrustLossId,
  SelfTrustSuccessMeasure,
  SparkEstateConstitutionDecision,
} from "./types";

const WHATS_WRONG_WITH_ME_RE =
  /\b(?:what(?:'s| is) wrong with me|why am i like this|i'?m broken|i'?m the problem|my fault|character flaw)\b/i;

const SELF_CRITICISM_RE =
  /\b(?:hate myself|so stupid|idiot|failure|not good enough|can'?t do anything right|always mess up|disappoint(?:ed|ing))\b/i;

const TRUST_MEMORY_RE =
  /\b(?:forget everything|can'?t remember|don'?t trust my memory|lose track|brain won'?t hold)\b/i;

const TRUST_DECISIONS_RE =
  /\b(?:can'?t decide|don'?t trust (?:myself|my judgment|my decisions)|bad at decisions|second[- ]guess)\b/i;

const TRUST_MOTIVATION_RE =
  /\b(?:no motivation|can'?t get motivated|don'?t trust myself to start|lazy|procrastinat)\b/i;

const TRUST_FINISHING_RE =
  /\b(?:never finish|don'?t finish|can'?t follow through|start but never|unfinished|abandon projects)\b/i;

const TRUST_BECOMING_RE =
  /\b(?:who i hoped to be|person i wanted to be|never become|not the person|give up on myself)\b/i;

const MIND_PATTERN_RE =
  /\b(?:how (?:my|does my) (?:brain|mind)|adhd|executive function|why do i always|pattern|the way i think|focus|distract)\b/i;

const AWARENESS_WIN_RE =
  /\b(?:realized|noticed (?:a )?pattern|set a boundary|asked for help|chose rest|finally understand why|aware that)\b/i;

const IDENTITY_STORY_RE =
  /\b(?:i'?m not (?:a|the kind of)|i always|i never|that'?s just who i am|defined by|story about myself)\b/i;

const PRESCRIPTION_ASK_RE =
  /\b(?:tell me what to do|just tell me|what should i|you should|give me the answer)\b/i;

export function evaluateSparkEstateConstitution(input: {
  userText: string;
  overwhelmed?: boolean;
}): SparkEstateConstitutionDecision {
  const text = input.userText.trim();
  const principles = new Set<ConstitutionPrincipleId>([
    "build_self_trust",
    "possibilities_not_prescriptions",
  ]);
  const trustLoss = new Set<SelfTrustLossId>();
  const measures = new Set<SelfTrustSuccessMeasure>();

  if (!text) {
    return {
      activePrinciples: ["build_self_trust", "normalize_human"],
      trustLossSignals: [],
      targetMeasures: ["more_self_understanding", "more_hope"],
      reason: "empty — welcome and belong",
    };
  }

  const emotional = detectMemberEmotionalSignals(text);

  if (
    WHATS_WRONG_WITH_ME_RE.test(text) ||
    SELF_CRITICISM_RE.test(text) ||
    emotional.includes("shame")
  ) {
    principles.add("curiosity_over_criticism");
    principles.add("normalize_human");
    measures.add("less_shame");
    measures.add("more_self_understanding");
  }

  if (MIND_PATTERN_RE.test(text)) {
    principles.add("understand_own_mind");
    measures.add("more_self_understanding");
    measures.add("more_clarity");
  }

  if (IDENTITY_STORY_RE.test(text) || emotional.includes("discouragement")) {
    principles.add("rewrite_identity");
    measures.add("more_self_trust");
    measures.add("more_hope");
  }

  if (AWARENESS_WIN_RE.test(text)) {
    principles.add("celebrate_awareness");
    measures.add("more_self_trust");
    measures.add("more_confidence_next_step");
  }

  if (PRESCRIPTION_ASK_RE.test(text)) {
    principles.add("possibilities_not_prescriptions");
    measures.add("more_clarity");
  }

  if (TRUST_MEMORY_RE.test(text)) trustLoss.add("memory");
  if (TRUST_DECISIONS_RE.test(text)) trustLoss.add("decisions");
  if (TRUST_MOTIVATION_RE.test(text)) trustLoss.add("motivation");
  if (TRUST_FINISHING_RE.test(text)) trustLoss.add("finishing");
  if (TRUST_BECOMING_RE.test(text)) trustLoss.add("becoming");

  if (trustLoss.size > 0) {
    principles.add("build_self_trust");
    principles.add("rewrite_identity");
    measures.add("more_self_trust");
  }

  if (
    input.overwhelmed ||
    emotional.includes("overwhelm") ||
    emotional.includes("grief") ||
    emotional.includes("exhaustion")
  ) {
    principles.add("normalize_human");
    principles.add("curiosity_over_criticism");
    measures.add("less_fear");
    measures.add("more_clarity");
  }

  if (emotional.includes("grief") || /\b(?:alone|lonely|no one)\b/i.test(text)) {
    measures.add("less_loneliness");
  }

  if (measures.size === 0) {
    measures.add("more_self_understanding");
    measures.add("more_clarity");
  }

  return {
    activePrinciples: [...principles],
    trustLossSignals: [...trustLoss],
    targetMeasures: [...measures],
    reason: `principles: ${[...principles].join(", ")}`,
  };
}
