import { detectMemberEmotionalSignals } from "@/lib/conversation/emotionalFirstResponseSequence";
import { SPARK_EVIDENCE_CATEGORIES } from "./principles";
import type {
  SelfClaritySignal,
  SparkSelfClarityDecision,
} from "./types";

const IDENTITY_STATEMENT_RE =
  /\b(?:i'?m lazy|i always quit|i never finish|i always fail|i'?m terrible at|i'?m not (?:a|the kind of)|that'?s just who i am|i always mess up|i'?ll never change|i'?m hopeless|i'?m a failure)\b/i;

const HARSH_JUDGMENT_RE =
  /\b(?:hate myself|so stupid|idiot|worthless|pathetic|disgusting|can'?t do anything right|always disappoint)\b/i;

const DISCOURAGED_HISTORIAN_RE =
  /\b(?:only remember (?:fail|mistake|what went wrong)|forget (?:how far|my progress|everything good)|all i see is|every time i try|nothing ever works|always the same result)\b/i;

const STORY_REWRITE_RE =
  /\b(?:i always quit|i never finish|story about myself|defined by my failures|that'?s who i am)\b/i;

const NEVER_CHANGE_RE =
  /\b(?:never change|always been this way|won'?t ever|can'?t change who i am)\b/i;

export function evaluateSparkSelfClarity(input: {
  userText: string;
  overwhelmed?: boolean;
}): SparkSelfClarityDecision {
  const text = input.userText.trim();
  const signals = new Set<SelfClaritySignal>();
  const evidence = new Set<string>();

  if (!text) {
    return {
      signals: [],
      activeEvidenceCategories: [],
      useCuriosityFirst: false,
      reason: "empty",
    };
  }

  const emotional = detectMemberEmotionalSignals(text);

  if (IDENTITY_STATEMENT_RE.test(text)) {
    signals.add("identity_statement");
    signals.add("story_rewrite_moment");
  }

  if (HARSH_JUDGMENT_RE.test(text)) {
    signals.add("harsh_self_judgment");
    signals.add("discouraged_historian");
  }

  if (DISCOURAGED_HISTORIAN_RE.test(text)) {
    signals.add("discouraged_historian");
    signals.add("story_rewrite_moment");
  }

  if (STORY_REWRITE_RE.test(text)) {
    signals.add("story_rewrite_moment");
  }

  if (
    NEVER_CHANGE_RE.test(text) ||
    emotional.includes("discouragement") ||
    emotional.includes("shame")
  ) {
    signals.add("pattern_reflection_due");
  }

  if (input.overwhelmed || emotional.includes("exhaustion")) {
    signals.add("pattern_reflection_due");
    evidence.add("resting when needed");
  }

  if (/\b(?:tried again|kept going|came back|asked for help|set a boundary)\b/i.test(text)) {
    evidence.add("trying again");
    evidence.add("persistence");
  }

  if (/\b(?:learned|figured out|understand (?:myself|how i)|noticed)\b/i.test(text)) {
    evidence.add("learning");
    evidence.add("growth");
  }

  if (signals.has("identity_statement") || signals.has("harsh_self_judgment")) {
    evidence.add("persistence");
    evidence.add("courage");
    evidence.add("recovery");
  }

  if (evidence.size === 0 && signals.size > 0) {
    for (const cat of SPARK_EVIDENCE_CATEGORIES.slice(0, 5)) {
      evidence.add(cat);
    }
  }

  const useCuriosityFirst =
    signals.has("identity_statement") ||
    signals.has("harsh_self_judgment") ||
    signals.has("discouraged_historian");

  return {
    signals: [...signals],
    activeEvidenceCategories: [...evidence],
    useCuriosityFirst,
    reason: signals.size > 0 ? [...signals].join(", ") : "general clarity",
  };
}

export function detectIdentityStatement(text: string): boolean {
  return IDENTITY_STATEMENT_RE.test(text.trim());
}
