import type { StrategyWorkItem } from "../../types";
import { getStrategyType, resolvePrimaryStrategyType } from "../registry";
import type { OptionPatternId, StrategicExperiment } from "../types";
import { materializeStrategicOption } from "./optionCatalog";
import { assessReversibility } from "./reversibility";

function withExperimentShape(
  base: StrategicExperiment,
  overrides?: Partial<StrategicExperiment>,
): StrategicExperiment {
  const merged = { ...base, ...overrides };
  const evidenceItems =
    merged.evidenceItems ||
    (merged.evidenceToCollect
      ? merged.evidenceToCollect.split(/,\s*/).map((s) => s.trim()).filter(Boolean)
      : []);
  const successSignals = merged.successSignals || [merged.successSignal];
  const stopSignals = merged.stopSignals || [merged.stopSignal];
  return {
    ...merged,
    id: merged.id || "exp-default",
    name: merged.name || "Small strategic test",
    action: merged.action || merged.smallAction,
    smallAction: merged.smallAction || merged.action || "",
    evidenceToCollect: merged.evidenceToCollect || evidenceItems.join(", "),
    evidenceItems,
    successSignals,
    stopSignals,
    successSignal: merged.successSignal || successSignals[0] || "",
    stopSignal: merged.stopSignal || stopSignals[0] || "",
    reviewPoint: merged.reviewPoint || `Review after ${merged.duration}`,
    scope: merged.scope || "Smaller than a full implementation",
    questionToAnswer:
      merged.questionToAnswer ||
      "Does this direction hold up in real conditions?",
  };
}

export function designDefaultExperiment(
  item: StrategyWorkItem,
): StrategicExperiment | null {
  const q = (item.decisionStatement || item.title || "").trim();
  if (!q) return null;

  const type =
    getStrategyType(item.strategyType) || resolvePrimaryStrategyType(q);
  if (type?.experimentPatterns?.[0]) {
    const pattern: OptionPatternId =
      type.id === "pricing"
        ? "protect_current_base"
        : type.id === "hiring_delegation"
          ? "delegate"
          : "test";
    const seeded = materializeStrategicOption(pattern, {
      typeId: type.id,
      experimentHint: type.experimentPatterns[0],
    }).experiment;
    if (seeded) {
      return withExperimentShape(seeded, {
        assumptionBeingTested:
          item.assumptions?.[0]?.trim() || seeded.assumptionBeingTested,
        successSignal:
          item.successSignals?.[0]?.trim() || seeded.successSignal,
        // Never auto-create a Project — destination is optional recommendation only
        recommendedDestination: undefined,
      });
    }
  }

  const lower = q.toLowerCase();

  if (/\bprice|pricing|fee\b/.test(lower)) {
    return withExperimentShape({
      id: "exp-pricing-new-members",
      name: "New-member pricing window",
      assumptionBeingTested:
        "New customers will accept a higher price when value is clear.",
      questionToAnswer: "Will new members still join at the updated price?",
      smallAction: "Offer the new price to new members only for a limited window.",
      action: "Offer the new price to new members only for a limited window.",
      scope: "New members only — current members unchanged",
      duration: "30 days",
      audience: "New joins",
      capacityLimit: "No change to current member delivery load",
      evidenceToCollect: "Join rate, questions asked, and early cancellations.",
      evidenceItems: ["Join rate", "Questions asked", "Early cancellations"],
      successSignal: "New joins continue at an acceptable rate.",
      successSignals: ["New joins continue at an acceptable rate"],
      stopSignal: "New joins drop sharply or feedback shows confusion about value.",
      stopSignals: [
        "New joins drop sharply",
        "Feedback shows confusion about value",
      ],
      reviewPoint: "Review after 30 days",
      decisionThatFollows:
        "Whether to keep the new price, adjust, or leave current pricing.",
    });
  }

  if (/\bhire|delegate|va|assistant\b/.test(lower)) {
    return withExperimentShape({
      id: "exp-delegate-one-task",
      name: "Two-week task trial",
      assumptionBeingTested:
        "A clearly defined task can be owned by someone else without quality loss.",
      questionToAnswer: "Does handoff create relief without new management drag?",
      smallAction: "Hand off one well-defined task for two weeks.",
      duration: "14 days",
      scope: "One task — not a full hire",
      evidenceToCollect: "Time saved, rework needed, and your stress level.",
      successSignal: "The task completes reliably with light oversight.",
      stopSignal: "Quality drops or management time exceeds the relief gained.",
      decisionThatFollows: "Whether to expand help, redesign the role, or pause.",
    });
  }

  if (/\bweekly email\b/.test(lower)) {
    return withExperimentShape({
      id: "exp-weekly-email",
      name: "Four-week email pilot",
      assumptionBeingTested: "A weekly email is useful and sustainable.",
      questionToAnswer: "Is weekly email worth continuing?",
      smallAction: "Send a simple weekly email for four weeks.",
      duration: "28 days",
      scope: "One short email per week — no full campaign system",
      evidenceToCollect: "Open replies, your energy cost, and whether it feels useful.",
      successSignal: "The email feels useful and sustainable.",
      stopSignal: "It becomes a burden or gets no useful response.",
      decisionThatFollows: "Continue, simplify cadence, or stop.",
      // Explicitly no project creation
      recommendedDestination: undefined,
    });
  }

  return withExperimentShape({
    id: "exp-leading-direction",
    name: "Time-boxed direction test",
    assumptionBeingTested:
      item.assumptions?.[0]?.trim() ||
      "The preferred direction will hold up in real conditions.",
    questionToAnswer: "Does the leading direction hold up enough to commit?",
    smallAction: "Run a small, time-boxed test of the leading direction.",
    duration: "30 days",
    scope: "Smaller than a full implementation",
    evidenceToCollect: "A few concrete signals you can notice without a dashboard.",
    successSignal:
      item.successSignals?.[0]?.trim() ||
      "Clearer signal that the direction fits.",
    stopSignal: "Evidence that the direction creates more strain than progress.",
    decisionThatFollows: "Whether to commit, adjust, or choose another path.",
  });
}

