import { shouldEnterDiscoveryMode } from "@/lib/estateBrain/discoveryMode";
import {
  hasCreateSignals,
  hasDiscoverSignals,
  hasSupportSignals,
  hasThinkSignals,
} from "@/lib/sparkCompanion/dynamicCompanionRoles/roleSignals";
import type { SparkPrimaryIntent } from "./types";

const EXPLORE_RE =
  /\b(?:what can spark|what can you do|show me (?:the )?estate|estate spaces|what experts|visual models|what(?:'s| is) available|capabilities)\b/i;

const LEARN_RE =
  /\b(?:teach me|explain|what is|what are|how does|how do|tell me about|describe)\b/i;

const SUPPORT_RE =
  /\b(?:overwhelm|can'?t start|frustrated|discouraged|what(?:'s| is) wrong with me|stuck|feel(?:ing)? (?:heavy|defeated|hopeless)|burned out|burnt out)\b/i;

const CREATE_RE =
  /\b(?:help me (?:create|write|draft|build|make)|write (?:a|an|my)|create (?:a|an|my)|build (?:a|an|my)|research competitors|marketing plan|newsletter|proposal|website)\b/i;

const THINK_RE =
  /\b(?:help me decide|two ideas|which direction|talk (?:this|it) through|figure out|not sure which|compare options)\b/i;

export function classifySparkPrimaryIntent(input: {
  userText: string;
  overwhelmed?: boolean;
}): {
  intent: SparkPrimaryIntent;
  confidence: "high" | "medium" | "low";
  reason: string;
} {
  const text = input.userText.trim();
  if (!text) {
    return { intent: "THINK", confidence: "low", reason: "empty — gentle orient" };
  }

  if (shouldEnterDiscoveryMode(text) || EXPLORE_RE.test(text)) {
    return {
      intent: "EXPLORE",
      confidence: EXPLORE_RE.test(text) ? "high" : "medium",
      reason: "discovery or capability exploration",
    };
  }

  const support = hasSupportSignals(text, input.overwhelmed) || SUPPORT_RE.test(text);
  const create = hasCreateSignals(text) || CREATE_RE.test(text);
  const think = hasThinkSignals(text) || THINK_RE.test(text);
  const learn = hasDiscoverSignals(text) || LEARN_RE.test(text);

  if (support && !create) {
    return {
      intent: "SUPPORT",
      confidence: SUPPORT_RE.test(text) ? "high" : "medium",
      reason: "emotionally or mentally stuck",
    };
  }

  if (create && !support) {
    return {
      intent: "CREATE",
      confidence: CREATE_RE.test(text) ? "high" : "medium",
      reason: "clear create/build request",
    };
  }

  if (learn && !create && !/\bresearch competitors\b/i.test(text)) {
    return {
      intent: "LEARN",
      confidence: LEARN_RE.test(text) ? "high" : "medium",
      reason: "knowledge request",
    };
  }

  if (think || support) {
    return {
      intent: support && create ? "SUPPORT" : "THINK",
      confidence: think ? "medium" : "low",
      reason: support && create ? "task with friction — support first" : "clarity or decision",
    };
  }

  if (create) {
    return { intent: "CREATE", confidence: "medium", reason: "actionable signal" };
  }

  return { intent: "THINK", confidence: "low", reason: "default thinking partner" };
}
