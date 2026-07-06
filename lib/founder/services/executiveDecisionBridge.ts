/**
 * Optional Founder bridge — Executive Decision Lifecycle without UI wiring.
 */
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import {
  executiveDecisionService,
  type CreateDecisionInput,
  type ExecutiveDecision,
  type FounderGuidance,
} from "@/lib/executiveDecision";

export function prepareExecutiveDecision(decisionId: string) {
  const decision = executiveDecisionService.get(decisionId);
  if (!decision) return null;

  return {
    product: "founder" as const,
    decision,
    lifecycle: executiveDecisionService.lifecycle(decisionId),
    guidance: executiveDecisionService.founderGuidance(decisionId),
    comparison: executiveDecisionService.compareOptions(decisionId),
    recommendation: executiveDecisionService.recommendOption(decisionId),
    plan: executiveDecisionService.preparePlan(decisionId),
    implementation: executiveDecisionService.prepareImplementation(decisionId),
    approval: executiveDecisionService.prepareApproval(decisionId),
    blocked: executiveDecisionService.isBlocked(decisionId),
    monitoring: executiveDecisionService.prepareMonitoring(decisionId),
    review: executiveDecisionService.reviewDecision(decisionId),
    controlPrinciples: executiveDecisionService.controlPrinciples(),
  };
}

export function prepareMissionDecision(
  missionId: string = DEFAULT_ACTIVE_MISSION_ID,
  decisionId?: string,
) {
  const decision =
    (decisionId ? executiveDecisionService.get(decisionId) : null) ??
    executiveDecisionService.sampleRepository().forMission(missionId)[0];
  if (!decision) return null;
  return prepareExecutiveDecision(decision.id);
}

export function prepareProductDecision(productId = "listening-rooms") {
  const decision = executiveDecisionService
    .list()
    .find((d) => d.productId === productId && d.category === "product");
  return decision ? prepareExecutiveDecision(decision.id) : null;
}

export function prepareWorkshopDecision(missionId: string = DEFAULT_ACTIVE_MISSION_ID) {
  const decision = executiveDecisionService
    .sampleRepository()
    .byCategory("workshop")
    .find((d) => d.missionId === missionId);
  return decision ? prepareExecutiveDecision(decision.id) : null;
}

export function prepareMarketingDecision(missionId: string = DEFAULT_ACTIVE_MISSION_ID) {
  const decision = executiveDecisionService
    .list()
    .find(
      (d) =>
        d.missionId === missionId &&
        (d.category === "marketing" || d.category === "launch"),
    );
  return decision ? prepareExecutiveDecision(decision.id) : null;
}

export function prepareAutomationDecision(missionId: string = DEFAULT_ACTIVE_MISSION_ID) {
  const decision = executiveDecisionService
    .sampleRepository()
    .byCategory("automation")
    .find((d) => d.missionId === missionId);
  return decision ? prepareExecutiveDecision(decision.id) : null;
}

export function founderCreateDecision(input: CreateDecisionInput): ExecutiveDecision {
  return executiveDecisionService.createDecision(input);
}

export function founderDecisionGuidance(decisionId: string): FounderGuidance | null {
  return executiveDecisionService.founderGuidance(decisionId);
}
