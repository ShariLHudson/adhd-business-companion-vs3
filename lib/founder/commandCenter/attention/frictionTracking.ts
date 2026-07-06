import type { ExecutiveFriction, FrictionKind } from "../types";
import { executiveOrchestratorService } from "@/lib/orchestrator";
import { executiveDecisionService } from "@/lib/executiveDecision";

export function detectExecutiveFriction(): ExecutiveFriction[] {
  const frictions: ExecutiveFriction[] = [];

  const awaitingApproval = executiveOrchestratorService
    .list()
    .filter((i) => i.approvals.some((a) => a.requiresExplicitApproval && a.status === "pending"));
  if (awaitingApproval.length > 0) {
    frictions.push({
      id: "fric-approvals",
      kind: "too_many_approvals",
      label: `${awaitingApproval.length} initiative(s) awaiting Founder approval`,
      impact: awaitingApproval.length > 2 ? "high" : "medium",
      reduction: "Batch approvals in one calm review — not throughout the day.",
    });
  }

  const blocked = executiveOrchestratorService.list().filter((i) => i.status === "blocked");
  if (blocked.length > 0) {
    frictions.push({
      id: "fric-blocked",
      kind: "blocked_initiative",
      label: `${blocked.length} blocked initiative(s)`,
      impact: "medium",
      reduction: "Resolve blockers or defer — do not carry mentally.",
    });
  }

  const decisions = executiveDecisionService.list();
  if (decisions.length > 5) {
    frictions.push({
      id: "fric-decisions",
      kind: "repeated_decision",
      label: "Many open executive decisions",
      impact: "medium",
      reduction: "One recommended decision on the desk; others to WATCH.",
    });
  }

  frictions.push({
    id: "fric-search",
    kind: "searching",
    label: "Context scattered across modules",
    impact: "low",
    reduction: "Command Center composes — do not hunt modules.",
  });

  return frictions;
}

export function frictionReductionPlan(frictions: ExecutiveFriction[]): string[] {
  return frictions.map((f) => f.reduction);
}
