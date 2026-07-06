import type { ExecutiveInitiative } from "../types";
import { buildExecutivePlan } from "../planning/implementationPlans";

export function prepareOrchestration(initiative: ExecutiveInitiative) {
  const plan = buildExecutivePlan(initiative);
  return {
    initiativeId: initiative.id,
    step: "orchestrate" as const,
    plan,
    modules: {
      founder: ["Decision bundle", "Approval queue"],
      cursor: plan.plans.developmentPlan,
      postcraft: plan.plans.contentPlan,
      ghl: plan.plans.automationPlan,
      companion: initiative.productId ? ["Spec verification checklist"] : [],
      teamHub: plan.plans.teamPlan,
    },
    status: "draft" as const,
    note: "Orchestration prepares — nothing executes.",
  };
}
