import type { ExecutiveInitiative, ExecutiveMonitoring, ExecutiveProgress } from "../types";
import { buildExecutivePlan } from "../planning/implementationPlans";

export function computeProgress(initiative: ExecutiveInitiative): ExecutiveProgress {
  const plan = buildExecutivePlan(initiative);
  const tasks = plan.tasks;
  const complete = tasks.filter((t) => t.status === "completed").length;
  const blocked = tasks.filter((t) => t.status === "blocked").length;
  const atRisk = tasks.filter((t) => t.status === "at_risk").length;
  const waitingOn = tasks
    .filter((t) => t.status === "waiting_on")
    .map((t) => t.title);

  const stepProgress = initiative.completedSteps.length / 12;
  const taskProgress = tasks.length ? complete / tasks.length : 0;
  const percentComplete = Math.round((stepProgress * 0.6 + taskProgress * 0.4) * 100);

  return {
    initiativeId: initiative.id,
    percentComplete,
    tasksTotal: tasks.length,
    tasksComplete: complete,
    blockedCount: blocked,
    atRiskCount: atRisk,
    waitingOn,
    updatedAt: new Date().toISOString(),
  };
}

export function prepareMonitoring(initiative: ExecutiveInitiative): ExecutiveMonitoring {
  if (initiative.monitoring) return initiative.monitoring;

  const progress = computeProgress(initiative);
  const needsFounderDecision = initiative.approvals.some(
    (a) => a.requiresExplicitApproval && a.status === "pending",
  );

  let status = initiative.status;
  if (progress.blockedCount > 0) status = "blocked";
  else if (progress.atRiskCount > 0) status = "at_risk";
  else if (needsFounderDecision) status = "needs_founder_decision";

  return {
    initiativeId: initiative.id,
    status,
    progress,
    blockers: progress.blockedCount
      ? [{ id: "blk-1", label: "Blocked task", waitingOn: "Founder decision", status: "open", notes: "Sample blocker." }]
      : [],
    risks: [],
    needsFounderDecision,
    briefFeedItems: [
      `${initiative.title}: ${progress.percentComplete}% prepared`,
      needsFounderDecision ? "Awaiting Founder approval" : "No pending approvals",
    ],
  };
}

export function updateProgress(
  initiative: ExecutiveInitiative,
  patch: Partial<ExecutiveProgress>,
): ExecutiveProgress {
  const current = computeProgress(initiative);
  return { ...current, ...patch, updatedAt: new Date().toISOString() };
}
