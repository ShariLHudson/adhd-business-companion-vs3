// Founder Ecosystem — Phase 6 Memory Selectors.
// Dashboard-ready views over a FounderMemory: recent decisions, recent wins,
// project relationships, the opportunity network, current risks, and the single
// most important piece of context to surface right now. Pure.

import type { ID } from "../events";
import { accomplishedSince, subgraph } from "./memoryQueries";
import type {
  DecisionMemory,
  FounderMemory,
  GraphNode,
  OpportunityMemory,
  ProjectMemory,
  RelationshipGraph,
} from "./memoryTypes";

export function recentDecisions(
  memory: FounderMemory,
  limit = 5,
): DecisionMemory[] {
  // events are appended in order, so later array position == more recent.
  return memory.decisions.slice(-limit).reverse();
}

export function recentWins(memory: FounderMemory, sinceDays = 30): GraphNode[] {
  const cutoff = new Date(Date.now() - sinceDays * 86_400_000).toISOString();
  return accomplishedSince(memory.graph, cutoff).sort((a, b) =>
    (a.lastActivity ?? "") < (b.lastActivity ?? "") ? 1 : -1,
  );
}

/** A project plus everything one hop away — ready to draw. */
export function projectRelationships(
  memory: FounderMemory,
  projectId: ID,
): { project: ProjectMemory | null; graph: RelationshipGraph } {
  return {
    project: memory.projects.find((p) => p.projectId === projectId) ?? null,
    graph: subgraph(memory.graph, projectId, 1),
  };
}

/** Opportunities grouped by the project they came from (or "Unattached"). */
export function opportunityNetwork(
  memory: FounderMemory,
): { project: string; opportunities: OpportunityMemory[] }[] {
  const nameById = new Map(memory.projects.map((p) => [p.projectId, p.name]));
  const groups = new Map<string, OpportunityMemory[]>();
  for (const o of memory.opportunities) {
    const key = o.relatedProjectId
      ? nameById.get(o.relatedProjectId) ?? "Unattached"
      : "Unattached";
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(o);
  }
  return [...groups.entries()].map(([project, opportunities]) => ({
    project,
    opportunities,
  }));
}

export function currentRisks(
  memory: FounderMemory,
): { project: string; type: string; label: string }[] {
  return memory.projects.flatMap((p) =>
    p.risks.map((r) => ({ project: p.name, type: r.type, label: r.label })),
  );
}

/** The one thing worth surfacing first: active project + why + what's next. */
export function mostImportantContext(memory: FounderMemory): {
  project: ProjectMemory | null;
  why: string | null;
  nextStep: string | null;
  openDecision: DecisionMemory | null;
} {
  const project =
    memory.projects
      .slice()
      .sort((a, b) => ((a.lastActivity ?? "") < (b.lastActivity ?? "") ? 1 : -1))[0] ??
    null;
  const openDecision =
    memory.decisions.find(
      (d) => d.status === "open" && (!project || d.relatedProjectIds.includes(project.projectId)),
    ) ?? null;
  return {
    project,
    why: project?.purpose ?? null,
    nextStep: project?.nextStep ?? null,
    openDecision,
  };
}