/** Prefer an experiment when uncertainty is high and a test can answer the question. */
export function shouldPreferExperiment(
  item: StrategyWorkItem,
  leadingOptionTitle?: string,
): boolean {
  const text = `${item.chosenDirection || ""} ${leadingOptionTitle || ""} ${item.decisionStatement || ""}`.toLowerCase();
  if (/\b(test|pilot|experiment|30 days|trial|weekly email|try)\b/.test(text)) {
    return true;
  }
  if (
    /\b(everyone|permanent|rebrand|shut down|fire|contract|clos(e|ing))\b/.test(
      text,
    )
  ) {
    // Hard decisions may still want a smaller probe first — but not always an experiment
    return !/\bclos(e|ing) the business\b/.test(text);
  }
  if ((item.confidenceLevel || "medium") === "low") return true;
  if ((item.unknowns?.length ?? 0) >= 2) return true;
  if ((item.assumptions?.length ?? 0) >= 1 && !item.chosenDirection) return true;
  return false;
}

export type ExperimentTriggerResult = {
  prefer: boolean;
  reason: string;
  skipReason?: string;
};

export function evaluateExperimentTriggers(
  item: StrategyWorkItem,
): ExperimentTriggerResult {
  const blob = [
    item.decisionStatement,
    item.chosenDirection,
    ...(item.unknowns ?? []),
  ]
    .filter(Boolean)
    .join(" ");
  const reverse = assessReversibility(blob);

  if (/\bclos(e|ing) the business\b/i.test(blob)) {
    return {
      prefer: false,
      reason: "",
      skipReason: "Decision depth is high — a casual experiment is not enough.",
    };
  }

  if (
    reverse === "easily_reversible" &&
    /\b(try|test|pilot|weekly email)\b/i.test(blob)
  ) {
    return {
      prefer: true,
      reason: "Easily reversible — a bounded test can answer the question.",
    };
  }

  if ((item.unknowns?.length ?? 0) >= 1 || shouldPreferExperiment(item)) {
    return {
      prefer: true,
      reason: "A limited test can reduce meaningful uncertainty.",
    };
  }

  if (item.confidenceLevel === "high" && item.chosenDirection?.trim()) {
    return {
      prefer: false,
      reason: "",
      skipReason: "Evidence already looks strong enough.",
    };
  }

  return {
    prefer: false,
    reason: "",
    skipReason: "No clear experiment trigger yet.",
  };
}
