import type { StrategyWorkItem } from "../../types";
import type { StrategicExperiment } from "../types";

export function designDefaultExperiment(
  item: StrategyWorkItem,
): StrategicExperiment | null {
  const q = (item.decisionStatement || item.title || "").trim();
  if (!q) return null;
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
