import type { DecisionPlan, ExecutiveDecision } from "../types";

export function prepareDecisionPlan(decision: ExecutiveDecision): DecisionPlan {
  if (decision.plan) return decision.plan;

  return {
    decisionId: decision.id,
    missionUpdates: decision.missionId ? [`Review mission milestones for ${decision.missionId}`] : [],
    roadmapUpdates: [`Add ${decision.title} to roadmap review`],
    developmentPhases: decision.category === "product" ? ["Discovery", "Build draft", "QA", "Approval gate"] : [],
    researchTasks: ["Confirm customer evidence", "Check Institutional Memory for past decisions"],
    contentIdeas: decision.category === "marketing" ? ["Campaign draft", "Nurture sequence draft"] : [],
    marketingIdeas: decision.category === "launch" ? ["Launch checklist draft", "Hold send until approved"] : [],
    automationOpportunities: decision.category === "automation" ? ["GHL workflow draft — no live trigger"] : [],
    teamWork: ["Assign draft owners only — no execution"],
    status: "draft",
  };
}
