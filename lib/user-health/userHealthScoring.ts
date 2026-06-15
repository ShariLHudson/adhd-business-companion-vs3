/**
 * Score user health status from gathered signals — explainable, no manipulation.
 */

import type {
  HealthConfidence,
  SupportNeed,
  UserHealthInput,
  UserHealthSnapshot,
  UserHealthStatus,
} from "./types";

type StatusCandidate = {
  status: UserHealthStatus;
  weight: number;
  risks: string[];
  strengths: string[];
};

const SUPPORT_LABELS: Record<SupportNeed, string> = {
  emotional_support: "Emotional support",
  sorting_help: "Sorting help",
  activation_help: "Activation help",
  recovery_support: "Recovery support",
  planning_help: "Planning help",
  relationship_followup: "Relationship follow-up",
  business_clarity: "Business clarity",
  celebration_recognition: "Celebration & recognition",
};

export function supportNeedLabel(need: SupportNeed): string {
  return SUPPORT_LABELS[need];
}

export function deriveSupportNeeds(input: UserHealthInput): SupportNeed[] {
  const needs = new Set<SupportNeed>();
  const load = input.cognitiveLoadLevel;
  const activation = input.activationState;
  const emotion = input.emotionalState;

  if (
    emotion === "overwhelmed" ||
    emotion === "emotional" ||
    load === "overloaded"
  ) {
    needs.add("emotional_support");
    needs.add("recovery_support");
  }
  if (load === "heavy" || load === "overloaded") {
    needs.add("sorting_help");
  }
  if (activation === "stuck" || activation === "frozen" || emotion === "stuck") {
    needs.add("activation_help");
  }
  if (input.primaryLoopType) {
    needs.add("emotional_support");
  }
  if ((input.dayDesignerPlansCount ?? 0) > 0 || emotion === "building") {
    needs.add("planning_help");
  }
  if ((input.stalledProjectCount ?? 0) > 0) {
    needs.add("business_clarity");
  }
  if ((input.winLanguageCount ?? 0) > 0 || (input.recognitionMomentsRecent ?? 0) > 0) {
    needs.add("celebration_recognition");
  }
  return [...needs];
}

function recommendedSupportFor(
  status: UserHealthStatus,
  needs: SupportNeed[],
): string {
  if (status === "overloaded") {
    return "Offer sorting or recovery support — reduce complexity before new plans.";
  }
  if (status === "disengaging") {
    return "Welcome back gently. No guilt, no “we missed you,” no retention pressure.";
  }
  if (status === "recovering") {
    return "Encourage gently — avoid pushing big plans.";
  }
  if (status === "needs_support") {
    return "Lead with validation and one small offer — user well-being before productivity.";
  }
  if (needs.includes("celebration_recognition")) {
    return "Recognize progress warmly, then follow their lead.";
  }
  if (status === "supported" || status === "steady") {
    return "Continue normal companion behavior — stay present, not pushy.";
  }
  return "Observe gently — not enough signal yet to infer support needs.";
}

export function scoreUserHealth(
  input: UserHealthInput,
  now = input.now ?? new Date(),
): UserHealthSnapshot {
  const candidates: StatusCandidate[] = [];
  const load = input.cognitiveLoadLevel;
  const activation = input.activationState;
  const emotion = input.emotionalState;
  const daysAway = input.daysSinceLastActivity;
  const dismissals = input.recentDismissalCount ?? 0;
  const overwhelm = input.overwhelmLanguageCount ?? 0;
  const stuck = input.stuckLanguageCount ?? 0;
  const wins = input.winLanguageCount ?? 0;

  if (load === "overloaded" || (overwhelm >= 3 && load !== "light")) {
    candidates.push({
      status: "overloaded",
      weight: load === "overloaded" ? 10 : 8,
      risks: ["Elevated cognitive load", "Repeated overwhelm language"],
      strengths: wins > 0 ? ["Recent wins despite load"] : [],
    });
  }

  if (
    emotion === "overwhelmed" ||
    emotion === "emotional" ||
    activation === "frozen"
  ) {
    candidates.push({
      status: "needs_support",
      weight: emotion === "emotional" ? 9 : 8,
      risks: ["Emotional distress or shutdown signals"],
      strengths: [],
    });
  }

  if (
    daysAway != null &&
    daysAway >= 7 &&
    (input.conversationStarts ?? 0) > 0
  ) {
    candidates.push({
      status: "disengaging",
      weight: daysAway >= 14 ? 9 : 7,
      risks: ["Reduced activity — long gap since last conversation"],
      strengths: [],
    });
  }

  if (dismissals >= 4 && wins === 0 && overwhelm === 0) {
    candidates.push({
      status: "disengaging",
      weight: 6,
      risks: ["Repeated “not now” dismissals without recent wins"],
      strengths: ["User exercising control — respect boundaries"],
    });
  }

  if (
    activation === "recovering" ||
    (wins >= 2 && (overwhelm > 0 || stuck > 0))
  ) {
    candidates.push({
      status: "recovering",
      weight: activation === "recovering" ? 8 : 7,
      risks: [],
      strengths: ["Momentum returning", "Recent progress language"],
    });
  }

  if (
    wins >= 1 &&
    load !== "overloaded" &&
    activation !== "frozen" &&
    emotion !== "overwhelmed"
  ) {
    candidates.push({
      status: "supported",
      weight: wins >= 2 ? 8 : 6,
      risks: [],
      strengths: ["Wins and progress", "Appears resourced"],
    });
  }

  if (
    !candidates.length &&
    (input.conversationStarts ?? 0) === 0 &&
    daysAway === null
  ) {
    candidates.push({
      status: "unknown",
      weight: 3,
      risks: [],
      strengths: [],
    });
  }

  if (!candidates.length) {
    candidates.push({
      status: "steady",
      weight: 5,
      risks: stuck >= 2 ? ["Some stuck language"] : [],
      strengths: wins > 0 ? ["Steady engagement"] : ["Active use"],
    });
  }

  candidates.sort((a, b) => b.weight - a.weight);
  const top = candidates[0]!;
  const second = candidates[1];

  const confidence: HealthConfidence =
    top.weight >= 8
      ? "high"
      : top.weight >= 6 || (second && second.weight >= 6)
        ? "medium"
        : "low";

  const supportNeeds = deriveSupportNeeds(input);
  const riskFactors = [
    ...new Set(candidates.flatMap((c) => c.risks).filter(Boolean)),
  ].slice(0, 5);
  const strengths = [
    ...new Set(candidates.flatMap((c) => c.strengths).filter(Boolean)),
  ].slice(0, 5);

  return {
    status: top.status,
    confidence,
    supportNeeds,
    riskFactors,
    strengths,
    recommendedSupport: recommendedSupportFor(top.status, supportNeeds),
    createdAt: now.toISOString(),
  };
}
