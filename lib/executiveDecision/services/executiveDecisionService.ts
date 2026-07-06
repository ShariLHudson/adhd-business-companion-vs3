import type { CreateDecisionInput, ExecutiveDecision } from "../types";
import { executiveDecisionSampleRepository } from "../repositories/sample";
import { approvalBlocked, executiveControlSummary, prepareApproval } from "../approvals/approvalFlow";
import { prepareAutomationDrafts } from "../automation/automationPrep";
import { captureDecisionHistorySnapshot, mergedDecisions, runtimeDecisions } from "../history/decisionHistory";
import { prepareImplementation } from "../implementation/implementationPrep";
import { lifecycleNarrative, lifecycleProgress } from "../lifecycle/decisionLifecycle";
import { compareOptions, optionComparisonMatrix } from "../lifecycle/optionComparison";
import { buildFounderGuidance, recommendOption } from "../lifecycle/recommendation";
import { rememberOutcome as storeOutcome } from "../lifecycle/rememberOutcome";
import { prepareMonitoring } from "../monitoring/monitoringPlan";
import { prepareDecisionPlan } from "../planning/planPreparation";
import { reviewDecision } from "../reviews/executiveReview";

function nextId(): string {
  return `ed-runtime-${Date.now()}-${runtimeDecisions.length}`;
}

export class ExecutiveDecisionService {
  createDecision(input: CreateDecisionInput): ExecutiveDecision {
    const now = new Date().toISOString();
    const decision: ExecutiveDecision = {
      id: nextId(),
      title: input.title,
      question: input.question,
      category: input.category,
      missionId: input.missionId,
      productId: input.productId,
      opportunity: input.opportunity,
      whyItMatters: input.whyItMatters,
      currentStep: "discover",
      completedSteps: ["discover"],
      priority: input.priority ?? "medium",
      confidence: { level: "exploratory", score: 50, rationale: "New decision — evidence gathering." },
      options: input.options ?? [],
      approvalStages: [],
      risks: [],
      fallbacks: [],
      lessons: [],
      relationships: [],
      graphNodeIds: input.graphNodeIds ?? [],
      createdAt: now,
      updatedAt: now,
    };
    runtimeDecisions.push(decision);
    return decision;
  }

  get(id: string) {
    return mergedDecisions().find((d) => d.id === id) ?? null;
  }

  list() {
    return mergedDecisions();
  }

  compareOptions(decisionId: string) {
    const decision = this.get(decisionId);
    if (!decision) return null;
    return compareOptions(decision);
  }

  compareMatrix(decisionId: string) {
    const decision = this.get(decisionId);
    if (!decision) return [];
    return optionComparisonMatrix(decision);
  }

  recommendOption(decisionId: string) {
    const decision = this.get(decisionId);
    if (!decision) return null;
    return recommendOption(decision);
  }

  founderGuidance(decisionId: string) {
    const decision = this.get(decisionId);
    if (!decision) return null;
    return buildFounderGuidance(decision);
  }

  preparePlan(decisionId: string) {
    const decision = this.get(decisionId);
    if (!decision) return null;
    return prepareDecisionPlan(decision);
  }

  prepareImplementation(decisionId: string) {
    const decision = this.get(decisionId);
    if (!decision) return null;
    return prepareImplementation(decision);
  }

  prepareApproval(decisionId: string) {
    const decision = this.get(decisionId);
    if (!decision) return [];
    return prepareApproval(decision);
  }

  isBlocked(decisionId: string) {
    const decision = this.get(decisionId);
    if (!decision) return true;
    return approvalBlocked(decision);
  }

  prepareMonitoring(decisionId: string) {
    const decision = this.get(decisionId);
    if (!decision) return null;
    return prepareMonitoring(decision);
  }

  reviewDecision(decisionId: string) {
    const decision = this.get(decisionId);
    if (!decision) return null;
    return reviewDecision(decision);
  }

  rememberOutcome(decisionId: string) {
    const decision = this.get(decisionId);
    if (!decision) return null;
    return storeOutcome(decision);
  }

  lifecycle(decisionId: string) {
    const decision = this.get(decisionId);
    if (!decision) return null;
    return lifecycleProgress(decision);
  }

  narrative(decisionId: string) {
    const decision = this.get(decisionId);
    if (!decision) return [];
    return lifecycleNarrative(decision);
  }

  automationDrafts(decisionId: string) {
    const decision = this.get(decisionId);
    if (!decision) return [];
    return prepareAutomationDrafts(decision);
  }

  controlPrinciples() {
    return executiveControlSummary();
  }

  historySnapshot() {
    return captureDecisionHistorySnapshot();
  }

  sampleRepository() {
    return executiveDecisionSampleRepository;
  }
}

export const executiveDecisionService = new ExecutiveDecisionService();

export function createDecision(input: CreateDecisionInput) {
  return executiveDecisionService.createDecision(input);
}

export function compareOptionsForDecision(decisionId: string) {
  return executiveDecisionService.compareOptions(decisionId);
}

export function recommendOptionForDecision(decisionId: string) {
  return executiveDecisionService.recommendOption(decisionId);
}

export function prepareImplementationForDecision(decisionId: string) {
  return executiveDecisionService.prepareImplementation(decisionId);
}

export function prepareApprovalForDecision(decisionId: string) {
  return executiveDecisionService.prepareApproval(decisionId);
}

export function prepareMonitoringForDecision(decisionId: string) {
  return executiveDecisionService.prepareMonitoring(decisionId);
}

export function reviewDecisionById(decisionId: string) {
  return executiveDecisionService.reviewDecision(decisionId);
}

export function rememberDecisionOutcome(decisionId: string) {
  return executiveDecisionService.rememberOutcome(decisionId);
}

export function resetRuntimeExecutiveDecisions() {
  runtimeDecisions.length = 0;
}
