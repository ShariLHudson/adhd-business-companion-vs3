import type { ExecutiveDecision } from "../types";
import { remember } from "@/lib/institutionalMemory";

export function rememberOutcome(decision: ExecutiveDecision) {
  const review = decision.review;
  const outcome = decision.outcome;
  const rec = decision.recommendation;

  const memory = remember({
    kind: "decision",
    title: decision.title,
    description: outcome?.summary ?? decision.question,
    context: decision.whyItMatters,
    whyThisHappened: rec?.why ?? decision.opportunity,
    problemSolved: decision.opportunity,
    decidedBy: "Shari Hudson",
    alternativesConsidered: decision.options.map((o) => o.label),
    expectedOutcome: rec?.headline ?? "Decision recorded.",
    actualOutcome: outcome?.summary ?? "Outcome pending.",
    lessonsLearned: decision.lessons.map((l) => l.lesson),
    wouldDoAgain: outcome?.wouldDoAgain ?? "partial",
    relatedMissions: decision.missionId ? [decision.missionId] : [],
    relatedProducts: decision.productId ? [decision.productId] : [],
    relatedResearch: [],
    relatedCustomers: [],
    relatedContent: [],
    relatedWorkshops: decision.category === "workshop" ? [decision.id] : [],
    relatedCampaigns: decision.category === "marketing" || decision.category === "launch" ? [decision.id] : [],
    relatedRevenue: [],
    evidence: [],
    graphNodeIds: decision.graphNodeIds,
  });

  return {
    decisionId: decision.id,
    institutionalMemoryId: memory.id,
    graphNodeIds: decision.graphNodeIds,
    summary: `Decision stored in Institutional Memory: ${memory.title}`,
  };
}
