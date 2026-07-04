import { detectMemberEmotionalSignals } from "@/lib/conversation/emotionalFirstResponseSequence";
import { detectIdentityStatement } from "@/lib/sparkCompanion/sparkEstateSelfClarity/evaluateSelfClarity";
import type {
  FriendMomentSignal,
  FriendNeedId,
  SparkEstateFriendDecision,
} from "./types";

const ACCEPTANCE_VENT_RE =
  /\b(?:just needed to (?:vent|tell|share)|needed someone to (?:hear|listen)|thank you for listening|didn'?t need advice|not looking for (?:advice|solutions)|trust(?:ed|ing) you with)\b/i;

const CELEBRATION_RE =
  /\b(?:celebrat|excited|proud|big win|breakthrough|launched|finally did it)\b/i;

const REST_PERMISSION_RE =
  /\b(?:need (?:to )?rest|exhausted|burned out|can'?t keep going|take a break|permission to stop)\b/i;

const BUILD_ASK_RE =
  /\b(?:help me (?:write|create|build|draft|make)|write (?:an|a)|create (?:an|a)|draft (?:an|a))\b/i;

const RESEARCH_ASK_RE =
  /\b(?:research|look up|find out|what (?:is|are)|tell me about|explain)\b/i;

const THINK_ASK_RE =
  /\b(?:help me think|talk (?:this|it) through|figure out|decide between|not sure (?:what|which|if))\b/i;

const ADVICE_ASK_RE =
  /\b(?:what should i|how do i|tell me what to|give me (?:advice|steps)|help me with)\b/i;

const EXPLAIN_ME_RE =
  /\b(?:you procrastinate because|you do this because|people like you|that'?s because you)\b/i;

export function evaluateSparkEstateFriend(input: {
  userText: string;
  overwhelmed?: boolean;
}): SparkEstateFriendDecision {
  const text = input.userText.trim();
  const needs = new Set<FriendNeedId>();
  const signals = new Set<FriendMomentSignal>();

  if (!text) {
    return {
      friendNeeds: ["calm_presence"],
      signals: [],
      deferAdvice: false,
      reason: "empty — warm welcome",
    };
  }

  const emotional = detectMemberEmotionalSignals(text);
  const identityStatement = detectIdentityStatement(text);

  if (identityStatement || /\b(?:i'?m lazy|inner critic|hate myself)\b/i.test(text)) {
    needs.add("gently_challenge_belief");
    signals.add("inner_critic_challenge");
  }

  if (EXPLAIN_ME_RE.test(text)) {
    signals.add("curiosity_together");
  }

  if (
    ACCEPTANCE_VENT_RE.test(text) ||
    (emotional.length > 0 &&
      !ADVICE_ASK_RE.test(text) &&
      !BUILD_ASK_RE.test(text) &&
      !THINK_ASK_RE.test(text))
  ) {
    needs.add("acceptance_only");
    signals.add("acceptance_before_advice");
  }

  if (CELEBRATION_RE.test(text)) {
    needs.add("celebrate_with");
  }

  if (REST_PERMISSION_RE.test(text) || input.overwhelmed) {
    needs.add("permission_to_rest");
    needs.add("calm_presence");
  }

  if (BUILD_ASK_RE.test(text)) {
    needs.add("writer");
    needs.add("strategist");
  }

  if (RESEARCH_ASK_RE.test(text)) {
    needs.add("researcher");
    needs.add("teacher");
  }

  if (THINK_ASK_RE.test(text)) {
    needs.add("sounding_board");
    needs.add("strategist");
  }

  if (
    emotional.includes("shame") ||
    emotional.includes("discouragement") ||
    /\b(?:behind|failing|not enough|the problem)\b/i.test(text)
  ) {
    signals.add("dignity_at_risk");
    needs.add("calm_presence");
  }

  if (
    /\b(?:pattern|always|usually|notice|when i)\b/i.test(text) &&
    !identityStatement
  ) {
    signals.add("mirror_pattern");
  }

  if (needs.size === 0) {
    needs.add("sounding_board");
  }

  const deferAdvice =
    signals.has("acceptance_before_advice") &&
    !ADVICE_ASK_RE.test(text) &&
    !BUILD_ASK_RE.test(text);

  return {
    friendNeeds: [...needs],
    signals: [...signals],
    deferAdvice,
    reason: `needs: ${[...needs].slice(0, 3).join(", ")}`,
  };
}
