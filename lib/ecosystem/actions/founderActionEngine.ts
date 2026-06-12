// Founder Ecosystem — Phase 11 Action Engine.
//
// Converts recommendations → executable FounderAction objects with workspace
// targets, prefills, and tracked status. Pure derivation + reconciliation.

import type { FounderEvent, ID } from "../events";
import type { Level } from "../dashboardTypes";
import type { FounderIntelligence, FounderRecommendation } from "../intelligence/intelligenceTypes";
import type { ExecutionStep } from "../ops/advisorExecutionEngine";
import type { JourneyRecommendation } from "../journey/journeyTypes";
import type { PriorityItem } from "../fos/fosTypes";
import { routeAdvisors } from "../board/advisorRouter";
import type {
  ActionSource,
  FounderAction,
  FounderActionStatus,
} from "./actionTypes";
import { mapTextToWorkspace } from "./workspaceMapper";

const now = () => new Date().toISOString();

function projectTitle(events: FounderEvent[], pid?: ID): string | undefined {
  if (!pid) return undefined;
  const t = events.find(
    (e) => e.type === "project.created" && e.refs?.projectId === pid,
  )?.data?.title;
  return typeof t === "string" ? t : undefined;
}

function actionIdFromSource(source: ActionSource): string {
  switch (source.kind) {
    case "intelligence":
      return `action-rec-${source.recommendationId}`;
    case "journey":
      return `action-journey-${source.focus}`;
    case "execution-step":
      return `action-step-${source.stepId}`;
    case "operating-state":
      return `action-priority-${source.priorityRank}`;
    case "manual":
      return `action-manual-${Date.now()}`;
  }
}

export function buildFounderAction(
  text: string,
  opts: {
    reason?: string;
    priority?: Level;
    advisorSource?: FounderAction["advisorSource"];
    projectId?: ID;
    projectTitle?: string;
    taskId?: ID;
    taskTitle?: string;
    documentId?: ID;
    documentTitle?: string;
    goalId?: ID;
    sourceEventIds?: ID[];
    source: ActionSource;
    status?: FounderActionStatus;
    durationMinutes?: number;
  },
  events: FounderEvent[] = [],
): FounderAction {
  const pid = opts.projectId;
  const pTitle = opts.projectTitle ?? projectTitle(events, pid);
  const mapped = mapTextToWorkspace({
    text,
    reason: opts.reason,
    projectId: pid,
    projectTitle: pTitle,
    taskId: opts.taskId,
    taskTitle: opts.taskTitle,
    documentId: opts.documentId,
    documentTitle: opts.documentTitle,
    goalId: opts.goalId,
    durationMinutes: opts.durationMinutes,
  });

  const id = actionIdFromSource(opts.source);

  return {
    id,
    title: mapped.title,
    description: mapped.description,
    actionType: mapped.actionType,
    priority: opts.priority ?? "medium",
    advisorSource: opts.advisorSource,
    relatedProject: pid ? { id: pid, title: pTitle } : undefined,
    relatedGoal: opts.goalId ? { id: opts.goalId } : undefined,
    relatedDocument: opts.documentId
      ? {
          id: opts.documentId,
          title: opts.documentTitle,
          kind: mapped.workspace.googleExportKind,
        }
      : undefined,
    workspace: mapped.workspace,
    prefill: mapped.prefill,
    status: opts.status ?? "offered",
    sourceEventIds: opts.sourceEventIds ?? [],
    recommendationText: text,
    nextStep: mapped.nextStep,
    createdAt: now(),
    emoji: mapped.emoji,
  };
}

export function actionFromRecommendation(
  rec: FounderRecommendation,
  events: FounderEvent[] = [],
): FounderAction {
  const advisor = routeAdvisors(`${rec.text} ${rec.reason}`).primary;
  const pid = rec.relatedObjectIds[0];
  return buildFounderAction(
    rec.text,
    {
      reason: rec.reason,
      priority: rec.confidence,
      advisorSource: advisor,
      projectId: pid,
      sourceEventIds: rec.sourceEventIds,
      source: { kind: "intelligence", recommendationId: rec.id },
    },
    events,
  );
}

export function actionFromJourneyRecommendation(
  rec: JourneyRecommendation,
  events: FounderEvent[] = [],
  projectId?: ID,
): FounderAction {
  return buildFounderAction(
    rec.text,
    {
      reason: rec.reason,
      priority: "high",
      projectId,
      source: { kind: "journey", focus: rec.focus },
    },
    events,
  );
}

export function actionFromExecutionStep(
  step: ExecutionStep,
  events: FounderEvent[] = [],
): FounderAction {
  return buildFounderAction(
    step.action,
    {
      reason: step.reason,
      priority: step.priority,
      advisorSource: step.advisor,
      projectId: step.context.projectId,
      projectTitle: step.context.projectTitle,
      taskId: step.context.taskId,
      sourceEventIds: step.sourceEventIds,
      source: { kind: "execution-step", stepId: step.id },
      status: step.status === "done" ? "completed" : step.status === "skipped" ? "skipped" : "offered",
    },
    events,
  );
}

export function actionFromPriority(
  item: PriorityItem,
  rank: number,
  events: FounderEvent[] = [],
): FounderAction {
  return buildFounderAction(
    item.recommendedAction,
    {
      reason: item.reasons.join(" "),
      priority: item.score >= 70 ? "high" : item.score >= 40 ? "medium" : "low",
      projectId: item.projectId,
      projectTitle: item.name,
      source: { kind: "operating-state", priorityRank: rank },
    },
    events,
  );
}

export type GenerateActionsInput = {
  intelligence?: FounderIntelligence;
  journeyRecommendations?: JourneyRecommendation[];
  executionSteps?: ExecutionStep[];
  priorities?: PriorityItem[];
  events?: FounderEvent[];
  limit?: number;
};

/** Generate deduplicated actions from all recommendation sources. */
export function generateFounderActions(input: GenerateActionsInput): FounderAction[] {
  const events = input.events ?? [];
  const limit = input.limit ?? 12;
  const actions: FounderAction[] = [];
  const seen = new Set<string>();

  const push = (action: FounderAction) => {
    const key = action.title.toLowerCase().trim();
    if (seen.has(key)) return;
    seen.add(key);
    actions.push(action);
  };

  if (input.priorities?.length) {
    for (const [i, p] of input.priorities.entries()) {
      push(actionFromPriority(p, i + 1, events));
    }
  }

  if (input.intelligence?.recommendations.length) {
    for (const rec of input.intelligence.recommendations) {
      push(actionFromRecommendation(rec, events));
    }
  }

  if (input.journeyRecommendations?.length) {
    for (const rec of input.journeyRecommendations) {
      push(actionFromJourneyRecommendation(rec, events));
    }
  }

  if (input.executionSteps?.length) {
    for (const step of input.executionSteps) {
      if (step.status !== "pending") continue;
      push(actionFromExecutionStep(step, events));
    }
  }

  return actions.slice(0, limit);
}
