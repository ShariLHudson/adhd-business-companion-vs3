// Founder Ecosystem — Phase 12 Command Center Engine.
// Composes journey, OS, intelligence, board, actions into one calm state.

import type { FounderEvent, ID, WorkspaceKind } from "../events";
import { getFounderIntelligence } from "../intelligence";
import { buildBoardSummary, ADVISORS } from "../board";
import { getFounderOperatingState } from "../fos/founderOperatingState";
import { detectFounderJourney } from "../journey/founderJourneyEngine";
import { STAGE_LABEL } from "../journey/journeyTypes";
import { buildFounderMemory } from "../memory/founderMemoryEngine";
import { buildActionDashboard } from "../actions/actionDashboard";
import type {
  CapacityRecommendation,
  CommandCenterCapacity,
  CommandCenterCurrentWork,
  CommandCenterDecision,
  CommandCenterMomentum,
  CommandCenterNextAction,
  CommandCenterOpportunity,
  CommandCenterState,
  CommandCenterToday,
  ProjectAttentionItem,
} from "./commandCenterTypes";
import { generateMorningBriefing } from "./morningBriefingGenerator";

const WORKSPACE_LABEL: Record<WorkspaceKind, string> = {
  create: "Create",
  projects: "Projects",
  "time-block": "Time Block",
  templates: "Templates",
  "clear-my-mind": "Clear My Mind",
  strategies: "Playbook",
  "focus-audio": "Focus Audio",
  breathe: "Breathe",
  "spin-wheel": "Spin Wheel",
};

function deriveCurrentWork(
  events: FounderEvent[],
  founderId: ID,
  recommendation: string | null,
  projectName: string | null,
): CommandCenterCurrentWork {
  const mine = events
    .filter((e) => e.founderId === founderId)
    .slice()
    .sort((a, b) => (a.ts < b.ts ? 1 : -1));

  const lastDoc = mine.find((e) => e.type === "document.created");
  const openBlock = mine.find(
    (e) =>
      e.type === "timeblock.created" &&
      !mine.some(
        (c) =>
          c.type === "timeblock.completed" &&
          c.refs?.timeBlockId === e.refs?.timeBlockId,
      ),
  );
  const openFocus = mine.find(
    (e) =>
      e.type === "focus.started" &&
      !mine.some(
        (c) =>
          c.type === "focus.completed" &&
          c.ts > e.ts &&
          c.refs?.projectId === e.refs?.projectId,
      ),
  );
  const lastWorkspace = mine.find((e) => e.type === "workspace.opened");

  const document =
    typeof lastDoc?.data?.title === "string" ? lastDoc.data.title : null;
  const timeBlock =
    openBlock && typeof openBlock.data?.durationMin === "number"
      ? `${openBlock.data.durationMin} min block`
      : null;
  const focusSession = openFocus
    ? `${openFocus.data?.plannedMinutes ?? 25} min focus`
    : null;
  const openWorkspace = lastWorkspace?.refs?.workspace
    ? WORKSPACE_LABEL[lastWorkspace.refs.workspace]
    : null;

  return {
    project: projectName,
    document,
    timeBlock,
    focusSession,
    recommendation,
    openWorkspace,
    canResume: Boolean(document || timeBlock || focusSession || openWorkspace),
  };
}

function mapProjectsNeedingAttention(
  os: ReturnType<typeof getFounderOperatingState>,
): ProjectAttentionItem[] {
  return os.projectHealth
    .filter(
      (p) =>
        p.rating === "at-risk" ||
        p.rating === "stalled" ||
        p.rating === "needs-attention" ||
        (p.daysSinceActivity ?? 0) >= 14,
    )
    .slice(0, 6)
    .map((p) => ({
      projectId: p.projectId,
      name: p.name,
      status:
        p.rating === "stalled"
          ? "stalled"
          : p.rating === "at-risk"
            ? "at-risk"
            : (p.daysSinceActivity ?? 0) >= 21
              ? "inactive"
              : "blocked",
      lastActivity: p.lastActivity,
      nextAction: os.priorities.find((x) => x.projectId === p.projectId)
        ?.recommendedAction ?? null,
      healthScore: p.healthScore,
    }));
}

function mapOpportunities(
  memory: ReturnType<typeof buildFounderMemory>,
): CommandCenterOpportunity[] {
  return memory.opportunities
    .filter((o) => o.status !== "completed")
    .slice(0, 6)
    .map((o) => {
      const t = o.idea.toLowerCase();
      let category: CommandCenterOpportunity["category"] = "idea";
      if (/\brevenue|sales|client|offer|pricing\b/.test(t)) category = "revenue";
      else if (/\bgrow|expand|scale|launch\b/.test(t)) category = "growth";
      else if (/\bnew|could|what if\b/.test(t)) category = "new";
      return {
        id: o.id,
        text: o.idea,
        category,
        impact: o.potentialImpact,
      };
    });
}

function mapDecisions(
  memory: ReturnType<typeof buildFounderMemory>,
): CommandCenterDecision[] {
  return memory.decisions
    .filter((d) => !/decided|done|complete/i.test(d.status))
    .slice(0, 5)
    .map((d) => {
      const projectId = d.relatedProjectIds[0];
      const project = projectId
        ? memory.projects.find((p) => p.projectId === projectId)
        : undefined;
      return {
        id: d.id,
        decision: d.decision,
        status: d.status,
        project: project?.name ?? null,
        ageDays: null,
        recommendedNextStep: d.outcome
          ? null
          : project?.nextStep ?? "Talk it through — pick one path and try it.",
      };
    });
}

