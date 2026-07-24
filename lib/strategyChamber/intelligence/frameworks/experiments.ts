import type { StrategyWorkItem } from "../../types";
import { getStrategyType, resolvePrimaryStrategyType } from "../registry";
import type { OptionPatternId, StrategicExperiment } from "../types";
import { materializeStrategicOption } from "./optionCatalog";

export function designDefaultExperiment(
  item: StrategyWorkItem,
): StrategicExperiment | null {
  const q = (item.decisionStatement || item.title || "").trim();
  if (!q) return null;

  const type =
    getStrategyType(item.strategyType) ||
    resolvePrimaryStrategyType(q);
  if (type?.experimentPatterns?.[0]) {
    const pattern: OptionPatternId =
      type.id === "pricing"
        ? "protect_base"
        : type.id === "hiring_delegation"
          ? "partner"
          : "test";
    const seeded = materializeStrategicOption(pattern, {
      typeId: type.id,
      experimentHint: type.experimentPatterns[0],
    }).experiment;
    if (seeded) {
      return {
        ...seeded,
        assumptionBeingTested:
          item.assumptions?.[0]?.trim() || seeded.assumptionBeingTested,
        successSignal:
          item.successSignals?.[0]?.trim() || seeded.successSignal,
      };
    }
  }

  const lower = q.toLowerCase();

  if (/\bprice|pricing|fee\b/.test(lower)) {
    return {
      assumptionBeingTested:
        "New customers will accept a higher price when value is clear.",
      smallAction: "Offer the new price to new members only for a limited window.",
      duration: "30 days",
      successSignal: "New joins continue at an acceptable rate.",
      stopSignal: "New joins drop sharply or feedback shows confusion about value.",
      evidenceToCollect: "Join rate, questions asked, and early cancellations.",
      decisionThatFollows:
        "Whether to keep the new price, adjust, or leave current pricing.",
    };
  }

  if (/\bhire|delegate\b/.test(lower)) {
    return {
      assumptionBeingTested:
        "A clearly defined task can be owned by someone else without quality loss.",
      smallAction: "Hand off one well-defined task for two weeks.",
      duration: "14 days",
      successSignal: "The task completes reliably with light oversight.",
      stopSignal: "Quality drops or management time exceeds the relief gained.",
      evidenceToCollect: "Time saved, rework needed, and your stress level.",
      decisionThatFollows: "Whether to expand help, redesign the role, or pause.",
    };
  }

  return {
    assumptionBeingTested:
      item.assumptions?.[0]?.trim() ||
      "The preferred direction will hold up in real conditions.",
    smallAction: "Run a small, time-boxed test of the leading direction.",
    duration: "30 days",
    successSignal:
      item.successSignals?.[0]?.trim() ||
      "Clearer signal that the direction fits.",
    stopSignal: "Evidence that the direction creates more strain than progress.",
    evidenceToCollect: "A few concrete signals you can notice without a dashboard.",
    decisionThatFollows: "Whether to commit, adjust, or choose another path.",
  };
}

/** Prefer a small experiment when the leading option is hard to reverse or low-confidence. */
export function shouldPreferExperiment(
  item: StrategyWorkItem,
  leadingOptionTitle?: string,
): boolean {
  const text = `${item.chosenDirection || ""} ${leadingOptionTitle || ""}`.toLowerCase();
  if (/\b(test|pilot|experiment|30 days|trial)\b/.test(text)) return true;
  if (
    /\b(everyone|permanent|rebrand|shut down|fire|contract)\b/.test(text)
  ) {
    return true;
  }
  if ((item.confidenceLevel || "medium") === "low") return true;
  return false;
}
