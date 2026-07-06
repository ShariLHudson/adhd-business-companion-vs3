import type { ExecutiveInitiative, ExecutiveMonitoring, ExecutiveProgress, ExecutiveROI } from "../types";
import { buildExecutivePlan } from "../planning/implementationPlans";

export function calculateROI(initiative: ExecutiveInitiative): ExecutiveROI {
  if (initiative.roi) return initiative.roi;

  const automationBonus = initiative.estimatedAutomationPotential * 0.05;
  const saved = Math.min(20, 4 + automationBonus);
  return {
    founderTimeRequiredHours: initiative.priority === "critical" ? 10 : 6,
    founderTimeSavedHours: saved,
    teamTimeRequiredHours: 8,
    estimatedRevenue: initiative.estimatedRevenue,
    customerValue: initiative.estimatedCustomerImpact,
    strategicValue: initiative.strategicImportance,
    risk: initiative.priority === "critical" ? "medium" : "low",
    confidence: initiative.estimatedConfidence,
    difficulty: 50,
    longTermBenefit: initiative.businessValue,
  };
}

export function roiRecommendation(roi: ExecutiveROI): string {
  const net = roi.founderTimeSavedHours - roi.founderTimeRequiredHours;
  if (net > 2) return "High return on Shari's time — prioritize when approved.";
  if (net > 0) return "Positive ROI — schedule after critical path items.";
  return "Heavy founder time — defer or delegate preparation first.";
}
