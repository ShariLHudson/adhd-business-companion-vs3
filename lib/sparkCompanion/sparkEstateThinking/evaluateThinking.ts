import { detectMemberEmotionalSignals } from "@/lib/conversation/emotionalFirstResponseSequence";
import type { MemberStateSignal, SparkThinkingDecision } from "./types";

const NORMALIZE_SHAME_RE =
  /\b(?:haven'?t (?:looked|done|opened)|avoided for months|embarrassed|ashamed|should have|neglected|ignored (?:it|this) for)\b/i;

const PRODUCTIVITY_WRONG_PROBLEM_RE =
  /\b(?:more productive|productivity|get more done|stop procrastinating|need discipline)\b/i;

const EXHAUSTION_RE =
  /\b(?:exhausted|burned out|tired|no energy|can'?t focus|mentally tired|drained)\b/i;

const TASK_WITH_STATE_RE =
  /\b(?:help me (?:create|write|build|make)|marketing plan|business plan|sop|newsletter)\b/i;

const FRICTION_STUCK_RE =
  /\b(?:stuck|don'?t know (?:where|how) to start|too many (?:options|choices)|overwhelm|can'?t decide)\b/i;

const MULTI_QUESTION_CONTEXT_RE =
  /\b(?:help me (?:create|write|build|decide|plan)|figure out|not sure)\b/i;

export function evaluateSparkThinking(input: {
  userText: string;
  overwhelmed?: boolean;
  momentumActive?: boolean;
}): SparkThinkingDecision {
  const text = input.userText.trim();
  const states = new Set<MemberStateSignal>();

  if (!text) {
    return {
      stateSignals: ["uncertainty"],
      normalizeFirst: false,
      nameFriction: false,
      gentleWrongProblemChallenge: false,
      explainQuestions: false,
      deferCertainty: true,
      reason: "empty — warm orientation",
    };
  }

  const emotional = detectMemberEmotionalSignals(text);

  if (input.momentumActive || emotional.includes("excitement")) {
    states.add("momentum");
    states.add("excitement");
  }
  if (emotional.includes("uncertainty")) states.add("uncertainty");
  if (emotional.includes("confusion")) states.add("confusion");
  if (emotional.includes("discouragement")) states.add("discouragement");
  if (emotional.includes("overwhelm")) states.add("mental_overload");
  if (emotional.includes("exhaustion")) states.add("low_energy");
  if (emotional.includes("pride")) states.add("confidence");
  if (/\b(?:excited|can'?t wait|ready to)\b/i.test(text)) states.add("excitement");
  if (/\b(?:confident|know what i want|ready to go)\b/i.test(text)) states.add("confidence");
  if (/\b(?:curious|wonder|learn|explore)\b/i.test(text)) states.add("curiosity");
  if (/\b(?:frustrated|annoyed|fed up)\b/i.test(text)) states.add("frustration");
  if (/\b(?:urgent|asap|deadline|today)\b/i.test(text)) states.add("urgency");
  if (/\b(?:hopeful|optimistic|maybe this time)\b/i.test(text)) states.add("hopefulness");
  if (FRICTION_STUCK_RE.test(text)) {
    states.add("confusion");
    if (/\boverwhelm/i.test(text)) states.add("mental_overload");
  }

  if (input.overwhelmed) states.add("mental_overload");

  const normalizeFirst =
    NORMALIZE_SHAME_RE.test(text) ||
    emotional.includes("shame") ||
    emotional.includes("grief");

  const nameFriction =
    FRICTION_STUCK_RE.test(text) ||
    states.has("mental_overload") ||
    states.has("decision_fatigue") ||
    states.has("confusion");

  const gentleWrongProblemChallenge =
    PRODUCTIVITY_WRONG_PROBLEM_RE.test(text) &&
    (EXHAUSTION_RE.test(text) || input.overwhelmed || states.has("low_energy"));

  const explainQuestions =
    MULTI_QUESTION_CONTEXT_RE.test(text) &&
    !states.has("momentum") &&
    (states.has("uncertainty") || states.has("confusion") || nameFriction);

  const deferCertainty =
    states.has("uncertainty") ||
    states.has("confusion") ||
    normalizeFirst ||
    TASK_WITH_STATE_RE.test(text);

  if (states.size === 0 && TASK_WITH_STATE_RE.test(text)) {
    states.add("uncertainty");
  }

  return {
    stateSignals: [...states],
    normalizeFirst,
    nameFriction,
    gentleWrongProblemChallenge,
    explainQuestions,
    deferCertainty,
    reason: states.size > 0 ? [...states].join(", ") : "read person before task",
  };
}

export function formatStateReadForHint(signals: readonly MemberStateSignal[]): string {
  if (signals.length === 0) return "read state before responding — never assume";
  return `State signals: ${signals.join(" · ")} — same task, different experience if state differs`;
}
