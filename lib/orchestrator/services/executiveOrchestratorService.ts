import type { CreateInitiativeInput, ExecutiveInitiative } from "../types";
import { orchestratorSampleRepository } from "../repositories/sample";
import { approvalStatus, executiveControlPrinciples } from "../approvals/approvalGates";
import { prepareChecklist as buildChecklist } from "../checklists/checklistPrep";
import { delegationSummary, prepareAssignments as buildAssignments, prepareAutomationCandidates as buildAutomationCandidates } from "../delegation/assignmentPrep";
import { prepareOrchestration } from "../execution/executionPrep";
import { captureOrchestratorSnapshot, mergedInitiatives, runtimeInitiatives } from "../history/orchestratorHistory";
import { computeProgress, prepareMonitoring as buildMonitoring, updateProgress as patchProgress } from "../monitoring/initiativeMonitoring";
import { buildExecutivePlan, prepareImplementationPlans } from "../planning/implementationPlans";
import { calculateROI as computeRoi, roiRecommendation } from "../planning/roiCalculation";
import { rememberInitiativeOutcome, reviewInitiative as buildReview } from "../progress/initiativeReview";
import { adaptInitiative, orchestratorProgress } from "../workflows/initiativeWorkflow";
import { executiveDecisionService } from "@/lib/executiveDecision";

function nextId(): string {
  return `init-runtime-${Date.now()}-${runtimeInitiatives.length}`;
}

export class ExecutiveOrchestratorService {
  createInitiative(input: CreateInitiativeInput): ExecutiveInitiative {
    const now = new Date().toISOString();
    const initiative: ExecutiveInitiative = {
      id: nextId(),
      title: input.title,
      category: input.category,
      missionId: input.missionId,
      productId: input.productId,
      decisionId: input.decisionId,
      goal: input.goal,
      purpose: input.purpose,
      businessValue: input.businessValue,
      expectedOutcome: input.expectedOutcome,
      priority: input.priority ?? "medium",
      strategicImportance: input.strategicImportance ?? 70,
      estimatedTime: input.estimatedTime ?? "TBD",
      estimatedEffort: input.estimatedEffort ?? "Medium",
      estimatedRevenue: input.estimatedRevenue ?? "TBD",
      estimatedCustomerImpact: input.estimatedCustomerImpact ?? "Medium",
      estimatedTimeSaved: input.estimatedTimeSaved ?? "TBD",
      estimatedAutomationPotential: input.estimatedAutomationPotential ?? 40,
      estimatedConfidence: input.estimatedConfidence ?? 70,
      currentStep: "discover",
      completedSteps: ["discover"],
      status: "draft",
      assignments: [],
      automationCandidates: [],
      approvals: [],
      graphNodeIds: input.graphNodeIds ?? [],
      createdAt: now,
      updatedAt: now,
    };
    runtimeInitiatives.push(initiative);
    return initiative;
  }

  get(id: string) {
    return mergedInitiatives().find((i) => i.id === id) ?? null;
  }

  list() {
    return mergedInitiatives();
  }

  prepareImplementation(initiativeId: string) {
    const initiative = this.get(initiativeId);
    if (!initiative) return null;
    return {
      plans: prepareImplementationPlans(initiative),
      executivePlan: buildExecutivePlan(initiative),
      orchestration: prepareOrchestration(initiative),
    };
  }

  prepareChecklist(initiativeId: string) {
    const initiative = this.get(initiativeId);
    if (!initiative) return null;
    return buildChecklist(initiative);
  }

  prepareAssignments(initiativeId: string) {
    const initiative = this.get(initiativeId);
    if (!initiative) return [];
    return buildAssignments(initiative);
  }

  prepareAutomationCandidates(initiativeId: string) {
    const initiative = this.get(initiativeId);
    if (!initiative) return [];
    return buildAutomationCandidates(initiative);
  }

  automationSummary(initiativeId: string) {
    const candidates = this.prepareAutomationCandidates(initiativeId);
    return delegationSummary(candidates);
  }

  prepareMonitoring(initiativeId: string) {
    const initiative = this.get(initiativeId);
    if (!initiative) return null;
    return buildMonitoring(initiative);
  }

  updateProgress(initiativeId: string, patch: Parameters<typeof patchProgress>[1]) {
    const initiative = this.get(initiativeId);
    if (!initiative) return null;
    return patchProgress(initiative, patch);
  }

  calculateROI(initiativeId: string) {
    const initiative = this.get(initiativeId);
    if (!initiative) return null;
    const roi = computeRoi(initiative);
    return { roi, recommendation: roiRecommendation(roi) };
  }

  reviewInitiative(initiativeId: string) {
    const initiative = this.get(initiativeId);
    if (!initiative) return null;
    return buildReview(initiative);
  }

  rememberOutcome(initiativeId: string) {
    const initiative = this.get(initiativeId);
    if (!initiative) return null;
    return rememberInitiativeOutcome(initiative);
  }

  lifecycle(initiativeId: string) {
    const initiative = this.get(initiativeId);
    if (!initiative) return null;
    return orchestratorProgress(initiative);
  }

  adapt(initiativeId: string, changes: Parameters<typeof adaptInitiative>[1]) {
    const initiative = this.get(initiativeId);
    if (!initiative) return null;
    return adaptInitiative(initiative, changes);
  }

  approval(initiativeId: string) {
    const initiative = this.get(initiativeId);
    if (!initiative) return null;
    return approvalStatus(initiative);
  }

  linkedDecision(initiativeId: string) {
    const initiative = this.get(initiativeId);
    if (!initiative?.decisionId) return null;
    return executiveDecisionService.get(initiative.decisionId);
  }

  founderPromise(initiativeId: string) {
    return this.get(initiativeId)?.founderPromise ?? null;
  }

  controlPrinciples() {
    return executiveControlPrinciples();
  }

  progress(initiativeId: string) {
    const initiative = this.get(initiativeId);
    if (!initiative) return null;
    return computeProgress(initiative);
  }

  historySnapshot() {
    return captureOrchestratorSnapshot();
  }

  sampleRepository() {
    return orchestratorSampleRepository;
  }
}

export const executiveOrchestratorService = new ExecutiveOrchestratorService();

export function createInitiative(input: CreateInitiativeInput) {
  return executiveOrchestratorService.createInitiative(input);
}

export function prepareImplementation(initiativeId: string) {
  return executiveOrchestratorService.prepareImplementation(initiativeId);
}

export function prepareChecklist(initiativeId: string) {
  return executiveOrchestratorService.prepareChecklist(initiativeId);
}

export function prepareAssignments(initiativeId: string) {
  return executiveOrchestratorService.prepareAssignments(initiativeId);
}

export function prepareAutomationCandidates(initiativeId: string) {
  return executiveOrchestratorService.prepareAutomationCandidates(initiativeId);
}

export function prepareMonitoring(initiativeId: string) {
  return executiveOrchestratorService.prepareMonitoring(initiativeId);
}

export function updateInitiativeProgress(initiativeId: string, patch: Parameters<typeof patchProgress>[1]) {
  return executiveOrchestratorService.updateProgress(initiativeId, patch);
}

export function calculateROI(initiativeId: string) {
  return executiveOrchestratorService.calculateROI(initiativeId);
}

export function reviewInitiative(initiativeId: string) {
  return executiveOrchestratorService.reviewInitiative(initiativeId);
}

export function resetRuntimeOrchestrator() {
  runtimeInitiatives.length = 0;
}
