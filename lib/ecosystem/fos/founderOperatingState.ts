// Founder Ecosystem — Phase 8 Founder Operating State (the OS core).
// Composes capacity, momentum, project health, priorities, next actions and
// attention into one live state, then exposes getFounderOperatingState() and
// the natural-language "ask" helpers behind the success criteria. Pure.

import type { FounderEvent, ID } from "../events";
import type { FounderIntelligence } from "../intelligence/intelligenceTypes";
import { getFounderIntelligence } from "../intelligence/founderIntelligenceEngine";
import { buildFounderMemory } from "../memory/founderMemoryEngine";
import { buildFounderDashboard } from "../founderDashboard/founderDashboard";
import { computeCapacity } from "./capacityEngine";
import { computeMomentum } from "./momentumEngine";
import { computeProjectHealth } from "./projectHealthEngine";
import { computePriorities } from "./priorityEngine";
import { nextActionsForAll, nextActionForProject } from "./nextActionEngine";
import { computeAttention } from "./attentionEngine";
import type {
  FounderOperatingState,
  Level,
  NextAction,
  OpportunitySummary,
  PriorityItem,
  ProjectHealth,
  RiskSummary,
} from "./fosTypes";

const riskLevelFrom = (risks: { severity: Level }[]): Level => {
  if (risks.some((r) => r.severity === "high") || risks.length >= 3) return "high";
  if (risks.length >= 1) return "medium";
  return "low";
};

const opportunityLevelFrom = (count: number): Level =>
  count >= 4 ? "high" : count >= 1 ? "medium" : "low";

export type OperatingStateOptions = {
  now?: Date;
  intel?: FounderIntelligence;
};

export function getFounderOperatingState(
  events: FounderEvent[],
  founderId: ID,
  opts: OperatingStateOptions = {},
): FounderOperatingState {
  const now = opts.now ?? new Date();
  const mine = events.filter((e) => e.founderId === founderId);
  const intel = opts.intel ?? getFounderIntelligence(mine, founderId, now.toISOString());
  const memory = buildFounderMemory(mine, founderId, intel);
  const dashboard = buildFounderDashboard(mine, founderId, { now, intel, period: "30d" });

  // Capacity.
  const scheduledBlocks = mine.filter((e) => e.type === "timeblock.created").length;
  const capacity = computeCapacity(
    mine,
    founderId,
    intel,
    {
      openTasks: dashboard.summary.openTasks,
      openProjects: dashboard.summary.activeProjects,
      openDecisions: dashboard.summary.openDecisions,
      scheduledBlocks,
    },
    now,
  );

  // Momentum + project health.
  const momentum = computeMomentum(mine, founderId, now);
  const projectHealth = computeProjectHealth(memory, intel, mine, now);

  // Top goal (most-mentioned at check-ins).
  const topGoal =
    dashboard.goals.slice().sort((a, b) => b.mentions - a.mentions)[0]?.label ?? null;

  // Priorities + next actions.
  const priorities = computePriorities(memory, projectHealth, intel, capacity, topGoal);
  const allNextActions = nextActionsForAll(memory, projectHealth, intel);

  // Attention.
  const attention = computeAttention({
    activeProjects: dashboard.summary.activeProjects,
    openPriorities: priorities.length,
    openOpportunities: dashboard.summary.openOpportunities,
    openTasks: dashboard.summary.openTasks,
    openDecisions: dashboard.summary.openDecisions,
  });

  // Risk / opportunity summaries + levels.
  const risks: RiskSummary[] = intel.risks.map((r) => ({
    id: r.id,
    label: r.label,
    severity: r.severity,
    projectId: r.relatedProjectIds[0],
  }));
  const opportunities: OpportunitySummary[] = memory.opportunities
    .filter((o) => o.status !== "completed")
    .map((o) => ({
      id: o.id,
      text: o.idea,
      impact: o.potentialImpact,
      projectId: o.relatedProjectId,
    }));

  // Current focus = top priority project + its next action.
  const topPriority: PriorityItem | undefined = priorities[0];
  const topProject = topPriority
    ? memory.projects.find((p) => p.projectId === topPriority.projectId)
    : undefined;
  const topHealth: ProjectHealth | undefined = topPriority
    ? projectHealth.find((h) => h.projectId === topPriority.projectId)
    : undefined;
  const nextAction: NextAction | null = topProject
    ? nextActionForProject(topProject, topHealth, intel)
    : null;

  const currentFocus = topPriority
    ? {
        projectId: topPriority.projectId,
        name: topPriority.name,
        action: topPriority.recommendedAction,
      }
    : null;

  // Active project = most recently active by health record.
  const activeProject =
    projectHealth
      .slice()
      .sort((a, b) => ((a.lastActivity ?? "") < (b.lastActivity ?? "") ? 1 : -1))[0] ?? null;

  return {
    founderId,
    generatedAt: now.toISOString(),
    currentFocus,
    activeProject,
    topGoal,
    capacity,
    momentum,
    riskLevel: riskLevelFrom(intel.risks),
    opportunityLevel: opportunityLevelFrom(opportunities.length),
    risks,
    opportunities,
    attention,
    nextAction,
    recommendedNextAction: nextAction,
    priorities,
    projectHealth: projectHealth.map((h) => ({
      ...h,
      // attach the per-project next action label for convenience consumers.
    })),
  };
}

// ---- The questions the founder should be able to ask --------------------
export function whatShouldIWorkOn(state: FounderOperatingState): string {
  if (!state.currentFocus) return "Nothing pressing — pick something that energizes you.";
  return `${state.currentFocus.action} (on ${state.currentFocus.name}).`;
}

export function whatIsMostImportant(state: FounderOperatingState): PriorityItem | null {
  return state.priorities[0] ?? null;
}

export function whatAmIForgetting(state: FounderOperatingState): string[] {
  const out: string[] = [];
  for (const h of state.projectHealth.filter((p) => p.rating === "stalled"))
    out.push(`${h.name} has gone quiet (${h.daysSinceActivity ?? "?"} days).`);
  for (const o of state.opportunities.filter((o) => o.impact === "high"))
    out.push(`High-impact idea still parked: ${o.text}`);
  if (state.attention.openPriorities > 5)
    out.push("Several priorities are open at once — worth trimming.");
  return out;
}

export function whereAmIStuck(state: FounderOperatingState): ProjectHealth[] {
  return state.projectHealth.filter(
    (p) => p.rating === "stalled" || p.rating === "at-risk",
  );
}

export function whatNeedsAttention(state: FounderOperatingState): string[] {
  const out = [...state.attention.competing];
  for (const p of state.projectHealth.filter((x) => x.rating === "needs-attention"))
    out.push(`${p.name}: ${p.reasons[0]}`);
  return out;
}
