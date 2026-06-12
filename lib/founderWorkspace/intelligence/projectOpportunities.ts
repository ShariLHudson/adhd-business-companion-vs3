import type { FounderWorkspaceData, FounderWorkspaceItem } from "../types";
import type {
  OpportunityImpact,
  OpportunityPriority,
  OpportunityStatus,
  ProjectOpportunity,
} from "./types";

const OPPORTUNITY_LINE =
  /^(?:opportunity|idea|upside)\s*:\s*(.+)$/i;

function newId(): string {
  return `po-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function inferImpact(text: string): OpportunityImpact {
  const lower = text.toLowerCase();
  if (/\b(high|major|significant|revenue|growth)\b/.test(lower)) return "high";
  if (/\b(low|minor|nice)\b/.test(lower)) return "low";
  return "medium";
}

function inferPriority(impact: OpportunityImpact): OpportunityPriority {
  if (impact === "high") return "high";
  if (impact === "low") return "low";
  return "medium";
}

export function inferOpportunitiesFromProject(
  project: FounderWorkspaceItem,
): Omit<ProjectOpportunity, "id">[] {
  const found: Omit<ProjectOpportunity, "id">[] = [];

  for (const line of project.description.split("\n")) {
    const match = line.trim().match(OPPORTUNITY_LINE);
    if (!match?.[1]) continue;
    const idea = match[1].trim();
    if (!idea) continue;
    const potentialImpact = inferImpact(idea);
    found.push({
      projectId: project.id,
      idea,
      potentialImpact,
      priority: inferPriority(potentialImpact),
      status: "open",
    });
  }

  if (
    found.length === 0 &&
    /\b(opportunity|dashboard|could|upside|expand)\b/i.test(
      `${project.title} ${project.description}`,
    )
  ) {
    const idea = `Expand "${project.title}" — potential upside identified in project notes`;
    found.push({
      projectId: project.id,
      idea,
      potentialImpact: "medium",
      priority: "medium",
      status: "open",
    });
  }

  return found;
}

export function mergeInferredOpportunities(
  existing: ProjectOpportunity[],
  project: FounderWorkspaceItem,
): ProjectOpportunity[] {
  const inferred = inferOpportunitiesFromProject(project);
  const forProject = existing.filter((o) => o.projectId === project.id);
  const others = existing.filter((o) => o.projectId !== project.id);
  const merged = [...forProject];

  for (const candidate of inferred) {
    const duplicate = merged.some(
      (o) =>
        o.status === "open" &&
        o.idea.toLowerCase() === candidate.idea.toLowerCase(),
    );
    if (!duplicate) {
      merged.push({ ...candidate, id: newId() });
    }
  }

  return [...others, ...merged];
}

export function syncOpportunitiesFromWorkspace(
  opportunities: ProjectOpportunity[],
  data: FounderWorkspaceData,
): ProjectOpportunity[] {
  let next = opportunities.filter((o) =>
    data.projects.some((p) => p.id === o.projectId),
  );
  for (const project of data.projects) {
    next = mergeInferredOpportunities(next, project);
  }
  return next;
}

export function getOpportunitiesForProject(
  opportunities: ProjectOpportunity[],
  projectId: string,
): ProjectOpportunity[] {
  return opportunities.filter((o) => o.projectId === projectId);
}

export function getOpenOpportunities(
  opportunities: ProjectOpportunity[],
): ProjectOpportunity[] {
  return opportunities.filter(
    (o) => o.status === "open" || o.status === "pursuing",
  );
}

export function topOpportunityForProject(
  opportunities: ProjectOpportunity[],
  projectId: string,
): ProjectOpportunity | null {
  const open = getOpportunitiesForProject(opportunities, projectId).filter(
    (o) => o.status === "open" || o.status === "pursuing",
  );
  if (open.length === 0) return null;
  const impactRank = { high: 3, medium: 2, low: 1 };
  return [...open].sort(
    (a, b) =>
      impactRank[b.potentialImpact] - impactRank[a.potentialImpact],
  )[0]!;
}

export function updateOpportunityStatus(
  opportunities: ProjectOpportunity[],
  opportunityId: string,
  status: OpportunityStatus,
): ProjectOpportunity[] {
  return opportunities.map((o) =>
    o.id === opportunityId ? { ...o, status } : o,
  );
}
