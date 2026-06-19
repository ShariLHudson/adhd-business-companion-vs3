/**
 * Decision Compass → Project execution bridge.
 */

import { saveProject } from "./companionStore";
import {
  buildDecisionActionPlan,
  buildDecisionExplorationState,
  saveDecisionToSavedWork,
} from "./decisionCompassExploration";
import type { PersistedDecisionCompassSession } from "./decisionCompassSessionStore";
import { buildDecisionRecommendationReport } from "./decisionRecommendationReport";
import {
  saveProjectStructure,
  type DocumentMilestone,
} from "./projectStructure";

export type DecisionProjectSaveResult = {
  projectId: string;
  projectName: string;
  milestoneCount: number;
  taskCount: number;
  savedWorkId: string;
};

export function buildDecisionProjectMilestones(
  session: PersistedDecisionCompassSession,
): DocumentMilestone[] {
  const report = buildDecisionRecommendationReport(session);
  const exp = buildDecisionExplorationState(session);
  const plan = exp?.actionPlan ?? buildDecisionActionPlan(session);
  const rec = session.recommendation;
  const milestones: DocumentMilestone[] = [];

  const summaryNotes: string[] = [];
  if (session.decision?.trim()) {
    summaryNotes.push(`Decision: ${session.decision.trim()}`);
  }
  if (session.optionA?.trim() && session.optionB?.trim()) {
    summaryNotes.push(`Options: ${session.optionA} vs ${session.optionB}`);
  }
  milestones.push({
    title: "Decision Summary",
    tasks: [],
    notes:
      summaryNotes.length > 0
        ? summaryNotes
        : ["Review the decision context"],
  });

  if (rec) {
    milestones.push({
      title: "Recommended Direction",
      tasks: [],
      notes: [
        `Lean: ${rec.choice}`,
        rec.headline,
        rec.summary.replace(/\*\*/g, ""),
      ].filter(Boolean),
    });
  }

  if (plan?.steps.length) {
    milestones.push({
      title: "Action Plan",
      tasks: plan.steps,
    });
  }

  const risks = report?.potentialConcerns ?? [];
  if (risks.length) {
    milestones.push({
      title: "Risks To Watch",
      tasks: risks,
    });
  }

  const alt = exp?.alternativePaths;
  if (alt) {
    milestones.push({
      title: "Alternative Paths",
      tasks: [],
      notes: [
        `Primary: ${alt.primary}`,
        ...alt.alternatives.map((a) => `Alternative: ${a}`),
        ...alt.experimental.map((e) => `Experiment: ${e}`),
      ],
    });
  }

  return milestones;
}

function decisionProjectTitle(session: PersistedDecisionCompassSession): string {
  return (
    session.decision?.trim().slice(0, 80) ||
    session.recommendation?.choice?.slice(0, 80) ||
    "Decision Compass"
  );
}

export function createDecisionProject(
  session: PersistedDecisionCompassSession,
): DecisionProjectSaveResult {
  const projectName = decisionProjectTitle(session);
  const rec = session.recommendation;
  const plan = buildDecisionExplorationState(session)?.actionPlan ??
    buildDecisionActionPlan(session);

  const projects = saveProject({
    name: projectName,
    goal:
      rec?.summary.replace(/\*\*/g, "").slice(0, 160) ||
      "Follow through on this decision",
    goals: ["Decision Summary", "Action Plan", "Risks To Watch"],
    nextAction: plan?.steps[0] ?? "Review decision summary",
    status: "in-progress",
    horizon: "now",
  });
  const projectId = projects[0]!.id;

  const { milestoneCount, taskCount } = saveProjectStructure(
    projectId,
    buildDecisionProjectMilestones(session),
  );
  const { itemId } = saveDecisionToSavedWork(session, projectId, projectName);

  return {
    projectId,
    projectName,
    milestoneCount,
    taskCount,
    savedWorkId: itemId,
  };
}

export function addDecisionToProject(
  session: PersistedDecisionCompassSession,
  projectId: string,
  projectName: string,
): DecisionProjectSaveResult {
  const { milestoneCount, taskCount } = saveProjectStructure(
    projectId,
    buildDecisionProjectMilestones(session),
  );
  const { itemId } = saveDecisionToSavedWork(session, projectId, projectName);

  return {
    projectId,
    projectName,
    milestoneCount,
    taskCount,
    savedWorkId: itemId,
  };
}

/** @internal tests — picker required when user chooses project flow without preset project. */
export function decisionSaveShowsProjectPicker(
  activeProjectId: string | null | undefined,
): boolean {
  return !activeProjectId;
}
