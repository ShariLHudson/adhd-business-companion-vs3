import { detectMemberEmotionalSignals } from "@/lib/conversation/emotionalFirstResponseSequence";
import { detectMentalLoadSignals } from "@/lib/sparkCompanion/makeItLighter/mentalLoadSignals";
import type {
  SparkEstatePromiseId,
  SparkEstatePromisesDecision,
  SparkLeaveFeeling,
} from "./types";

const SELF_DOUBT_RE =
  /\b(?:self[- ]doubt|not good enough|feel like a failure|forgot (?:how far|my progress)|only (?:see|remember) (?:what went wrong|the mistakes)|impostor|imposter)\b/i;

const ALONE_CARRY_RE =
  /\b(?:alone|by myself|no one|carry(?:ing)? (?:this|it|everything)|figure it out alone|on my own)\b/i;

const BELONGING_DAY_RE =
  /\b(?:bad day|hard day|messy|ordinary|don'?t deserve|don'?t belong|not productive enough|wasted day)\b/i;

const CELEBRATION_RE =
  /\b(?:celebrat|excited|proud|launched|big win|breakthrough)\b/i;

const FORWARD_RE =
  /\b(?:next step|move forward|way forward|get (?:this|it) done|help me (?:create|write|build|decide|plan|learn|think)|stuck|overwhelm|don'?t know where)\b/i;

export function evaluateSparkEstatePromises(input: {
  userText: string;
  overwhelmed?: boolean;
}): SparkEstatePromisesDecision {
  const text = input.userText.trim();
  const promises = new Set<SparkEstatePromiseId>(["understood", "always_belong"]);
  const feelings = new Set<SparkLeaveFeeling>();

  if (!text) {
    return {
      activePromises: ["understood", "always_belong"],
      targetFeelings: ["lighter"],
      reason: "empty — welcome and belong",
    };
  }

  const emotional = detectMemberEmotionalSignals(text);
  const load = detectMentalLoadSignals(text);

  promises.add("never_alone");
  promises.add("way_forward");

  if (
    input.overwhelmed ||
    load.length > 0 ||
    emotional.includes("overwhelm") ||
    emotional.includes("grief") ||
    emotional.includes("exhaustion") ||
    ALONE_CARRY_RE.test(text)
  ) {
    feelings.add("lighter");
    feelings.add("more_hopeful");
  }

  if (
    emotional.includes("shame") ||
    emotional.includes("discouragement") ||
    SELF_DOUBT_RE.test(text)
  ) {
    promises.add("remember_best");
    feelings.add("more_hopeful");
    feelings.add("more_capable");
  }

  if (FORWARD_RE.test(text) || emotional.includes("uncertainty")) {
    feelings.add("clearer");
    feelings.add("more_capable");
  }

  if (CELEBRATION_RE.test(text)) {
    promises.add("remember_best");
    feelings.add("more_hopeful");
  }

  if (BELONGING_DAY_RE.test(text)) {
    promises.add("always_belong");
    feelings.add("lighter");
  }

  if (feelings.size === 0) {
    feelings.add("clearer");
  }

  return {
    activePromises: [...promises],
    targetFeelings: [...feelings],
    reason: `promises: ${[...promises].join(", ")}`,
  };
}
