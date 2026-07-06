/**
 * Optional Founder bridge — Executive Orchestrator without UI wiring.
 */
import { DEFAULT_ACTIVE_MISSION_ID } from "@/lib/founder/missions";
import { executiveDecisionService } from "@/lib/executiveDecision";
import { executiveOrchestratorService } from "@/lib/orchestrator";

function bundle(initiativeId: string) {
  const initiative = executiveOrchestratorService.get(initiativeId);
  if (!initiative) return null;

  return {
    product: "founder" as const,
    initiative,
    lifecycle: executiveOrchestratorService.lifecycle(initiativeId),
    founderPromise: executiveOrchestratorService.founderPromise(initiativeId),
    implementation: executiveOrchestratorService.prepareImplementation(initiativeId),
    checklist: executiveOrchestratorService.prepareChecklist(initiativeId),
    assignments: executiveOrchestratorService.prepareAssignments(initiativeId),
    automation: executiveOrchestratorService.prepareAutomationCandidates(initiativeId),
    automationSummary: executiveOrchestratorService.automationSummary(initiativeId),
    monitoring: executiveOrchestratorService.prepareMonitoring(initiativeId),
    roi: executiveOrchestratorService.calculateROI(initiativeId),
    approval: executiveOrchestratorService.approval(initiativeId),
    decision: executiveOrchestratorService.linkedDecision(initiativeId),
    controlPrinciples: executiveOrchestratorService.controlPrinciples(),
  };
}

export function prepareExecutiveInitiative(initiativeId: string) {
  return bundle(initiativeId);
}

export function prepareMissionExecution(missionId: string = DEFAULT_ACTIVE_MISSION_ID) {
  const initiative =
    executiveOrchestratorService.sampleRepository().forMission(missionId).find((i) => i.category === "mission") ??
    executiveOrchestratorService.sampleRepository().forMission(missionId)[0];
  return initiative ? bundle(initiative.id) : null;
}

export function prepareLaunch(missionId: string = DEFAULT_ACTIVE_MISSION_ID) {
  const initiative = executiveOrchestratorService
    .list()
    .find((i) => i.missionId === missionId && (i.category === "launch" || i.title.toLowerCase().includes("launch")));
  if (initiative) return bundle(initiative.id);
  const decision = executiveDecisionService.sampleRepository().byCategory("launch").find((d) => d.missionId === missionId);
  const fromDecision = decision
    ? executiveOrchestratorService.sampleRepository().forDecision(decision.id)
    : undefined;
  return fromDecision ? bundle(fromDecision.id) : null;
}

export function prepareWorkshop(missionId: string = DEFAULT_ACTIVE_MISSION_ID) {
  const initiative = executiveOrchestratorService
    .sampleRepository()
    .byCategory("workshop")
    .find((i) => i.missionId === missionId);
  return initiative ? bundle(initiative.id) : null;
}

export function prepareCourse(missionId: string = DEFAULT_ACTIVE_MISSION_ID) {
  const initiative = executiveOrchestratorService
    .sampleRepository()
    .byCategory("course")
    .find((i) => i.missionId === missionId);
  return initiative ? bundle(initiative.id) : prepareWorkshop(missionId);
}

export function prepareMarketingCampaign(missionId: string = DEFAULT_ACTIVE_MISSION_ID) {
  const initiative = executiveOrchestratorService
    .list()
    .find((i) => i.missionId === missionId && (i.category === "marketing" || i.category === "launch"));
  return initiative ? bundle(initiative.id) : null;
}

export function prepareAutomation(missionId: string = DEFAULT_ACTIVE_MISSION_ID) {
  const fromTitle = executiveOrchestratorService
    .list()
    .find((i) => i.missionId === missionId && i.title.toLowerCase().includes("automat"));
  if (fromTitle) return bundle(fromTitle.id);

  const linked = executiveOrchestratorService.sampleRepository().forDecision("ed-automate-onboarding");
  if (linked) return bundle(linked.id);

  return prepareInitiativeFromDecision("ed-automate-onboarding");
}

export function prepareInitiativeFromDecision(decisionId: string) {
  const existing = executiveOrchestratorService.sampleRepository().forDecision(decisionId);
  if (existing) return bundle(existing.id);
  const decision = executiveDecisionService.get(decisionId);
  if (!decision) return null;
  const created = executiveOrchestratorService.createInitiative({
    title: decision.title,
    category: decision.category === "workshop" ? "workshop" : decision.category === "launch" ? "launch" : "mission",
    missionId: decision.missionId,
    productId: decision.productId,
    decisionId: decision.id,
    goal: decision.opportunity,
    purpose: decision.whyItMatters,
    businessValue: decision.whyItMatters,
    expectedOutcome: decision.recommendation?.headline ?? decision.opportunity,
    graphNodeIds: decision.graphNodeIds,
  });
  return bundle(created.id);
}