function capacityRecommendation(
  state: ReturnType<typeof getFounderOperatingState>,
): { kind: CapacityRecommendation; text: string } {
  if (
    state.attention.level === "overloaded" ||
    state.capacity.level === "low"
  ) {
    return {
      kind: "protect-focus",
      text: "Protect focus — trim today to one thing and one time block.",
    };
  }
  if (
    state.attention.openPriorities > 4 ||
    state.capacity.activeCommitments > 8
  ) {
    return {
      kind: "reduce-commitments",
      text: "Reduce commitments — park or postpone lower-priority items.",
    };
  }
  return {
    kind: "continue-pace",
    text: "Continue current pace — you have room for steady progress.",
  };
}

function buildNextAction(
  os: ReturnType<typeof getFounderOperatingState>,
  journey: ReturnType<typeof detectFounderJourney>,
  actionDash: ReturnType<typeof buildActionDashboard>,
): CommandCenterNextAction {
  const founderAction = actionDash.currentAction;

  const title =
    founderAction?.title ??
    os.currentFocus?.action ??
    journey.recommendations[0]?.text ??
    "Choose one meaningful step";

  const reasons: string[] = [];
  if (os.priorities[0]?.name) reasons.push("Highest priority");
  if (os.momentum.direction === "rising") reasons.push("Highest momentum");
  if (os.topGoal) reasons.push("Supports current goal");
  if (!reasons.length) reasons.push("Clearest next step right now");

  const reason = reasons.slice(0, 2).join(" · ");

  return {
    title,
    reason,
    reasons,
    action: founderAction,
  };
}

function buildToday(
  os: ReturnType<typeof getFounderOperatingState>,
  journey: ReturnType<typeof detectFounderJourney>,
): CommandCenterToday {
  return {
    focus: journey.primaryFocus
      ? journey.primaryFocus.replace(/-/g, " ")
      : os.topGoal,
    topPriority: os.priorities[0]?.name ?? null,
    nextActionLabel:
      os.nextAction?.action ?? os.currentFocus?.action ?? null,
    currentProject: os.currentFocus?.name ?? os.activeProject?.name ?? null,
    currentStage: journey.currentStage,
    stageLabel: STAGE_LABEL[journey.currentStage],
    capacityLevel: os.capacity.level,
    capacityScore: os.capacity.score,
    momentumDirection: os.momentum.direction,
    momentumScore: os.momentum.score,
  };
}

export type CommandCenterOptions = {
  now?: Date;
};

export function buildCommandCenterState(
  events: FounderEvent[],
  founderId: ID = "founder-001",
  opts: CommandCenterOptions = {},
): CommandCenterState {
  const now = opts.now ?? new Date();
  const intel = getFounderIntelligence(events, founderId, now.toISOString());
  const os = getFounderOperatingState(events, founderId, { now, intel });
  const journey = detectFounderJourney(events, founderId, { now, intel });
  const memory = buildFounderMemory(
    events.filter((e) => e.founderId === founderId),
    founderId,
    intel,
  );
  const board = buildBoardSummary(intel);
  const actionDash = buildActionDashboard(events, founderId);
  const cap = capacityRecommendation(os);
  const briefing = generateMorningBriefing(os, events, founderId, intel, now);
  const next = buildNextAction(os, journey, actionDash);
  const today = buildToday(os, journey);

  const advisorName = board.mostActiveAdvisor
    ? ADVISORS[board.mostActiveAdvisor].name
    : null;

  const capacity: CommandCenterCapacity = {
    level: os.capacity.level,
    score: os.capacity.score,
    workload: os.capacity.workload,
    attentionLoad: os.attention.level,
    projectLoad: os.attention.activeProjects,
    commitmentLoad: os.capacity.activeCommitments,
    recommendation: cap.kind,
    recommendationText: cap.text,
  };

  const momentum: CommandCenterMomentum = {
    winsThisWeek: os.momentum.wins,
    tasksCompleted: os.momentum.tasksCompleted,
    projectsAdvanced: os.momentum.projectsAdvanced,
    focusSessions: os.momentum.focusSessions,
    timeBlocksCompleted: os.momentum.timeBlocksCompleted,
    trend: os.momentum.direction,
    trendDirection: os.momentum.direction,
  };

  return {
    founderId,
    generatedAt: now.toISOString(),
    today,
    briefing,
    currentWork: deriveCurrentWork(
      events,
      founderId,
      next.title,
      today.currentProject,
    ),
    advisorBoard: {
      mostActiveAdvisor: board.mostActiveAdvisor,
      mostActiveAdvisorName: advisorName,
      currentRecommendations: board.currentRecommendations,
      priorityRecommendation: board.currentRecommendations[0]?.text ?? null,
      riskRecommendation: board.topRisks[0]?.suggestedAction ?? null,
      opportunityRecommendation: board.topOpportunities[0]?.text ?? null,
    },
    projects: mapProjectsNeedingAttention(os),
    opportunities: mapOpportunities(memory),
    decisions: mapDecisions(memory),
    momentum,
    capacity,
    nextAction: next,
  };
}
